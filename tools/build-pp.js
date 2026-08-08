#!/usr/bin/env node
/**
 * build-pp.js — static project pages + head metadata for sfpowerplay.com
 *
 * TWO PROBLEMS THIS FIXES
 * 1. Eight of nine pages ship with NO <title>, no meta description and no
 *    canonical. Only index.html has them. Google was given nothing to
 *    distinguish one page from another — hence "Crawled - currently not
 *    indexed" and "Discovered - currently not indexed".
 * 2. All nine portfolio projects live behind portfolio.html?p=<key>, a
 *    dc-runtime shell whose body is {{ }} placeholders. Google sees one blank
 *    page, not nine projects.
 *
 * Renders each ?p= route through jsdom and writes it as a real page.
 *
 * Usage: PP_SITE=/path/to/sfpowerplay node build-pp.js [--dry]
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const SITE = process.env.PP_SITE || process.argv[2];
const DRY = process.argv.includes('--dry');
const ORIGIN = 'https://sfpowerplay.com';
const NM = process.env.NM || '/tmp/pre/node_modules';

const REACT = fs.readFileSync(`${NM}/react/umd/react.production.min.js`, 'utf8');
const REACT_DOM = fs.readFileSync(`${NM}/react-dom/umd/react-dom.production.min.js`, 'utf8');
const BABEL = fs.readFileSync(`${NM}/@babel/standalone/babel.min.js`, 'utf8');

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---- project data lives in portfolio.html's DATA object ---- */
const portfolioSrc = fs.readFileSync(path.join(SITE, 'portfolio.html'), 'utf8');
const lines = portfolioSrc.split('\n');
const s0 = lines.findIndex(l => l.includes('const DATA = {'));
let s1 = s0; let depth = 0;
for (; s1 < lines.length; s1++) {
  depth += (lines[s1].match(/{/g) || []).length - (lines[s1].match(/}/g) || []).length;
  if (s1 > s0 && depth <= 0) break;
}
const DATA = eval('(' + lines.slice(s0, s1 + 1).join('\n')
  .replace(/^\s*const DATA\s*=\s*/, '').replace(/;\s*$/, '') + ')');

/* readable, stable slugs (no clash with index/work/portfolio/case-studies/contact) */
const SLUG = {
  openai: 'openai.html', meta: 'meta.html', bitgo: 'bitgo.html',
  googleio: 'google-io.html', servicenow: 'servicenow.html',
  sfsymphony: 'sf-symphony.html', swimlane: 'swimlane.html',
  sui: 'sui.html', psilo: 'psilo.html',
};

function render(relUrl) {
  return new Promise((resolve, reject) => {
    const file = relUrl.split('?')[0];
    const html = fs.readFileSync(path.join(SITE, file), 'utf8');
    const vc = new VirtualConsole();
    vc.on('jsdomError', e => { if (!/Not implemented/.test(e.message)) console.error('  [jsdom]', e.message); });

    const dom = new JSDOM(html, {
      url: `${ORIGIN}/${relUrl}`,
      runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    });
    const { window } = dom;
    window.matchMedia = window.matchMedia || (q => ({
      matches: false, media: q, addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; },
    }));
    window.scrollTo = () => {};
    window.fetch = () => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(html) });
    if (!window.IntersectionObserver) window.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} takeRecords(){return[]} };
    if (!window.ResizeObserver) window.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };

    const inject = code => { const s = window.document.createElement('script'); s.textContent = code; window.document.head.appendChild(s); };
    inject(REACT); inject(REACT_DOM); inject(BABEL);
    try { inject(fs.readFileSync(path.join(SITE, 'support.js'), 'utf8')); } catch (e) {}

    setTimeout(() => {
      const doc = window.document;
      const host = doc.getElementById('dc-root') || doc.body;
      if ((host.textContent || '').trim().length < 150) return reject(new Error(`no content for ${relUrl}`));
      const runtimeCss = [...doc.head.querySelectorAll('style')].map(x => x.textContent).join('\n');
      resolve({ doc, host, runtimeCss, window });
    }, 4000);
  });
}

