// Leonida Ledger — dossier builder (the entry's build step).
//
// Copies the two deliverable trees, app/ and screenshots/, into the output
// directory and writes dossier.json beside them with the vendored make.fun
// library, using exactly the size caps this competition's gate enforces.
// The grader runs this program twice and compares the bytes, so the copy
// walks both trees in sorted order and writes nothing time-dependent.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps for gta6-trophy-guide-01 — do not loosen.
const GATE = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  for (const tree of ['app', 'screenshots']) {
    await cp(join(ROOT, tree), join(OUT, tree), { recursive: true });
  }
  const dossier = await buildDossier(OUT, GATE);
  // buildDossier returns the dossier.json content itself — write it as-is.
  await writeFile(join(OUT, 'dossier.json'), dossier);
  console.log(`dossier written to ${join(OUT, 'dossier.json')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
