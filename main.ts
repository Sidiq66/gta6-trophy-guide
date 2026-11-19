// Leonida Ledger — the hand-in program.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Copies the two deliverable trees, app/ and screenshots/, into the output
// directory and writes dossier.json there with the kit's buildDossier, at
// exactly the caps the gta6-trophy-guide-01 gate enforces. buildDossier
// returns the finished dossier text, so it is written out untouched —
// stringifying it again would corrupt the byte-for-byte comparison the
// gate makes. The grader runs this twice and compares the bytes, so the
// copies happen in a fixed order and nothing time-dependent is written.

import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

async function handIn() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(join(here, 'app'), join(outputDir, 'app'), { recursive: true });
  await cp(join(here, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  const dossierText = await buildDossier(outputDir, GATE_CAPS);
  await writeFile(join(outputDir, 'dossier.json'), dossierText);
  console.log(`dossier.json written under ${outputDir}`);
}

try {
  await handIn();
} catch (error) {
  console.error(error);
  process.exit(1);
}
