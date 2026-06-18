import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawnSync } from "child_process";
import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = join(__dirname, "..");

// Canonical: skills live inside this repo under skills/
// Override via env vars if needed (e.g. during development)
const SKILL_PATH =
  process.env.UI_DESIGNER_SKILL_PATH ??
  join(MCP_ROOT, "skills/ui-designer");
const PALETTE_PATH =
  process.env.COLOR_PALETTE_HUNTER_PATH ??
  join(MCP_ROOT, "skills/color-palette-hunter");

const APPLY_RULES_PY = join(SKILL_PATH, "scripts/apply_ui_rules.py");
const FETCH_PALETTE_PY = join(PALETTE_PATH, "scripts/fetch-palette.py");
const PALETTE_TO_DESIGN_PY = join(PALETTE_PATH, "scripts/palette-to-design.py");

// Brand catalog — mirrors references/getdesign-md.md
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

function runPython(script: string, args: string[]): string {
  const result = spawnSync("python3", [script, ...args], {
    encoding: "utf8",
    timeout: 30000,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `python3 exited with code ${result.status}`);
  }
  return result.stdout;
}

function runCommand(cmd: string, args: string[], cwd?: string): string {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    timeout: 60000,
    cwd,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `${cmd} exited with code ${result.status}`);
  }
  return result.stdout;
}

const server = new Server(
  { name: "ui-designer", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_rules",
      description: "Generate design rules for a style + palette + optional archetype/hybrid. Returns JSON rules and a formatted string suitable for .cursorrules.",
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
        const pyArgs = ["--style", style, "--palette", palette, "--json"];
        if (archetype) pyArgs.push("--archetype", archetype);
        if (hybrid) pyArgs.push("--hybrid", hybrid);
        if (tailwind) pyArgs.push("--tailwind");
        const output = runPython(APPLY_RULES_PY, pyArgs);
        return { content: [{ type: "text", text: output }] };
      }

      case "list_options": {
        const output = runPython(APPLY_RULES_PY, ["--list", "--json"]);
        return { content: [{ type: "text", text: output }] };
      }

      case "validate_combo": {
        const { style, palette, hybrid } = args as {
          style: string; palette: string; hybrid?: string;
        };
        const pyArgs = ["--style", style, "--palette", palette, "--validate", "--json"];
        if (hybrid) pyArgs.push("--hybrid", hybrid);
        const output = runPython(APPLY_RULES_PY, pyArgs);
        return { content: [{ type: "text", text: output }] };
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
        const pyArgs = [`--${mode}`, "--limit", String(limit), "--format", format];
        if (theme) pyArgs.push("--theme", theme);
        if (query) pyArgs.push("--query", query);
        const output = runPython(FETCH_PALETTE_PY, pyArgs);
        return { content: [{ type: "text", text: output }] };
      }

      case "palette_convert": {
        const { palettes, target } = args as { palettes: unknown[]; target: string };
        const tmp = join(tmpdir(), `palette-${Date.now()}.json`);
        try {
          writeFileSync(tmp, JSON.stringify(palettes), "utf8");
          const output = runPython(PALETTE_TO_DESIGN_PY, ["--input", tmp, "--format", target]);
          return { content: [{ type: "text", text: output }] };
        } finally {
          if (existsSync(tmp)) rmSync(tmp);
        }
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
