import "server-only";
import fs from "node:fs";
import path from "node:path";

const NOTES_DIR = path.join(process.cwd(), "notes-content");

let manifestCache: Record<string, string> | null = null;

function loadManifest(): Record<string, string> {
  if (manifestCache) return manifestCache;
  const manifestPath = path.join(NOTES_DIR, "manifest.js");
  const src = fs.readFileSync(manifestPath, "utf8");
  // manifest.js sets:  const NOTES_MANIFEST = { "html_file": "slug", ... };
  const start = src.indexOf("{");
  const end = src.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("notes-content/manifest.js is missing the NOTES_MANIFEST object");
  }
  const objLiteral = src.slice(start, end + 1);
  // JSON.parse needs strict double-quoted keys; the manifest already uses them.
  manifestCache = JSON.parse(objLiteral) as Record<string, string>;
  return manifestCache;
}

export function noteSlugFor(htmlFile: string): string | null {
  return loadManifest()[htmlFile] ?? null;
}

export function loadNoteHtml(htmlFile: string): string | null {
  const slug = noteSlugFor(htmlFile);
  if (!slug) return null;
  const filePath = path.join(NOTES_DIR, `${slug}.js`);
  if (!fs.existsSync(filePath)) return null;
  const src = fs.readFileSync(filePath, "utf8");
  // Each note file is:  window.__NOTE_CONTENT = "<html string>";
  // The string uses standard JS escapes — JSON.parse handles them once we trim the wrapper.
  const eq = src.indexOf("=");
  if (eq === -1) return null;
  const semi = src.lastIndexOf(";");
  const literal = src.slice(eq + 1, semi === -1 ? undefined : semi).trim();
  try {
    return JSON.parse(literal);
  } catch {
    return null;
  }
}
