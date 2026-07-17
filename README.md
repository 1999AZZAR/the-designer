# The Designer MCP

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server for production-grade UI design — design rules, anti-slop quality gates, OKLCH token generation, color palettes, and 328+ brand references.

## Features

- **Anti-Slop Quality Gates** — 31-gate slop test catches AI tells: italic headers, fake chrome, fabricated metrics, generic CTAs, hanging headers, glass-on-white, Lorem ipsum. 6-axis self-critique (P-H-E-S-R-V) rejects anything < 3.
- **OKLCH Token System** — 16 curated themes (Specimen, Atelier, Brutal, Terminal, Midnight, Bloom, etc.) with full token sets. Genre scoping (editorial, modern-minimal, atmospheric, playful). Build custom tokens from OKLCH values.
- **Design Rules Generator** — 17 design systems (Material, Ant, Carbon, Glass, Swiss, etc.) + 4 palettes + 5 archetypes + hybrid combos.
- **Pre-Flight Scan** — Detect existing project context: framework, font stack, palette tokens, motion libraries before designing.
- **Component 8-State Generator** — Standalone demo pages with all 8 interactive states (default, hover, focus, active, disabled, loading, error, success).
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
| `generate_template` | Full HTML starter page for style + palette + archetype |
| `get_component` | Production-ready component snippet (button, card, nav, hero, etc.) |
| `generate_8state_component` | Standalone HTML preview with all 8 interactive states |
| `generate_palette_variants` | Light/dark/high-contrast variants from hex colors |
| `export_project` | Full project scaffold (config + HTML + components) |

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
  index.ts              # MCP server entry, tool routing (23 tools)
  rules.ts              # 17 design systems, palettes, archetypes, hybrids
  anti-patterns.ts      # 31-gate slop test + 6-axis self-critique
  tokens.ts             # 16 curated themes, OKLCH token generation, genre detection
  preflight.ts          # Project context scanner (framework, fonts, palette, motion)
  components-8state.ts  # 8-state component demo generator
  evaluate.ts           # Style scoring engine
  palette.ts            # Color Hunt palette fetcher
  palette-convert.ts    # Format converter
  components.ts         # Component snippet library
  templates.ts          # HTML template generator
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