/* background-image -> real <img>; promote first heading to <h1> */
function semantics(host, doc, h1Text) {
  let imgs = 0, h1 = false;
  host.querySelectorAll('div[style*="background-image"]').forEach(div => {
    const st = div.style; const raw = st.backgroundImage || '';
    if (raw.includes('var(')) return;
    const m = raw.match(/url\(["']?([^"')]+)["']?\)/); if (!m) return;
    const img = doc.createElement('img');
    img.setAttribute('src', m[1]);
    img.setAttribute('loading', 'lazy'); img.setAttribute('decoding', 'async');
    img.setAttribute('alt', `${h1Text} — Powerplay project image`);
    const size = (st.backgroundSize || 'cover').trim();
    const fit = /^(contain|cover)$/.test(size) ? size : 'cover';
    img.setAttribute('style',
      `position:absolute;inset:0;width:100%;height:100%;display:block;` +
      `object-fit:${fit};object-position:${(st.backgroundPosition || 'center').trim()};`);
    div.replaceWith(img); imgs++;
  });
  const h = host.querySelector('h1, h2');
  if (h && h.tagName === 'H2' && h.textContent.trim() === h1Text) {
    const n = doc.createElement('h1');
    for (const a of [...h.attributes]) n.setAttribute(a.name, a.value);
    n.innerHTML = h.innerHTML; h.replaceWith(n); h1 = true;
  } else if (h && h.tagName === 'H1') h1 = true;
  return { imgs, h1 };
}

function headFor({ slug, title, desc, jsonld }) {
  const url = `${ORIGIN}/${slug}`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/x-icon" href="favicon.ico">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Powerplay">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/assets/pp-og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ORIGIN}/assets/pp-og-card.png">
${jsonld ? `<script type="application/ld+json">\n${JSON.stringify(jsonld)}\n</script>` : ''}`;
}

const STUDIO = { '@type': 'Organization', name: 'Powerplay', url: `${ORIGIN}/` };

(async () => {
  const done = [];
  /* ---------------- 1. nine project pages ---------------- */
  for (const key of Object.keys(SLUG)) {
    const p = DATA[key]; const slug = SLUG[key];
    if (!p) { console.error(`  ✗ ${key}: not in DATA`); continue; }
    try {
      const { doc, host, runtimeCss } = await render(`portfolio.html?p=${key}`);
      const rep = semantics(host, doc, p.client);
      const desc = `${p.client} — ${p.title} (${p.year}). ${String(p.blurbs?.[0] || '').slice(0, 180)}`.trim();
      const title = `${p.client} — ${p.title} — Powerplay`;
      const jsonld = {
        '@context': 'https://schema.org', '@type': 'CreativeWork',
        name: `${p.client} — ${p.title}`, description: desc,
        url: `${ORIGIN}/${slug}`, dateCreated: String(p.year),
        creator: STUDIO, author: STUDIO,
        about: { '@type': 'Organization', name: p.client },
        genre: p.title,
        isPartOf: { '@type': 'CollectionPage', name: 'Work', url: `${ORIGIN}/work.html` },
      };
      const out = `<!DOCTYPE html>
