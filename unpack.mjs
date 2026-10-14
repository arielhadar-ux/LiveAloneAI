// Rebuilds the full project (folders included) from bundle.json. Runs during the Render build.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const files = JSON.parse(readFileSync(new URL("./bundle.json", import.meta.url), "utf8"));
for (const [path, b64] of Object.entries(files)) {
  if (path.includes("..") || path.startsWith("/")) continue;
  mkdirSync(dirname(path) || ".", { recursive: true });
  writeFileSync(path, Buffer.from(b64, "base64"));
}
console.log("Unpacked", Object.keys(files).length, "files");
