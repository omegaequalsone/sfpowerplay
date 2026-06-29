# Taste Skill

_The Anti-Slop Frontend Framework for AI Agents_ — imported from https://github.com/Leonxlnx/taste-skill

Portable **Agent Skills** that upgrade AI-built interfaces: stronger layout, typography,
motion, and spacing instead of boilerplate-looking UIs. Also includes **image-generation
skills** for reference boards (web, mobile, brand kits).

## Install

```
npx skills add https://github.com/Leonxlnx/taste-skill
# single skill:
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

## Implementation skills (output code)

| Skill (folder) | Install name | Description |
| --- | --- | --- |
| taste-skill | `design-taste-frontend` | v2 (experimental) default. Reads the brief, infers the design language, tunes three dials (VARIANCE / MOTION / DENSITY). Em-dash ban, GSAP skeletons, redesign-audit protocol, strict pre-flight check. |
| taste-skill-v1 | `design-taste-frontend-v1` | Original v1, preserved for projects depending on its exact behavior. |
| gpt-tasteskill | `gpt-taste` | Stricter variant for GPT/Codex: higher layout variance, stronger GSAP direction, aggressive anti-slop. |
| image-to-code-skill | `image-to-code` | Image-first pipeline: generate site references, analyze them, then implement the frontend to match. |
| redesign-skill | `redesign-existing-projects` | Existing projects: audit the UI first, then fix layout, spacing, hierarchy, styling. |
| soft-skill | `high-end-visual-design` | Polished, calm, expensive UI: softer contrast, whitespace, premium fonts, spring motion. |
| output-skill | `full-output-enforcement` | When the model ships half-finished work: full output, no placeholder comments. |
| minimalist-skill | `minimalist-ui` | Editorial product UI (Notion/Linear vibes), restrained palette, crisp structure. |
| brutalist-skill | `industrial-brutalist-ui` | Hard mechanical language: Swiss type, sharp contrast, experimental layout. |
| stitch-skill | `stitch-design-taste` | Google Stitch-compatible rules, including optional `DESIGN.md` export format. |

## Image-generation skills (output images only)

| Skill (folder) | Install name | Description |
| --- | --- | --- |
| imagegen-frontend-web | `imagegen-frontend-web` | Website comps: hero, landing, multi-section with strong typography, spacing, anti-slop art direction. |
| imagegen-frontend-mobile | `imagegen-frontend-mobile` | Mobile screens and flows: iOS/Android/cross-platform mockups, readable type, coherent sets. |
| brandkit | `brandkit` | Brand-kit boards: logo directions, palettes, type, identity applications across categories. |

## Settings (taste-skill only) — 1-10 dials

- **DESIGN_VARIANCE** — Layout experimentation (low: centered/clean · high: asymmetric/modern).
- **MOTION_INTENSITY** — Animation depth (low: hover · high: scroll/magnetic).
- **VISUAL_DENSITY** — Information per viewport (low: spacious · high: dense dashboards).

## Repo structure

- `.github/`
- `assets/` — readme banner, logo
- `examples/` — `floria-top.webp`, `floria-bottom.webp` (design comps made with the skill)
- `research/` — background writing that shaped the skills
- `skills/` — all SKILL.md files (code + image-gen), discovered by `npx skills add`
- `CHANGELOG.md`, `LICENSE` (MIT), `README.md`, `skill.sh`

License: MIT · Copyright (c) 2026 Leonxlnx · tasteskill.dev
