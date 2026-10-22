# Project design rules — anti-slop frontend skills installed

Two skills are installed and apply to all frontend/landing/portfolio/redesign work in this project:
- **`skills/frontend-design/SKILL.md`** (Anthropic) — aesthetic direction: ground design in the subject, hero-as-thesis, deliberate type pairing, structure-encodes-meaning, two-pass plan→critique→build, spend boldness in one signature element, writing-as-design-material. Calibration warning: AI design clusters around (1) cream #F4F1EA + serif display + terracotta, (2) near-black + one acid accent, (3) hairline broadsheet — these are defaults, not choices; don't spend free axes on them.
- **`skills/taste-skill/SKILL.md`** (design-taste-frontend) — the mechanical anti-slop ruleset below.

Load-bearing rules, distilled:

## Process
- **Design read first.** Before any code, state one line: "Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <aesthetic family>." Ask at most ONE clarifying question, and only if the read genuinely diverges.
- **Three dials** (baseline 8 / 6 / 4): DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY. Set them from the brief; overrides happen conversationally.

## Anti-default discipline — never reach for these
- AI-purple/blue gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism everywhere, infinite micro-animations, **Inter + slate-900** as default.
- **Serif is very discouraged as default.** "Creative brief = serif" is the #1 AI tell. Default to a sans display (Geist, Cabinet Grotesk, PP Neue Montreal, GT Walsheim, Inter Display…). **Fraunces and Instrument Serif are banned as defaults.** Serif only when the brand names it or the brief is genuinely editorial/luxury/heritage AND you can justify the specific face.
- Emphasis within a headline = italic/bold of the SAME font, never a foreign serif/sans word dropped in.
- **Premium-consumer beige+brass+espresso palette is banned as default** (warm paper bg / brass-clay-oxblood accents / espresso text). Rotate to: cold luxury, forest, black+tan, cobalt+cream, terracotta+slate, olive+brick, or monochrome+one pop. Don't ship the same warm-craft palette twice.

## Color
- Max 1 accent, saturation <80%. Neutral base (zinc/slate/stone) + one high-contrast accent. **Lock the accent across the whole page** — no surprise blue CTA in section 7.
- One corner-radius scale, locked. One theme (light OR dark) — sections do not invert.

## Layout
- Hero fits initial viewport: headline ≤2 lines, subtext ≤20 words, CTAs visible without scroll. Hero top padding ≤ pt-24. Max 4 text elements in hero (no trust strip / tagline / pricing teaser inside it).
- Nav on one line, ≤80px tall.
- **Eyebrow restraint:** max 1 small-caps eyebrow per 3 sections. Usually drop it.
- No split-header (big left headline + small right paragraph) as default. Stack instead.
- Zigzag image+text split: max 2 in a row. Section layout family repeats at most once. ≥4 layout families on an 8-section page.
- Bento: exactly as many cells as content; ≥2-3 cells need real visual variation (image/gradient/pattern), not white-on-white.
- Grid over flex-math. `min-h-[100dvh]` not `h-screen`. Declare mobile collapse per section.

## CTAs / forms / a11y
- One label per intent (don't mix "Get in touch"/"Let's talk"/"Start a project"). No duplicate-intent CTAs.
- CTA text fits one line at desktop; 1-3 words for primary. Check button + text contrast (WCAG AA). Label above input, error below, never placeholder-as-label.

## Images (visual products need real visuals)
- Use an image-gen tool if available; else real photography (`picsum.photos/seed/<descriptive>/w/h`) or labeled placeholder slots + tell the user what's needed. **Never** div-based fake screenshots or hand-rolled decorative SVG illustrations.
- Logo walls: real SVG logos (Simple Icons `cdn.simpleicons.org/<slug>/<hex>`), logos only — no category labels. Even minimalist sites need 2-3 real images.

## Motion
- Motion must be motivated (hierarchy / storytelling / feedback / state). If MOTION>4 the page must actually move; if you can't ship clean motion, drop to 3 and go static.
- Marquee: max one per page. Honor `prefers-reduced-motion` above level 3. Animate only transform/opacity.
- **Banned:** `window.addEventListener('scroll')`, scrollY-in-React-state, rAF loops touching state. Use IntersectionObserver / CSS scroll-driven / Motion `useScroll` / GSAP ScrollTrigger.

## Copy
- Self-audit every visible string before ship: cut broken grammar, unclear referents, cute-but-wrong wordplay, fake-poetic meta. Plain functional copy beats clever AI copy.
- No em-dashes as design flourish. Real typographic quotes. Don't fake precise numbers.

> Note on this environment: output is authored as Design Components (`.dc.html`) with inline styles, not Next.js/Tailwind/Motion files. Translate the skill's *principles* (type, color, layout, motion, copy discipline) into that medium — the React/Tailwind/GSAP code skeletons in the skill are reference for intent, not literal stack requirements here.


## Powerplay brand palette (web)
- **Black** `#011829` — primary dark / text / dark sections
- **Folly** (pink) `#FF0055` — primary accent / eyebrow highlight
- **Coquelicot** (orange) `#FF3D00`
- **Palatinate** (purple) `#6E0D75` — "Powerplay purple" — the ONLY purple; do NOT use #E505F5
- **Vanilla** `#F0F6C1`
The hero gradient uses Folly; when the user says "Powerplay purple" they mean Palatinate #6E0D75.
