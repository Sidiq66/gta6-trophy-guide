# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Sidiq66/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Sidiq66/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An entry to the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun.

A complete, offline trophy guide and tracker for **Grand Theft Auto VI** (PlayStation 5). All **55 trophies** are here with their official names, descriptions and grades — 46 bronze, 6 silver, 2 gold and the platinum — each with a guide written for this app and the sources for that guide named beside it.

## What it does

- **The full list, readable.** Every trophy with its grade, point value (standard PlayStation values: bronze 15, silver 30, gold 90, platinum 300 — 1,350 in total), kind (story / missable / collectibles / activities / online / platinum), roadmap phase, and target count where PlayStation tracks one.
- **A guide per trophy, with sources.** Unlock conditions, mission and chapter gates, thresholds and locations, each cited. Where the sources have not confirmed a trigger — five secret trophies, at the time of writing — the guide says exactly that instead of inventing steps.
- **The one missable, flagged everywhere.** Positive Mental Attitude can lose a required meditation when Chapter 1 ends. It carries a warning in the list, in its detail view, and in Phase 1 of the roadmap.
- **A platinum roadmap.** Five phases from the first mission to cleanup, built from the game's own gates: chapter unlocks, the Chapter 2 moment the pair can roam together, the 100% checklist after the credits (about 60% of the game, not all of it), and the secret trophies last.
- **A tracker that remembers.** Tick trophies off; the header counts earned trophies and points and the bar fills. Progress persists in the browser (localStorage) and can be exported to — and imported from — a small JSON file.
- **A spoiler shield.** While it is on, the 28 secret trophies show as "Hidden trophy" in the list, the detail panel and the roadmap until you earn them; the 27 visible trophies always read in full. Search, kind filters and a grade filter round out the toolbar.
- **Fully offline.** No accounts, no network calls, no external assets — open the page and everything, data included, is already on the device.

## Run it

With Node (standard library only, nothing to install):

```sh
node serve.ts            # or: node serve.ts --port 9000
```

then open <http://localhost:8080>. Any static file server pointed at `app/` works just as well. Fixed screenshot states are available as `?shot=list`, `?shot=detail&trophy=<id>`, `?shot=roadmap` and `?shot=tracker` (see `shots.json`).

To rebuild the submission dossier exactly as the grader does:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/app, out/screenshots, out/dossier.json
```

## Data sources and credits

- **Trophy names, descriptions and grades:** the official PlayStation 5 trophy list for Grand Theft Auto VI, as published with the competition brief.
- **Guide facts:** the [PowerPyx GTA 6 trophy guide & roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) (roadmap, difficulty 4/10, ~200 hours, per-trophy unlock points and the missable warning) and the [GTA Zone trophy list](https://gta-zone.com/news/gta-6-trophies-achievements/) (which trophies are hidden, and per-trophy unlock lines). Every trophy's detail view cites the specific sources its guide rests on. All guide text is original to this app; no guide text was copied.
- **Hidden/visible split:** 28 secret and 27 visible trophies, per GTA Zone's list.

An unofficial fan work. No Rockstar Games logo, artwork or font is used anywhere in the app or the screenshots, and nothing here is affiliated with or endorsed by Rockstar Games, Take-Two Interactive or PlayStation.

## License

MIT — see [LICENSE](LICENSE).
