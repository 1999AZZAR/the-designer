# The Designer MCP

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server for production-grade UI design — design rules, anti-slop quality gates, OKLCH token generation, color palettes, 328+ brand references, and **anime.js v4 motion integration**.

## Features

- **Anti-Slop Quality Gates** — 31-gate slop test catches AI tells: italic headers, fake chrome, fabricated metrics, generic CTAs, hanging headers, glass-on-white, Lorem ipsum. 6-axis self-critique (P-H-E-S-R-V) rejects anything < 3.
- **OKLCH Token System** — 16 curated themes (Specimen, Atelier, Brutal, Terminal, Midnight, Bloom, etc.) with full token sets. Genre scoping (editorial, modern-minimal, atmospheric, playful). Build custom tokens from OKLCH values.
- **Design Rules Generator** — 17 design systems (Material, Ant, Carbon, Glass, Swiss, etc.) + 4 palettes + 5 archetypes + hybrid combos.
- **Pre-Flight Scan** — Detect existing project context: framework, font stack, palette tokens, motion libraries before designing.
- **Component 8-State Generator** — Standalone demo pages with all 8 interactive states (default, hover, focus, active, disabled, loading, error, success) — now animated via anime.js v4.
- **anime.js v4 Motion System** — Style-aware animation presets baked into every generated template. Separate `generate_motion_snippet` tool for on-demand snippets (entrance, micro-interactions, stagger, scroll-trigger, loader, transitions, counters, typewriter).
- **Color Palette Hunter** — Live trending/popular/themed palettes from Color Hunt with format conversion.
- **Brand Design References** — 328+ real-world brands (Stripe, Vercel, Notion, Claude, Tesla, etc.).

## Tools

### Core Design Flow
| Tool | Description |
|------|-------------|
| `evaluate_style` | Score 17 design systems against product context |
| `detect_genre` | Classify brief into editorial / modern-minimal / atmospheric / playful |
| `pre_flight_scan` | Scan existing project for framework, fonts, palette, motion libs |
| `generate_rules` | Generate design rules for style + palette + archetype/hybrid |
| `generate_tailwind_config` | Generate ready-to-use tailwind.config.js |
| `get_cross_cutting_rules` | Get standalone rules (a11y, motion, icons, tokens, responsive) |

### Theme & Token System
| Tool | Description |
|------|-------------|
| `generate_tokens` | Generate complete OKLCH token system from named theme or genre |
| `list_themes` | List all 16 themes with OKLCH values, fonts, axis metadata |
| `build_custom_tokens` | Build custom OKLCH token system from paper/accent/font values |

### Quality Gates
| Tool | Description |
|------|-------------|
| `anti_pattern_check` | Run 31-gate slop test on HTML/CSS — italic headers, fake chrome, fabricated metrics, section tags, hanging headers, glass-on-white, more |
| `self_critique` | Score output on 6 quality axes (Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety) — anything < 3 triggers revision |

### Component & Template
| Tool | Description |
|------|-------------|
| `generate_template` | Full HTML starter page for style + palette + archetype — **ships with anime.js v4 entrance + micro animations** |
| `get_component` | Production-ready component snippet (button, card, nav, hero, etc.) |
| `generate_8state_component` | Standalone HTML preview with all 8 interactive states — **animated with anime.js spring physics** |
| `generate_palette_variants` | Light/dark/high-contrast variants from hex colors |
| `export_project` | Full project scaffold (config + HTML + components) |

### Motion (anime.js v4)
| Tool | Description |
|------|-------------|
| `generate_motion_snippet` | Generate a ready-to-paste **anime.js v4** snippet matched to the current design style's easing and duration character. Supports 8 categories: `entrance`, `micro`, `stagger`, `scroll`, `loader`, `transition`, `counter`, `typewriter`. Every snippet includes a `prefers-reduced-motion` guard. |

### Color & Palette
| Tool | Description |
|------|-------------|
| `palette_fetch` | Fetch live palettes from Color Hunt |
| `palette_convert` | Convert palette JSON to CSS / Tailwind / SCSS / Figma / Android / Swift |

### Brand References
| Tool | Description |
|------|-------------|
| `brand_fetch_design_md` | Download DESIGN.md for a real brand |
| `brand_list` | List all 328+ brands by category |

### Utility
| Tool | Description |
|------|-------------|
| `list_options` | List all available systems, palettes, archetypes, hybrids |
| `validate_combo` | Validate style + palette + hybrid combo |
| `get_reference` | Pull full content of any reference doc |
| `list_installed_skills` | Detect installed skill submodules |

## Motion Design

