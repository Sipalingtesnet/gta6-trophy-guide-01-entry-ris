// Submission packer for the GTA 6 trophy guide entry (Node 22, standard library only).
//
// The app itself needs no build: app/ is a folder of plain static files a browser opens straight at
// app/index.html, using ES modules and CSS, and it works offline because every trophy and guide lives in
// app/data/trophies.json instead of being fetched from anywhere. This script is the hand-in step: it takes
// app/ and screenshots/ from the directory it sits in, drops copies into the output directory (/output, or
// MAKEFUN_OUTPUT_DIR when set), then asks the vendored make.fun library to write dossier.json next to them.
// That dossier is what the judge reads: our screenshots, the bytes of the first load, and the source.
//
// vendor/makefun-frontend.ts stays untouched on purpose; the scorer compares dossier.json byte for byte
// against what its own copy of the library produces from the same app/ and screenshots/.
//
// Local use:
//   node serve.ts                  then open http://localhost:8080
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Directory holding this script, so the paths below work no matter where it is run from.
const entryDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Stage the app; screenshots/ is optional here (the dossier step is what insists on real shots).
mkdirSync(outputDir, { recursive: true });
cpSync(join(entryDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(entryDir, 'screenshots'))) {
  cpSync(join(entryDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps come from the bounty gate: at least one shot but no more than 4, each <= 256 KiB; the text budget
// only trims the dossier's own text, while the app limits keep us inside what the scorer will accept
// (993 entries under app/, 48 MiB of app bytes, alongside the 1000-entry cap on the output directory).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
