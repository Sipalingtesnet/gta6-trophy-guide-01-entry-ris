# GTA 6 Trophy Guide & Tracker

[![bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Sipalingtesnet/gta6-trophy-guide-01-entry-ris/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Sipalingtesnet/gta6-trophy-guide-01-entry-ris/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and progress tracker for all 55 PlayStation 5 trophies of *Grand Theft Auto VI*, submitted to the [make.fun bounty `gta6-trophy-guide-01`](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

One static page that answers two questions at once: *how do I earn this trophy?* and *how far along am I?* The list covers the full PS5 set — 1 platinum, 2 gold, 6 silver and 46 bronze — with every trophy's description, grade, kind and its own written guide. Nothing is loaded from the network: the page ships its data in `app/data/trophies.json`, so it works with the Wi-Fi off while you play.

## Features

- **Checklist that remembers.** Each trophy can be ticked off; progress is kept in `localStorage` in your browser and the header counts how many of the 55 are earned.
- **Export and import.** Save your progress as a JSON file and load it back later, or move it to another browser — handy for a fresh profile or a second playthrough.
- **Filters.** Narrow the list by grade (bronze → platinum), kind (story, activity, collectible, crime, exploration, partner, hidden, platinum), earned or unearned, missable only, plus a free-text search across names, descriptions and guides.
- **Spoiler setting.** Story trophies can be veiled: their name, description and guide stay hidden until you earn them or switch "Show story spoilers" back on.
- **Roadmap to the platinum.** A phased plan — story first, then the 100% checklist category by category, then clean-up in free roam — with rough time expectations and save-file advice.
- **Missable flags.** One trophy can be lost forever (the Chapter 1 balcony meditation); it carries a clear warning and points at the manual save that protects you. Everything else is obtainable at any time.
- **Guides in our own words.** Every entry explains the trigger, the fastest approach and any gotcha, with the source it was checked against (PowerPyx, GTABase, GamesRadar+, PC Gamer, GTA Zone, Output Lag) listed per trophy. Trophies 51–55 are hidden ones whose exact triggers were still unconfirmed when the page was written, and their guides say so instead of inventing steps.
- **Dark, plain, fast.** No framework, no build step, no trackers — a handful of ES modules and one CSS file.

## Run it locally

```bash
node serve.ts
```

Then open <http://localhost:8080>. The server is a tiny static file server over the standard library; `app/index.html` is the entry point, and opening it directly from disk works too.

## Verify the submission bundle

The packer copies `app/` (and `screenshots/`, when present) into the output directory and writes `dossier.json` beside them:

```bash
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Without `MAKEFUN_OUTPUT_DIR` it writes to `/output`, which is what the grader does. A clean way to check the result is reproducible is to run it twice into separate directories and diff them:

```bash
mkdir -p out out2
MAKEFUN_OUTPUT_DIR=out node main.ts
MAKEFUN_OUTPUT_DIR=out2 node main.ts
diff -r out out2
```

Both runs must exit 0 and `diff` must print nothing.

## Layout

```
app/                 the whole app: index.html, style.css, app.js, data/trophies.json
screenshots/         four 1280x720 views of the running guide (the first by name is the cover)
shots.json           which view each screenshot was taken of
serve.ts             local static server (node serve.ts → http://localhost:8080)
main.ts              packer: copies the app, writes dossier.json via vendor/makefun-frontend.ts
vendor/              vendored make.fun library (do not edit)
```

`vendor/makefun-frontend.ts` is left byte-for-byte as shipped: the scorer compares `dossier.json` with what its own copy of the library produces.

## Licence

MIT — see [LICENSE](LICENSE).
