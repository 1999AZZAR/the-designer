import * as https from "https";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface Palette {
  name: string;
  colors: string[];
  tags?: string[];
  likes?: number;
}

export interface PaletteData {
  palettes: Palette[];
}

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const CACHE_TTL_MS = 3600_000;

function cacheDir(): string {
  const dir = path.join(os.homedir(), ".cache", "color-palette-hunter");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function cachePath(key: string): string {
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  return path.join(cacheDir(), `${hash}.json`);
}

function isCacheValid(p: string): boolean {
  try {
    const stat = fs.statSync(p);
    return Date.now() - stat.mtimeMs < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": USER_AGENT }, timeout: 15000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function parsePalettes(html: string, limit: number): Palette[] {
  const hexRe = /#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?/g;
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const m of html.match(hexRe) ?? []) {
    if (!seen.has(m)) {
      seen.add(m);
      unique.push(m);
    }
  }

  const palettes: Palette[] = [];
  for (let i = 0; i < unique.length; i += 4) {
    const colors = unique.slice(i, i + 4);
    if (colors.length >= 3) {
      palettes.push({ colors, name: `Palette ${palettes.length + 1}` });
      if (palettes.length >= limit) break;
    }
  }
  return palettes;
}

export async function fetchPalettes(
  mode: string,
  opts: { theme?: string; query?: string; limit?: number } = {}
): Promise<PaletteData> {
  const limit = opts.limit ?? 5;

  let url: string;
  let cacheKey: string;

  switch (mode) {
    case "trending":
      url = "https://www.colorhunt.co/palettes/trending";
      cacheKey = `trending:${limit}`;
      break;
    case "popular":
      url = "https://www.colorhunt.co/palettes/popular";
      cacheKey = `popular:${limit}`;
      break;
    case "random":
      url = "https://www.colorhunt.co/palettes/trending";
      cacheKey = `random:${limit}`;
      break;
    default: {
      const term = opts.query ?? opts.theme ?? "";
      url = `https://www.colorhunt.co/search?q=${encodeURIComponent(term)}`;
      cacheKey = `search:${term}:${limit}`;
    }
  }

  const cp = cachePath(cacheKey);
  if (isCacheValid(cp)) {
    return JSON.parse(fs.readFileSync(cp, "utf8"));
  }

  const html = await fetchUrl(url);
  const palettes = parsePalettes(html, limit);
  const data: PaletteData = { palettes: palettes.length ? palettes : fallbackPalettes() };

  fs.writeFileSync(cp, JSON.stringify(data), "utf8");
  return data;
}

function fallbackPalettes(): Palette[] {
  return [
    { name: "Modern Minimalist", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F"] },
    { name: "Pastel Dreams", colors: ["#FFB3BA", "#FFCCCB", "#FFFFBA", "#BAE1FF"] },
    { name: "Dark & Bold", colors: ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB"] },
  ];
}
