// Rebuilds the project from the newest bundle file in this folder. Runs during the Render build.
// Any name works ("bundle.json", "bundle (14).json"...), and empty or broken files are skipped, so you never need to rename an upload.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname } from "node:path";
const here = new URL(".", import.meta.url);
let best = null;
for (const name of readdirSync(here).filter((n) => /^bundle.*\.json$/i.test(n))) {
  try {
    const files = JSON.parse(readFileSync(new URL(encodeURIComponent(name), here), "utf8"));
    const cfg = files["api/config.ts"] ? Buffer.from(files["api/config.ts"], "base64").toString() : "";
    const ver = (cfg.match(/VERSION = "([^"]+)"/) || [])[1] || "";
    if (!ver) { console.log(`Skipping ${name} (not an app bundle)`); continue; }
    if (!best || ver > best.ver) best = { name, ver, files };
  } catch { console.log(`Skipping ${name} (empty or broken)`); }
}
if (!best) throw new Error("No working bundle file found. Upload the bundle file again (don't rename it on GitHub).");
for (const [path, b64] of Object.entries(best.files)) {
  if (path.includes("..") || path.startsWith("/")) continue;
  mkdirSync(dirname(path) || ".", { recursive: true });
  writeFileSync(path, Buffer.from(b64, "base64"));
}
console.log(`Unpacked ${Object.keys(best.files).length} files from ${best.name} (version ${best.ver})`);
