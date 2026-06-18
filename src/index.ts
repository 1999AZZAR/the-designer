import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { spawnSync } from "child_process";

import { STYLES, PALETTES, ARCHETYPES, HYBRIDS, CROSS_CUTTING, buildSingle, buildHybrid, buildRulesJson } from "./rules.js";
import { fetchPalettes } from "./palette.js";
import { convertPalette, type ConvertTarget } from "./palette-convert.js";
import { generateTailwindConfig } from "./tailwind-config.js";
import { generateTemplate } from "./templates.js";
import { getComponent, COMPONENT_TYPES } from "./components.js";
import { generatePaletteVariants } from "./palette-variants.js";
import { exportProject } from "./export.js";
import { evaluateStyle } from "./evaluate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = join(__dirname, "..");

const SKILL_PATH =
  process.env.THE_DESIGNER_SKILL_PATH ??
  join(MCP_ROOT, "skills/ui-designer");

const PALETTE_SKILL_PATH =
  process.env.COLOR_PALETTE_HUNTER_PATH ??
  join(MCP_ROOT, "skills/color-palette-hunter");

function detectInstalledSkills(): Array<{ name: string; path: string; description: string; tools: string[] }> {
  const skills: Array<{ name: string; path: string; description: string; tools: string[] }> = [];

  const uiDesignerMd = join(SKILL_PATH, "SKILL.md");
  if (existsSync(uiDesignerMd)) {
    const refDir = join(SKILL_PATH, "references");
    const refCount = existsSync(refDir)
      ? require("fs").readdirSync(refDir).filter((f: string) => f.endsWith(".md")).length
      : 0;
    skills.push({
      name: "ui-designer",
      path: SKILL_PATH,
      description: "Design system selection, theming, brand cloning, component patterns, reference docs",
      tools: [
        `get_reference (${refCount} reference docs available)`,
        "generate_rules", "list_options", "validate_combo",
        "generate_tailwind_config", "generate_template", "get_component",
        "export_project",
      ],
    });
  }

  const paletteMd = join(PALETTE_SKILL_PATH, "SKILL.md");
  if (existsSync(paletteMd)) {
    skills.push({
      name: "color-palette-hunter",
      path: PALETTE_SKILL_PATH,
      description: "Live palette fetching from Color Hunt, format conversion, standalone shell/Python scripts",
      tools: [
        "palette_fetch (native API)",
        "palette_convert",
        "scripts/fetch-palette.sh (standalone CLI)",
        "scripts/palette-to-design.py (standalone CLI)",
      ],
    });
  }

  return skills;
}

const BRAND_CATALOG: Record<string, string[]> = {
  "productivity-saas": ["notion", "airtable", "cal", "superhuman", "miro", "intercom", "zapier", "linear.app"],
  "developer-tools": ["vercel", "supabase", "cursor", "raycast", "warp", "posthog", "sentry", "hashicorp", "expo", "sanity", "mintlify", "framer", "figma", "webflow", "clickhouse", "mongodb", "ibm", "opencode.ai"],
  "ai-ml": ["claude", "cohere", "mistral.ai", "x.ai", "minimax", "replicate", "runwayml", "elevenlabs", "together.ai", "ollama", "composio"],
  "fintech": ["stripe", "coinbase", "binance", "kraken", "revolut", "wise", "mastercard"],
  "design-creative": ["figma", "framer", "clay", "lovable", "webflow", "linear.app"],
  "ecommerce": ["shopify", "nike", "starbucks"],
  "media-consumer": ["spotify", "discord", "slack", "pinterest", "theverge", "wired"],
  "automotive-luxury": ["tesla", "spacex", "ferrari", "bugatti", "lamborghini", "bmw", "bmw-m", "renault", "vodafone"],
  "legacy-archival": ["apple", "dell-1996", "hp", "nintendo-2001"],
};

