# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Sidiq66/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Sidiq66/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Ledger is an offline guide and tracker for all 55 PlayStation 5 trophies in Grand Theft Auto VI. Every trophy appears with its official name, description and grade exactly as PlayStation publishes them, and beside each one sits a guide written for this page in our own words — what to do, where it happens, and when it can be missed — with its sources named next to it, because a cited guide beats an uncited one. Each guide now also opens with a numbered "How to earn it" checklist distilled from it, and the entries that carry a hard-won lesson add a field tip of their own. The one trophy that can be missed, Positive Mental Attitude, is flagged wherever it appears — including a standing alert in the header for as long as it is unearned.

The guide is built around a five-phase platinum roadmap (difficulty 4/10, roughly 200 hours, a single playthrough) that opens with the chapter-save habit the game's lack of mission replay demands and the warning that cheats disable trophies and saving, then walks the story, the 100% completion checklist, the strangers and character cleanup, and the money trophies that close the list out. A closing free-roam sweep block gathers every trophy the five phases leave behind — the money climbs, the collectible sets, the stunt and vehicle lists and the platinum itself — so all 55 trophies sit somewhere on the road, and each block carries its own progress meter fed by the tracker. A spoiler shield masks the 28 secret trophies — names, descriptions and guides — until you mark them earned, so the checklist is safe to browse before finishing the story.

It is a tracker as well as a guide: tick trophies off as you earn them and the header keeps your count, your PlayStation points out of the list's 1,350, a progress bar and a per-grade tally, and names the next trophy waiting on the road. Kind chips, a grade filter, four sort orders (guide order, name, grade and points) and a remaining-only switch narrow the shelf beside the search box. Progress is saved in the browser's localStorage and can be exported to a JSON file and imported back on another machine. The app itself is plain HTML, CSS and JavaScript plus one data file under app/ — no build step, no accounts, and no network requests at run time.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser. Any static file server with app/ at its root works just as well.

---

<sub>Entered on [make.fun](https://make.fun/?ref=x9j98tfg&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
