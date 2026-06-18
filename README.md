# The Designer MCP

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server combining three design capabilities into a single endpoint: **UI design rules generation**, **color palette hunting**, and **real brand design reference fetching** (328+ brands).

## Table of Contents

- [Features](#features)
- [Tools](#tools)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Configuring with AI Assistants](#configuring-with-ai-assistants)

## Features

- **Design Rules Generator**: Generate production-ready design rules from 17 design systems (Material, Ant, Carbon, Glass, etc.) + 4 palette modes + 5 archetypes + hybrid combos
- **Color Palette Hunter**: Fetch live trending, popular, or themed palettes from Color Hunt with format conversion (CSS, Tailwind, SCSS, Figma, Android XML, Swift)
- **Brand Design References**: Access DESIGN.md files for 328+ real-world brands (Stripe, Vercel, Tesla, Claude, Spotify, etc.) grouped by category
- **Reference Library**: Built-in reference docs for design systems, accessibility, design tokens, and more

## Tools

| Tool | Description |
|------|-------------|
| `generate_rules` | Generate design rules for a style + palette + optional archetype/hybrid |
| `list_options` | List all available design systems, palettes, archetypes, and valid hybrid combos |
| `validate_combo` | Validate a style + palette + optional hybrid combination before generating |
| `get_reference` | Return full content of a reference document (e.g. `ant-design`, `design-tokens`) |
| `palette_fetch` | Fetch live color palettes from Color Hunt (trending/popular/random/theme/query) |
| `palette_convert` | Convert palette JSON into CSS, Tailwind, SCSS, Figma tokens, Android XML, or Swift |
| `brand_fetch_design_md` | Download and return the DESIGN.md for a real brand |
| `brand_list` | List all 328+ supported brands grouped by category |

## Installation

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/1999AZZAR/the-designer.git
cd the-designer

# Install dependencies
npm install

# Build the project
npm run build
```

### Requirements

- Node.js >= 18
- Python 3 (for palette and design rules scripts)

## Usage

### Starting the Server

```bash
# Start the server using stdio (default mode)
npm start
```

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

### Available NPM Scripts

```bash
npm run build   # Build the TypeScript project
npm start       # Start the MCP server
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `UI_DESIGNER_SKILL_PATH` | `skills/ui-designer` | Path to the ui-designer skill directory |
| `COLOR_PALETTE_HUNTER_PATH` | `skills/color-palette-hunter` | Path to the color-palette-hunter skill directory |

## Configuring with AI Assistants

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Roo Code / Cline

Add to your MCP settings file:

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

## Brand Categories

| Category | Brands |
|----------|--------|
| Productivity SaaS | Notion, Airtable, Cal, Superhuman, Miro, Intercom, Zapier, Linear |
| Developer Tools | Vercel, Supabase, Cursor, Raycast, Warp, PostHog, Sentry, Expo, Figma, Webflow |
| AI / ML | Claude, Cohere, Mistral, xAI, MiniMax, Replicate, RunwayML, ElevenLabs, Ollama |
| Fintech | Stripe, Coinbase, Binance, Kraken, Revolut, Wise, Mastercard |
| Design / Creative | Figma, Framer, Clay, Lovable, Webflow, Linear |
| Ecommerce | Shopify, Nike, Starbucks |
| Media / Consumer | Spotify, Discord, Slack, Pinterest, The Verge, Wired |
| Automotive / Luxury | Tesla, SpaceX, Ferrari, Bugatti, Lamborghini, BMW, Vodafone |
| Legacy / Archival | Apple, Dell (1996), HP, Nintendo (2001) |

## License

[MIT](LICENSE)