function runCommand(cmd: string, args: string[], cwd?: string): string {
  const result = spawnSync(cmd, args, { encoding: "utf8", timeout: 60000, cwd });
  if (result.status !== 0) {
    throw new Error(result.stderr || `${cmd} exited with code ${result.status}`);
  }
  return result.stdout;
}

const server = new Server(
  { name: "the-designer", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_rules",
      description: "Generate design rules for a style + palette + optional archetype/hybrid. IMPORTANT: Run evaluate_style first to determine the best style for your product context. Only use this tool after evaluation confirms the style choice.",
      inputSchema: {
        type: "object",
        properties: {
          style: { type: "string", description: "Design system: ant|carbon|fluent|atlassian|apple-hig|polaris|material|minimal|glass|neumorphism|neo-brutalism|claymorphism|skeuomorphism|swiss|swiss-archival|m3-pastel|neo-m3" },
          palette: { type: "string", description: "Color palette: pastel|dark|vibrant|mono" },
          archetype: { type: "string", description: "Optional page archetype: dashboard|settings|table-detail|marketing-hero|editorial-landing" },
          hybrid: { type: "string", description: "Optional secondary system for hybrid mode" },
          tailwind: { type: "boolean", description: "Include Tailwind CSS rules" },
        },
        required: ["style", "palette"],
      },
    },
    {
      name: "list_options",
      description: "List all available design systems, palettes, archetypes, and valid hybrid combinations.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "validate_combo",
      description: "Validate a style + palette + optional hybrid combination before generating rules.",
      inputSchema: {
        type: "object",
        properties: {
          style: { type: "string" },
          palette: { type: "string" },
          hybrid: { type: "string" },
        },
        required: ["style", "palette"],
      },
    },
    {
      name: "get_reference",
      description: "Return the full content of a reference document by name (e.g. 'ant-design', 'accessibility', 'design-tokens', 'getdesign-md').",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Reference file name without .md extension" },
        },
        required: ["name"],
      },
    },
    {
      name: "palette_fetch",
      description: "Fetch live color palettes from Color Hunt.",
      inputSchema: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["trending", "popular", "random", "theme", "query"], description: "Fetch mode" },
          theme: { type: "string", description: "Theme name (when mode=theme)" },
          query: { type: "string", description: "Search query (when mode=query)" },
          limit: { type: "number", description: "Number of palettes (default 5)" },
          format: { type: "string", enum: ["json", "css", "tailwind"], description: "Output format (default json)" },
        },
        required: ["mode"],
      },
    },
    {
      name: "palette_convert",
      description: "Convert palette JSON from palette_fetch into CSS, Tailwind, SCSS, Figma tokens, Android XML, or Swift.",
      inputSchema: {
        type: "object",
        properties: {
          palettes: { type: "array", description: "Palette array from palette_fetch JSON output" },
          target: { type: "string", enum: ["css", "tailwind", "scss", "figma", "android", "swift"], description: "Output format" },
        },
        required: ["palettes", "target"],
      },
    },
    {
      name: "brand_fetch_design_md",
      description: "Download and return the DESIGN.md for a real brand (stripe, vercel, linear, notion, claude, tesla, etc.).",
      inputSchema: {
        type: "object",
        properties: {
          brand: { type: "string", description: "Brand slug, e.g. 'stripe', 'vercel', 'linear.app', 'claude'" },
        },
        required: ["brand"],
      },
    },
    {
      name: "generate_tailwind_config",
      description: "Generate a ready-to-use tailwind.config.js for a design style + palette combination. Returns the full config object and module.exports code string.",
      inputSchema: {
        type: "object",
        properties: {
          style: { type: "string", description: "Design system: ant|carbon|fluent|atlassian|apple-hig|polaris|material|minimal|glass|neumorphism|neo-brutalism|claymorphism|skeuomorphism|swiss|swiss-archival|m3-pastel|neo-m3" },
          palette: { type: "string", description: "Color palette: pastel|dark|vibrant|mono" },
        },
        required: ["style", "palette"],
      },
    },
    {
      name: "generate_template",
      description: "Generate a full HTML starter page for a style + palette + archetype combination. IMPORTANT: Run evaluate_style first to determine the best style/palette/archetype for your product context.",
      inputSchema: {
        type: "object",
        properties: {
          style: { type: "string", description: "Design system: ant|carbon|fluent|atlassian|apple-hig|polaris|material|minimal|glass|neumorphism|neo-brutalism|claymorphism|skeuomorphism|swiss|swiss-archival|m3-pastel|neo-m3" },
          palette: { type: "string", description: "Color palette: pastel|dark|vibrant|mono" },
          archetype: { type: "string", description: "Page archetype: dashboard|settings|table-detail|marketing-hero|editorial-landing" },
        },
        required: ["style", "palette", "archetype"],
      },
    },
    {
      name: "get_component",
      description: "Get a production-ready HTML/Tailwind component snippet styled for a specific design system. IMPORTANT: Run evaluate_style first to confirm the style choice. Components: button, card, navbar, hero, form-input, badge, modal, sidebar, table, footer.",
      inputSchema: {
        type: "object",
        properties: {
          component: { type: "string", enum: ["button", "card", "navbar", "hero", "form-input", "badge", "modal", "sidebar", "table", "footer"], description: "Component type" },
          style: { type: "string", description: "Design system: ant|carbon|fluent|atlassian|apple-hig|polaris|material|minimal|glass|neumorphism|neo-brutalism|claymorphism|skeuomorphism|swiss|swiss-archival|m3-pastel|neo-m3" },
        },
        required: ["component", "style"],
      },
    },
    {
      name: "get_cross_cutting_rules",
      description: "Get standalone cross-cutting design rules by category. Categories: icons, accessibility, motion, tokens, responsive, tailwind. Returns the rules as a formatted string.",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["icons", "accessibility", "motion", "tokens", "responsive", "tailwind"], description: "Cross-cutting rule category" },
        },
        required: ["category"],
      },
    },
    {
      name: "generate_palette_variants",
      description: "Generate light, dark, high-contrast, muted, and vivid variants from a set of hex colors. Useful for theming and responsive color systems.",
      inputSchema: {
        type: "object",
        properties: {
          colors: { type: "array", items: { type: "string" }, description: "Array of hex color strings, e.g. [\"#3b82f6\", \"#8b5cf6\"]" },
        },
        required: ["colors"],
      },
    },
    {
      name: "export_project",
      description: "Export a complete project scaffold: tailwind.config.js, index.html, input.css, package.json, and component files. Returns all files as a structured manifest ready to write to disk.",
      inputSchema: {
        type: "object",
        properties: {
          style: { type: "string", description: "Design system: ant|carbon|fluent|atlassian|apple-hig|polaris|material|minimal|glass|neumorphism|neo-brutalism|claymorphism|skeuomorphism|swiss|swiss-archival|m3-pastel|neo-m3" },
          palette: { type: "string", description: "Color palette: pastel|dark|vibrant|mono" },
          archetype: { type: "string", description: "Page archetype: dashboard|settings|table-detail|marketing-hero|editorial-landing" },
          projectName: { type: "string", description: "Project name (default: my-project)" },
        },
        required: ["style", "palette", "archetype"],
      },
    },
    {
      name: "list_installed_skills",
      description: "Detect and list all installed skill submodules alongside this MCP. Shows which skills are available for standalone use and what capabilities they provide.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "evaluate_style",
      description: "Evaluates a product description against all design systems and returns ranked style recommendations with scoring. USE THIS FIRST before generate_rules. Takes a product context (e.g. 'automotive gaming mouse', 'enterprise dashboard', 'luxury ecommerce') and returns the best-matching style, palette, archetype, and a step-by-step workflow.",
      inputSchema: {
        type: "object",
        properties: {
          description: { type: "string", description: "Product description or context (e.g. 'automotive gaming mouse', 'enterprise admin dashboard', 'luxury fashion ecommerce')" },
        },
        required: ["description"],
      },
    },
    {
      name: "brand_list",
      description: "List all 328+ supported brands grouped by category.",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", description: "Optional category filter: productivity-saas|developer-tools|ai-ml|fintech|design-creative|ecommerce|media-consumer|automotive-luxury|legacy-archival" },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_rules": {
        const { style, palette, archetype, hybrid, tailwind } = args as {
          style: string; palette: string; archetype?: string; hybrid?: string; tailwind?: boolean;
        };
        const content = hybrid
          ? buildHybrid(style, hybrid, palette, archetype)
          : buildSingle(style, palette, archetype, tailwind);
        const result = buildRulesJson({
          style, palette, archetype,
          hybrid: hybrid ? `${style}+${hybrid}` : undefined,
          content,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "list_options": {
        const result = buildRulesJson({});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "validate_combo": {
        const { style, palette, hybrid } = args as {
          style: string; palette: string; hybrid?: string;
        };
        const styleOk = style in STYLES;
        const paletteOk = palette in PALETTES;
        const hybridOk = hybrid ? `${style}+${hybrid}` in HYBRIDS : true;
        const valid = styleOk && paletteOk && hybridOk;
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              valid,
              style: styleOk ? style : `unknown: ${style}`,
              palette: paletteOk ? palette : `unknown: ${palette}`,
              hybrid: hybrid ? (hybridOk ? `${style}+${hybrid}` : `unknown combo: ${style}+${hybrid}`) : null,
            }),
          }],
        };
      }

      case "get_reference": {
        const { name: refName } = args as { name: string };
        const refPath = join(SKILL_PATH, "references", `${refName}.md`);
        if (!existsSync(refPath)) {
          throw new Error(`Reference not found: ${refName}. Available references are in ${SKILL_PATH}/references/`);
        }
        const content = readFileSync(refPath, "utf8");
        return { content: [{ type: "text", text: content }] };
      }

      case "palette_fetch": {
        const { mode, theme, query, limit = 5, format = "json" } = args as {
          mode: string; theme?: string; query?: string; limit?: number; format?: string;
        };
        const paletteMode = mode === "theme" ? "theme" : mode === "query" ? "query" : mode;
        const data = await fetchPalettes(paletteMode, { theme, query, limit });
        let output: string;
        if (format === "json") {
          output = JSON.stringify(data, null, 2);
        } else {
          output = convertPalette(data, format as ConvertTarget);
        }
        return { content: [{ type: "text", text: output }] };
      }

      case "palette_convert": {
        const { palettes, target } = args as { palettes: unknown[]; target: string };
        const data = { palettes } as import("./palette.js").PaletteData;
        const output = convertPalette(data, target as ConvertTarget);
        return { content: [{ type: "text", text: output }] };
      }

      case "brand_fetch_design_md": {
        const { brand } = args as { brand: string };
        const tmp = join(tmpdir(), `design-md-${Date.now()}`);
        mkdirSync(tmp, { recursive: true });
        try {
          runCommand("npx", ["getdesign@latest", "add", brand], tmp);
          const designPath = join(tmp, "DESIGN.md");
          if (!existsSync(designPath)) {
            throw new Error(`DESIGN.md not found after fetch. Brand '${brand}' may not exist in the catalog.`);
          }
          const content = readFileSync(designPath, "utf8");
          return { content: [{ type: "text", text: `# DESIGN.md for ${brand}\n\n${content}` }] };
        } finally {
          rmSync(tmp, { recursive: true, force: true });
        }
      }

      case "evaluate_style": {
        const { description } = args as { description: string };
        const result = evaluateStyle(description);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "list_installed_skills": {
        const skills = detectInstalledSkills();
        return {
          content: [{
            type: "text",
            text: skills.length
              ? JSON.stringify({
                  message: `${skills.length} skill(s) detected alongside this MCP`,
                  skills,
                  note: "Skills work standalone via their own CLIs. When this MCP is installed, both systems coexist — use MCP tools for programmatic access, skill scripts for standalone CLI usage.",
                }, null, 2)
              : JSON.stringify({ message: "No skills detected. Install skills as git submodules in skills/ directory.", skills: [] }, null, 2),
          }],
        };
      }

      case "export_project": {
        const { style, palette, archetype, projectName } = args as {
          style: string; palette: string; archetype: string; projectName?: string;
        };
        if (!(style in STYLES)) throw new Error(`Unknown style: ${style}. Available: ${Object.keys(STYLES).join(", ")}`);
        if (!(palette in PALETTES)) throw new Error(`Unknown palette: ${palette}. Available: ${Object.keys(PALETTES).join(", ")}`);
        if (!(archetype in ARCHETYPES)) throw new Error(`Unknown archetype: ${archetype}. Available: ${Object.keys(ARCHETYPES).join(", ")}`);
        const result = exportProject(style, palette, archetype, projectName);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "generate_palette_variants": {
        const { colors } = args as { colors: string[] };
        if (!Array.isArray(colors) || colors.length === 0) throw new Error("colors must be a non-empty array of hex strings");
        const variants = generatePaletteVariants(colors);
        return { content: [{ type: "text", text: JSON.stringify(variants, null, 2) }] };
      }

      case "get_cross_cutting_rules": {
        const { category } = args as { category: string };
        if (!(category in CROSS_CUTTING)) throw new Error(`Unknown category: ${category}. Available: ${Object.keys(CROSS_CUTTING).join(", ")}`);
        const section = CROSS_CUTTING[category as keyof typeof CROSS_CUTTING];
        const text = `## ${section.label}\n\n${section.rules.map((r) => `- ${r}`).join("\n")}\n`;
        return { content: [{ type: "text", text }] };
      }

      case "get_component": {
        const { component, style } = args as { component: string; style: string };
        if (!COMPONENT_TYPES.includes(component as any)) throw new Error(`Unknown component: ${component}. Available: ${COMPONENT_TYPES.join(", ")}`);
        if (!(style in STYLES)) throw new Error(`Unknown style: ${style}. Available: ${Object.keys(STYLES).join(", ")}`);
        const html = getComponent(component as any, style);
        return { content: [{ type: "text", text: html }] };
      }

      case "generate_template": {
        const { style, palette, archetype } = args as { style: string; palette: string; archetype: string };
        if (!(style in STYLES)) throw new Error(`Unknown style: ${style}. Available: ${Object.keys(STYLES).join(", ")}`);
        if (!(palette in PALETTES)) throw new Error(`Unknown palette: ${palette}. Available: ${Object.keys(PALETTES).join(", ")}`);
        if (!(archetype in ARCHETYPES)) throw new Error(`Unknown archetype: ${archetype}. Available: ${Object.keys(ARCHETYPES).join(", ")}`);
        const html = generateTemplate(style, palette, archetype);
        return { content: [{ type: "text", text: html }] };
      }

      case "generate_tailwind_config": {
        const { style, palette } = args as { style: string; palette: string };
        if (!(style in STYLES)) throw new Error(`Unknown style: ${style}. Available: ${Object.keys(STYLES).join(", ")}`);
        if (!(palette in PALETTES)) throw new Error(`Unknown palette: ${palette}. Available: ${Object.keys(PALETTES).join(", ")}`);
        const result = generateTailwindConfig(style, palette);
        return { content: [{ type: "text", text: result.code }] };
      }

      case "brand_list": {
        const { category } = args as { category?: string };
        const catalog = category ? { [category]: BRAND_CATALOG[category] ?? [] } : BRAND_CATALOG;
        return { content: [{ type: "text", text: JSON.stringify(catalog, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