Every template produced by `generate_template` ships with **anime.js v4** loaded from CDN and a style-aware inline script that handles:

- Hero section entrance (staggered children, `translateY` + `opacity`)
- KPI card stagger reveal
- Sidebar nav link reveal (`translateX`)
- Button/chip press micro-interactions (spring physics)
- Table row stagger (`translateX`)

Easing and duration are calibrated per design system:

| System | Easing | Duration |
|--------|--------|----------|
| `glass` | `easeOutQuart` | 700ms |
| `claymorphism` | `spring(1, 80, 10, 0)` | 600ms |
| `neo-brutalism` | `easeInOutExpo` | 400ms |
| `material` | `cubicBezier(0.4, 0, 0.2, 1)` | 300ms |
| `apple-hig` | `spring(1, 100, 18, 0)` | 550ms |
| `swiss` | `linear` | 200ms |
| `m3-pastel` | `spring(1, 80, 12, 0)` | 450ms |

Use `generate_motion_snippet` for standalone snippets targeting specific use cases:

```json
{
  "tool": "generate_motion_snippet",
  "arguments": {
    "category": "scroll",
    "style": "glass"
  }
}
```

Returns `{ cdn, snippet, easing, duration, usage_hint, reduced_motion_note }`.

All snippets respect `prefers-reduced-motion` — animations are skipped entirely when the user has enabled reduced motion.

## Examples

**Ellis UI (`examples/ellis-ui`)**  
A comprehensive, anti-slop component library demonstrating the extreme versatility of `the-designer`'s ruleset. The project takes a single romantic letter and renders it across **24 radically different, strictly enforced aesthetic systems** (e.g., Swiss Archival, Vintage Airmail, Brutalist, UNIX Phosphor, 8-Bit Game Boy).

Each design acts as a fully standalone, reusable UI kit utilizing zero JS dependencies—relying entirely on strict structural typography, CSS geometry, and advanced CSS rendering techniques (clip-paths, custom filters, OKLCH gradients). Each of the 24 folders includes a `design.md` detailing the tokens and layout strategy, acting as an advanced template reference for `the-designer`.

## Installation

```bash
git clone https://github.com/1999AZZAR/the-designer.git
cd the-designer
npm install
npm run build
```

**Requirements**: Node.js >= 18

## Usage

```bash
npm start
```

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Architecture

```
src/
  index.ts              # MCP server entry, tool routing (24 tools)
  rules.ts              # 17 design systems, palettes, archetypes, hybrids
  anti-patterns.ts      # 31-gate slop test + 6-axis self-critique
  tokens.ts             # 16 curated themes, OKLCH token generation, genre detection
  preflight.ts          # Project context scanner (framework, fonts, palette, motion)
  anime-motion.ts       # anime.js v4 integration — style-aware presets, CDN helper, snippet generator
  components-8state.ts  # 8-state component demo generator (anime.js micro-interactions)
  evaluate.ts           # Style scoring engine
  palette.ts            # Color Hunt palette fetcher
  palette-convert.ts    # Format converter
  components.ts         # Component snippet library
  templates.ts          # HTML template generator (anime.js baked in)
  tailwind-config.ts    # Tailwind config generator
  export.ts             # Project scaffold exporter
skills/
  ui-designer/          # Reference docs + genre files (git submodule)
  color-palette-hunter/ # Palette CLI scripts (git submodule)
```

## Anti-Slop Design Philosophy

- **Locked tokens** — every color/font references a named CSS variable, never inline values
- **No fabricated content** — real metrics or labeled placeholders only
- **No re-drawn chrome** — no fake browser bars, phone frames, or code window chrome
- **Typography purity** — headings always roman, no italic display faces
- **Structural variety** — different briefs produce structurally different pages
- **Mobile-responsiveness hard floor** — 320/375/414/768px, `overflow-x: clip`, `minmax(0, 1fr)`, no two-line clickable text
- **OKLCH-first** — all new tokens defined in OKLCH for perceptual uniformity
- **Motion with restraint** — animations are style-calibrated, spring-physics-grounded, and always gated on `prefers-reduced-motion`

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `UI_DESIGNER_SKILL_PATH` | `skills/ui-designer` | Path to the ui-designer skill references |
| `COLOR_PALETTE_HUNTER_PATH` | `skills/color-palette-hunter` | Path to the color palette hunter skill |

## Configuring with AI Assistants

```json
{
  "mcpServers": {
    "the-designer": {
      "command": "node",
      "args": ["/path/to/the-designer/dist/index.js"],
      "env": {}
    }
  }
}
```

## License

[MIT](LICENSE)
