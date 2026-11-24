import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The fortune, kept in entry.txt beside this script; the embedded copy is a
// fallback so the program still writes a valid entry if the file is missing.
const FALLBACK =
  "Today's quick fix is tomorrow's legacy code; write like the ancestor you wish you'd had.";

// The gate accepts UTF-8 text of 1 to 120 characters, not only white space.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 120 || text.trim().length === 0) {
    throw new Error(
      `entry fails the gate: ${chars} characters, must be 1-120 and non-blank`,
    );
  }
  if (text.includes("\n")) {
    throw new Error("entry fails the gate: must be a single line");
  }
}

function loadEntry(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = join(here, "entry.txt");
  if (existsSync(file)) {
    return readFileSync(file, "utf8").trim();
  }
  return FALLBACK;
}

function main(): void {
  const text = loadEntry();
  checkGate(text);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "entry.txt");
  writeFileSync(outFile, text, "utf8");
  // Read back what landed on disk so a truncated or corrupted write fails
  // loudly here instead of being silently judged as a different entry.
  const written = readFileSync(outFile, "utf8");
  if (written !== text) {
    throw new Error("written output does not match the entry text");
  }
}

main();