<html lang="en">
<head>
${headFor({ slug, title, desc, jsonld })}
<style>
${runtimeCss}
</style>
</head>
<body>
${host.outerHTML}
</body>
</html>
`;
      if (!DRY) fs.writeFileSync(path.join(SITE, slug), out);
      const text = host.textContent.replace(/\s+/g, ' ').trim().length;
      done.push(slug);
      console.log(`  ✓ ${slug.padEnd(20)} ${String(out.length).padStart(7)}b  text=${String(text).padStart(5)}  h1=${rep.h1?'y':'n'} imgs=${rep.imgs}`);
    } catch (e) { console.error(`  ✗ ${slug}: ${e.message}`); }
  }

  /* ---------------- 2. head metadata on the existing pages ---------------- */
  const META = {
    'work.html': ['Work — Presentation, Event & Brand Design Portfolio — Powerplay',
      'Presentation design, live event graphics and brand systems by Powerplay for OpenAI, Meta, Google, ServiceNow, BitGo, Sui, Swimlane and the San Francisco Symphony.'],
    'case-studies.html': ['Case Studies — Powerplay',
      'How Powerplay works, in depth: a mini-brand and pitch system for The Standard Model, an embedded design team for Sui, and early-stage brand building for Movement Labs.'],
    'contact.html': ['Contact — Start a Project with Powerplay',
      'Get in touch with Powerplay about presentation design, live event graphics, brand systems, or embedded design support for your team. Based in San Francisco.'],
    'portfolio.html': ['Project — Powerplay',
      'A Powerplay project — presentation design, event graphics and brand work for teams that need it to be unforgettable.'],
    'case-study-standard-model.html': ['The Standard Model — Brand & Pitch System Case Study — Powerplay',
      'A mini-brand, pitch system, and generative-AI visual language built for a biomedical AI startup heading into investor rooms. A Powerplay case study.'],
    'case-study-sui.html': ['Sui — Embedded Design Team Case Study — Powerplay',
      'Powerplay embedded as the in-house design team for Sui, a fast-moving L1 blockchain — same-day decks, large-scale event design, and social across the whole organization.'],
    'case-study-movement-labs.html': ['Movement Labs — Early-Stage Brand Building Case Study — Powerplay',
      'An 80-slide deck system, social templates, iconography, and AI builder personas for Movement Labs. A Powerplay case study in early-stage brand building.'],
    'case-study-standard-model-print.html': ['The Standard Model — Print Edition Case Study — Powerplay',
      'The print edition of the Standard Model case study — brand, pitch system, and visual language for a biomedical AI startup, by Powerplay.'],
  };

  for (const [file, [title, desc]] of Object.entries(META)) {
    const fp = path.join(SITE, file);
    if (!fs.existsSync(fp)) { console.error(`  ✗ ${file}: missing`); continue; }
    let src = fs.readFileSync(fp, 'utf8');
    if (/<title>/.test(src)) { console.log(`  – ${file}: already has <title>, skipped`); continue; }
    const url = `${ORIGIN}/${file}`;
    const block = `<title>${esc(title)}</title>\n` +
      `<meta name="description" content="${esc(desc)}">\n` +
      `<link rel="canonical" href="${url}">\n`;
    // insert just before </head>; also correct the duplicated og/twitter titles
    src = src.replace(/(\s*)<\/head>/, `\n${block}</head>`);
    src = src.replace(/<meta property="og:title" content="[^"]*">/,
      `<meta property="og:title" content="${esc(title)}">`);
    src = src.replace(/<meta name="twitter:title" content="[^"]*">/,
      `<meta name="twitter:title" content="${esc(title)}">`);
    src = src.replace(/<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${esc(desc)}">`);
    src = src.replace(/<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${esc(desc)}">`);
    if (!DRY) fs.writeFileSync(fp, src);
    console.log(`  ✓ ${file.padEnd(38)} title + description + canonical added`);
  }

  /* ---------------- 3. point work.html tiles at the static pages ---------------- */
  const wf = path.join(SITE, 'work.html');
  let w = fs.readFileSync(wf, 'utf8'); let swaps = 0;
  for (const [key, slug] of Object.entries(SLUG)) {
    const re = new RegExp(`portfolio\\.html\\?p=${key}\\b`, 'g');
    const n = (w.match(re) || []).length;
    if (n) { w = w.replace(re, slug); swaps += n; }
  }
  if (!DRY) fs.writeFileSync(wf, w);
  console.log(`  ✓ work.html: ${swaps} tile links repointed to static project pages`);

  /* ---------------- 4. sitemap ---------------- */
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ['', '1.0'], ['work.html', '0.9'], ['case-studies.html', '0.8'], ['contact.html', '0.7'],
    ['case-study-standard-model.html', '0.8'], ['case-study-sui.html', '0.8'],
    ['case-study-movement-labs.html', '0.8'], ['case-study-standard-model-print.html', '0.5'],
    ...Object.values(SLUG).map(s => [s, '0.7']),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url>
    <loc>${ORIGIN}/${u}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p}</priority>
  </url>`).join('\n')}
</urlset>
`;
  if (!DRY) fs.writeFileSync(path.join(SITE, 'sitemap.xml'), sitemap);
  console.log(`  ✓ sitemap.xml  ${urls.length} URLs (was 9, portfolio.html shell removed)`);

  console.log(`\n${done.length}/9 project pages built`);
})().catch(e => { console.error('FAILED:', e.stack); process.exit(1); });
