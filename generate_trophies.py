#!/usr/bin/env python3
"""Build app/data/trophies.json for Leonida Ledger.

The official fields (name, description, grade) are read from the kit
starter's trophy list so they stay exactly as PlayStation publishes them.
Everything else — kind, secret flag, points, the missable flag, the guide
text and its named sources — is enrichment written for this entry from
research done in the build session (PowerPyx's GTA 6 trophy guide and
roadmap, GTA Zone's trophy list, PlanetGTA6's list cross-check and
Output Lag's trophy list). The script validates the result against the
starter list before writing: 55/55 names, descriptions and grades exact,
1 platinum / 2 gold / 6 silver / 46 bronze, kinds 19 story / 1 missable /
4 collectibles / 30 activities / 0 online / 1 platinum, 28 secret,
1,350 points in total.
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent
STARTER = (
    REPO.parent
    / "gta6-trophy-guide-01-kit-l27"
    / "gta6-trophy-guide-01-kit"
    / "starter"
    / "app"
    / "data"
    / "trophies.json"
)
OUT = REPO / "app" / "data" / "trophies.json"

POWERPYX = {
    "name": "PowerPyx — GTA 6 Trophy Guide & Roadmap",
    "url": "https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/",
}
GTA_ZONE = {
    "name": "GTA Zone — GTA 6 Trophy List: All 55 Trophies and Achievements",
    "url": "https://gta-zone.com/news/gta-6-trophies-achievements/",
}
PLANET = {
    "name": "PlanetGTA6 — GTA 6 Trophies (list cross-checked with Exophase and PSNProfiles)",
    "url": "https://www.planetgta6.com/en/gta-6-trophies/",
}
OUTPUTLAG = {
    "name": "Output Lag — GTA 6 Trophy List: All 55 Trophies and Achievements",
    "url": "https://outputlag.com/guides/gta-6-trophy-list/",
}

POINTS = {"bronze": 15, "silver": 30, "gold": 90, "platinum": 300}

# The 28 trophies PlayStation hides until they are earned, by starter id:
# every story trophy plus the cryptic one-offs, as listed by GTA Zone and
# PlanetGTA6 (27 visible / 28 hidden).
SECRET_IDS = {
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 29,
    37, 38, 44, 45, 46, 47, 48, 49, 50, 51,
}

# Enrichment by starter id: (kind, guide, sources). Guide text is written
# for this entry; the facts in it come from the cited sources.
ENRICH = {
    1: ("platinum",
        "The platinum awards itself once the other 54 trophies are earned — "
        "there is no multiplayer and no DLC in the list, so everything else "
        "in this guide is effectively the checklist for this one. Work the "
        "roadmap in order and this is the last trophy that pops.",
        [POWERPYX]),
    2: ("story",
        "Unmissable story trophy: it unlocks on its own when you finish "
        "Gone Fishing, the opening main mission of Chapter 1. Nothing to "
        "prepare — just start the game.",
        [POWERPYX]),
    3: ("story",
        "Unmissable story trophy for completing Chapter 1. It actually pops "
        "as you finish the first main mission of Chapter 2 (What's in the "
        "Bag?), so do not worry if the credits for the chapter roll first.",
        [POWERPYX]),
    4: ("story",
        "Unmissable story trophy for completing Chapter 2. It pops as you "
        "finish the first main mission of Chapter 3 (Welcome to Vice City).",
        [POWERPYX]),
    5: ("story",
        "Unmissable story trophy for completing Chapter 3. It pops after "
        "you complete the first two main missions of Chapter 4 (Ocean "
        "Beach and Another Life).",
        [POWERPYX]),
    6: ("story",
        "Unmissable story trophy for completing Chapter 4. It pops after "
        "the chapter's final main mission, Starting From Zero.",
        [POWERPYX]),
    7: ("story",
        "The gold trophy for completing the story's final mission — "
        "automatic and unmissable. Keep a manual save before the endgame: "
        "there is no mission replay, so a chapter-start save is your only "
        "way back.",
        [POWERPYX]),
    8: ("story",
        "Unmissable story trophy: it unlocks during Breakfast Run, a main "
        "mission in Chapter 2.",
        [POWERPYX]),
    9: ("story",
        "Unmissable story trophy: it unlocks during The Cartel Heist, a "
        "main mission in Chapter 3.",
        [POWERPYX]),
    10: ("story",
        "Unmissable story trophy: it unlocks during Child's Play, a main "
        "mission in Chapter 4.",
        [POWERPYX]),
    11: ("story",
        "Unmissable story trophy: it unlocks during Headliners, a main "
        "mission in Chapter 4.",
        [POWERPYX]),
    12: ("story",
        "Unmissable story trophy: it unlocks during VCIA Takedown, a main "
        "mission in Chapter 4.",
        [POWERPYX]),
    13: ("story",
        "Unmissable story trophy: it unlocks during Operation Savage "
        "Glory, a main mission in Chapter 5.",
        [POWERPYX]),
    14: ("activities",
        "The long gold. The 100% checklist unlocks after the story under "
        "Progress > Stats > 100% Completion, and progress made during the "
        "story already counts. It is far more forgiving than it sounds — "
        "roughly 60% of true completion: most collectible types and side "
        "quests are not required at all, you need any 200 of 277 vehicles "
        "scanned, 100 of 255 animals studied through binoculars, and any "
        "70 of the 80 challenges. The only tasks that demand everything "
        "are Robberies, Underwater Discoveries, Shooting Ranges, Drone "
        "Races and Bret's Quests. Nothing toward it is missable.",
        [POWERPYX, GTA_ZONE]),
    15: ("activities",
        "Complete any 250 of the 397 stunts: 130 stunt jumps, 202 "
        "under-the-bridge flights, 40 knife flights and 25 base jumps, "
        "mixed however you like. The bridge flights are the quickest to "
        "bank. Track progress by region under Progress > Activities > "
        "Stunts, or by name on the map's Exploration layer. Note the 100% "
        "checklist asks for 300 stunts, so this trophy lands on the way.",
        [POWERPYX]),
    16: ("activities",
        "Try each of the 9 tracked activity types once: fishing, hunting, "
        "golf, shooting ranges, pool, basketball, playing a video game, "
        "winning a race or drone race, and performing a stunt. The story "
        "introduces most of them and the rest appear as you unfog the map; "
        "check what is missing under Progress > Activities. In practice "
        "this pops on its own while you work on everything else.",
        [POWERPYX]),
    17: ("activities",
        "Earn a gold medal in all 42 Shooting Range challenges, spread "
        "across 12 range locations. Gold medals here also feed the 100% "
        "checklist, which requires the ranges in full, so there is no "
        "shortcut version of this one — settle in and learn each weapon "
        "class's target pattern.",
        [POWERPYX]),
    18: ("activities",
        "Win a Top Fun drone race at every one of the 14 locations. There "
        "are 42 drone races in total, but the trophy only needs one win "
        "per location, so take the shortest course each site offers.",
        [POWERPYX]),
    19: ("activities",
        "Win 20 different races — they must be distinct events, not the "
        "same one repeated. There are 40 unique race locations, so pick "
        "the shortest street races and skip anything that keeps beating "
        "you.",
        [POWERPYX]),
    20: ("activities",
        "After Chapter 1's Feng Shui mission introduces Cal, he will text "
        "you a fishing spot marked with a purple icon on the map. Follow "
        "his fishing questline and beat him in the fishing challenge to "
        "earn this.",
        [POWERPYX]),
    21: ("activities",
        "Complete one arcade game in full — finishing all of its levels "
        "once is enough, its challenges are not required. Three of the "
        "four games (Tenebrae Lux, Street Trash III, Time Jackers Rewind) "
        "are playable on the TV at home from Chapter 1; the fourth, Bang "
        "For Your Buck, sits on arcade machines around the world.",
        [POWERPYX]),
    22: ("story",
        "Finish Andy's optional questline, which is exclusive to Lucia "
        "and marks itself automatically in Chapter 3: she calls, then "
        "texts her home address in Belville. The line runs five quests — "
        "Climbing the Cellerichain (parts 1–3), Pay the Cellerica Fee, "
        "Peach!, Read the Label and Puff Puff Pass. It stays available "
        "after the story, so it cannot be missed.",
        [POWERPYX]),
    23: ("story",
        "Finish Kenton's treasure-diving questline. It marks itself in "
        "Chapter 1 (the green KR icon in Key Lento) after Island Dreams: "
        "he sends you to purple-marked shipwrecks, where you dive and use "
        "the metal detector to dig up treasure and bring it back — 7 "
        "wrecks in total. Kenton becomes temporarily unavailable after "
        "Chapter 1 but returns during Chapters 2–3, and everything stays "
        "available after the story, so this is not missable. Track it "
        "under Progress > Characters > Kenton Rees.",
        [POWERPYX]),
    24: ("story",
        "Finish Billy's optional questline at the Thrillbilly Mudclub in "
        "Kelly County, which marks itself after Chapter 2's Coffee Break. "
        "Five quests: Thrillbillies, Twist Wrist Smash Grab, Mall Rats, "
        "The Impaler and Hometown Heroes. All of them remain available "
        "after the story.",
        [POWERPYX]),
    25: ("story",
        "Complete 8 mission strands for strangers. Only certain open-world "
        "questlines count as strangers — confirmed strands include Kirk "
        "(the Skunk Ape hunt), Kyle, Yago and Pilot Pete — while many "
        "character questlines (Moses, Tyrone, Andy, Billy and others) do "
        "not count toward this trophy even though they are worth doing. "
        "Strangers remain findable in free-roam after the story, and the "
        "trophy tracker shows how many strands you have banked.",
        [POWERPYX]),
    26: ("story",
        "Finish Randy's Wish List. After Chapter 3's Clonin' Keys, Makin' "
        "GS delivers him the first car, Randy (green RK icon, west Vice "
        "City) asks for 16 named sports cars in total. He marks some in "
        "fixed spots; the rest you find yourself — scan high-end cars "
        "with the WAiNK app to see if one is on the list, then drive it "
        "back to his garage, ideally undamaged for a better payout. The "
        "list can be finished after the story.",
        [POWERPYX]),
    27: ("story",
        "Finish Tyrone's optional questline, which is Jason-only and "
        "marks itself after Chapter 3's Here, Kitty Kitty. First destroy "
        "the Synthetic Labs around Vice City (the Take Out Kitty Litter "
        "quest); after enough labs are down, Tyrone hands you his second "
        "quest, Spin On This, which earns the trophy. Still available "
        "after the story.",
        [POWERPYX]),
    28: ("missable",
        "Meditate at all 18 meditation spots, spread across 10 locations. "
        "Meditating at a spot with both Jason and Lucia counts double, "
        "and you can track the count under Progress > Collections > "
        "Exploration > Meditations. WARNING — the one missable trophy in "
        "the game: the first meditation happens at Jason's house during "
        "Chapter 1, when Lucia says she is going to meditate and walks "
        "out to the balcony after the Down to Earth mission. Follow her, "
        "accept, and meditate with her. That spot becomes permanently "
        "unavailable once Chapter 1 ends, and whether it is strictly "
        "required is still being confirmed — PowerPyx's author had done "
        "it when the trophy popped, so treat it as required. Keep a "
        "manual save at the start of Chapter 1 as insurance, because "
        "there is no mission replay.",
        [POWERPYX, GTA_ZONE]),
}

ENRICH.update({
    29: ("story",
        "Finish Bret Vogel's hunting questline, which is exclusive to "
        "Jason: after Chapter 2's Coffee Break, Bret texts you his first "
        "quest, Veteran Hunted, in Lummox County. He then marks hunting "
        "spots where you hunt the animals he requests and bring them back "
        "to him — the requests are tracked as Target Decks (Map > "
        "Activities), and all 15 decks are needed for the 100% checklist, "
        "so this trophy arrives along the way. It is still being "
        "confirmed which specific animal completes the line. Bret lends "
        "you the Killtelligence SM-69 rifle; one clean shot keeps an "
        "animal pristine and pays more, but that is optional.",
        [POWERPYX]),
    30: ("collectibles",
        "Complete any 3 collectible card sets. There are 18 sets in "
        "total, so pick the three whose cards cluster closest together "
        "and leave the rest — no trophy or checklist entry needs them "
        "all.",
        [POWERPYX]),
    31: ("collectibles",
        "WAiNK It — scan — at 100 locations. WAiNK targets are landmarks "
        "(31), curiosities (35), sculptures (23) and No Flusher tags "
        "scattered over the state; scan one by holding Up and then R1 "
        "while looking at it. There are more than 100 in the world, so "
        "any hundred you pass on your travels will do.",
        [POWERPYX]),
    32: ("activities",
        "Complete 50 challenges. There are 80 in the game and the 100% "
        "checklist needs any 70 of them, so this trophy unlocks on the "
        "way if you keep challenges in your rotation. Track them under "
        "Progress > Challenges and save it for late in the run — by then "
        "most will already be done without trying, and you can cherry-"
        "pick the quickest of what is left.",
        [POWERPYX]),
    33: ("activities",
        "Lose a 4-star wanted level while your partner is with you. This "
        "needs both characters free-roaming together, which unlocks "
        "after Chapter 2's Coffee Break: call your partner in, cause "
        "enough carnage to reach 4 stars, then break line of sight and "
        "leave the red heat zone — the trophy pops when you exit the "
        "heat, not the search area. A fast motorcycle helps, and the "
        "train tunnel north of Ambrosia in Kelly County is a reliable "
        "escape because helicopters cannot track you inside. It also "
        "comes automatically during the Chapter 4 bank-vault mission "
        "line, which forces 4-star escapes.",
        [POWERPYX]),
    34: ("activities",
        "Rob 3 shops back-to-back with your partner while your wanted "
        "level stays up the whole time — if you lose the flashing "
        "wanted level, the chain breaks. Bring armour and healing, call "
        "your partner in, and work a tight cluster: the three jewelry "
        "stores in the north of Vice City (available after Chapter 3's "
        "Yasmani's Jewelry Jobs) are ideal. Loot a couple of items per "
        "store and crack the back-room safe if you can; the trophy pop "
        "can lag about 30 seconds after the third shop, and hitting a "
        "fourth shop is the fallback if it does not register.",
        [POWERPYX]),
    35: ("collectibles",
        "Discover 100 vehicles by scanning them with the WAiNK app: hold "
        "Up to raise the app, look at a vehicle and hold R1 to scan it. "
        "Scanning is enough — you never have to drive them. The fastest "
        "way is to stand on a busy road and scan traffic as it passes. "
        "The 100% checklist wants 200 of the 277 base models scanned, so "
        "starting early makes this one automatic. Check totals under "
        "Progress > Vehicles.",
        [POWERPYX]),
    36: ("activities",
        "Take down 5 enemies inside a single Combat Focus activation "
        "(L3 + R3 while aiming): time slows and weak spots light up, "
        "but the purple focus bar only lasts a few seconds. Prepare "
        "first — eat, drink or shower to buff focus, use Adrenaline to "
        "stretch the timer, wear body armour, and line the five up at a "
        "gang operation with an accurate full-auto rifle such as the "
        "Duke 556. It does not appear to count on police, soldiers or "
        "civilians. Raising Focus to level 4 (shooting ranges, golf, "
        "pool, fishing, headshots) makes the window much more forgiving, "
        "and most players earn it naturally by then.",
        [POWERPYX]),
    37: ("activities",
        "Make an unscheduled departure from VCIA: steal one of the large "
        "passenger planes docked at a departure terminal's boarding "
        "bridge — planes parked on the open airfield do not count. The "
        "easiest sits at terminals E3/E4; slip through the fence, use "
        "the stairs by the bridge to board, taxi back to the runway, "
        "take off and fly roughly 1 km away from the airport for the "
        "(slightly delayed) pop.",
        [POWERPYX]),
    38: ("activities",
        "Steal a Rhino tank and make some noise. The tanks sit in the "
        "south of Mile Zero Air Station, the island at the south-west "
        "edge of the map in Mariana County — drive through the gate or "
        "take the stunt jump by the south-east entrance, climb in, and "
        "shoot enemies until the trophy unlocks.",
        [POWERPYX]),
    39: ("activities",
        "Rob a jewelry store without being detected. This needs the Snap "
        "Gun, the silent lockpick gadget unlocked by Chapter 3's "
        "Yasmani's Jewelry Jobs, which also unlocks the jewelry store "
        "robberies themselves (green icons). Enter through the back "
        "door with the Snap Gun instead of kicking it in, find the note "
        "with the safe code in the back room, and empty the safe. "
        "Richardson Jewelry & Diamonds in Vice City is a good first "
        "target.",
        [POWERPYX]),
    40: ("activities",
        "Rob 5 bank vaults and escape. Vault jobs unlock with Chapter "
        "4's optional mission That's Where The Money Is…, which walks "
        "you through the first: tail the security van, slip in while "
        "the vault is open, and split the cash with your partner. After "
        "that, Yasmani sells security-van tips for $10,000 that mark "
        "more vans to follow. Every vault job brings an instant 4-star "
        "wanted level, so escape on a fast motorcycle and swap vehicles "
        "afterwards. There are 8 large bank jobs and the 100% checklist "
        "wants all of them (up to $205,000 each), so this silver lands "
        "on the way.",
        [POWERPYX]),
    41: ("activities",
        "Rob an armored truck and escape the red heat zone. The bank-"
        "vault jobs unlocked by Chapter 4's That's Where The Money Is… "
        "count automatically — tailing the truck to the bank and "
        "emptying its vault is the same robbery. To do it earlier, "
        "block a roaming armored truck near a bank, blow its rear doors "
        "with a sticky bomb (Yasmani's shop stocks them after his "
        "Chapter 3 quests), grab the cash and get out of the heat.",
        [POWERPYX]),
    42: ("collectibles",
        "Explore all of Leonida — fully unfog the map. Driving every "
        "road takes forever; the practical method is to take a plane "
        "and sweep the regions still blacked out until the whole map "
        "is revealed.",
        [POWERPYX]),
    43: ("activities",
        "Rob an illegal operation belonging to each of the 9 gangs. "
        "There are 39 gang operations in total, marked with yellow "
        "icons as you come near them (many are also marked by story "
        "progress), but the trophy only needs one per gang. Track your "
        "per-gang count under Progress > Gangs. The 100% checklist "
        "wants all 39, so this arrives on the way.",
        [POWERPYX]),
    44: ("activities",
        "The trigger for this trophy is currently unknown. PowerPyx's "
        "trophy guide lists it as not yet figured out, and no other "
        "named guide has published a confirmed method — the official "
        "description (a cocktail with a view on Ocean Beach) is the "
        "only clue so far. Treat any exact steps you see elsewhere as "
        "unverified until a named guide confirms them.",
        [POWERPYX, OUTPUTLAG]),
    45: ("activities",
        "The trigger for this trophy is currently unknown. PowerPyx's "
        "trophy guide lists it as not yet figured out, and no other "
        "named guide has published a confirmed method — the official "
        "description (smashing out of a vehicle showroom in classic "
        "style) is the only clue so far. Treat any exact steps you see "
        "elsewhere as unverified until a named guide confirms them.",
        [POWERPYX, OUTPUTLAG]),
    46: ("activities",
        "Steal all 3 key valuables at Kingpin Bowling in Port Gellhorn — "
        "one of the gang operations, visited during Chapter 2's optional "
        "mission Hit Kingpin Bowling. The three: the luxury watch in "
        "the south-east office, the unique Gutterball Moreland 850 "
        "shotgun on the table in the north-east corner, and the safe in "
        "the north-east office, which you open with sticky bombs (buy "
        "them at Ammu-Nation first). The trophy pops after you escape "
        "the police, not on the third pickup, and the valuables can be "
        "collected across separate visits if the robbery icon respawns "
        "— so despite the story timing, this one is not missable.",
        [POWERPYX]),
    47: ("activities",
        "Reach maximum Strength with both Jason and Lucia at the same "
        "time. Check the stat under Touchpad > Jason & Lucia > Strength. "
        "From Chapter 2's Coffee Break onward you can call your partner "
        "along, and while one character works out at a fitness club the "
        "other trains automatically — double progress for single "
        "effort. Filter the map's Activities layer for fitness clubs; "
        "working out at home after the story also counts.",
        [POWERPYX]),
    48: ("activities",
        "Perform 500 actions that move your Criminal Profile. Turn on "
        "the profile notifications (Settings > UI > HUD Notifications > "
        "Criminal Profile) and a small icon appears whenever an action "
        "registers — clean robberies and evidence destruction push you "
        "toward Professional, incapacitating enemies toward Hardened, "
        "killing toward Violent and Psycho. Almost everything you do "
        "for the other trophies counts, so this fills passively; if it "
        "is somehow short at the end, repeated robberies farm it fast. "
        "One caution: the Irredeemable profile is permanent and makes "
        "police far more aggressive, so avoid sustained excessive "
        "violence.",
        [POWERPYX]),
    49: ("activities",
        "The trigger for this trophy is currently unknown. PowerPyx's "
        "trophy guide lists it as not yet figured out (they note it is "
        "believed to involve the Payday Loans store from the prologue, "
        "but that is unconfirmed), and no other named guide has "
        "published a confirmed method. Treat any exact steps you see "
        "elsewhere as unverified until a named guide confirms them.",
        [POWERPYX, OUTPUTLAG]),
    50: ("activities",
        "The trigger for this trophy is currently unknown. PowerPyx's "
        "trophy guide lists it as not yet figured out (they note it is "
        "believed to come from a UFO questline, but that is "
        "unconfirmed), and no other named guide has published a "
        "confirmed method. Treat any exact steps you see elsewhere as "
        "unverified until a named guide confirms them.",
        [POWERPYX, OUTPUTLAG]),
    51: ("activities",
        "The trigger for this trophy is currently unknown. PowerPyx's "
        "trophy guide lists it as not yet figured out (they note it is "
        "believed to involve kicking enemies while riding a motorcycle, "
        "but that is unconfirmed), and no other named guide has "
        "published a confirmed method. Treat any exact steps you see "
        "elsewhere as unverified until a named guide confirms them.",
        [POWERPYX, OUTPUTLAG]),
    52: ("activities",
        "Launder $250,000 of marked bills through your fence contacts. "
        "The system unlocks after Chapter 3's Credit Check, which gives "
        "you the Dye Pack Jammer; from then on, rob banks and Payday "
        "Loans and deliver the marked bills to a fence — Yasmani in "
        "Vice City pays the most. The total accumulates across "
        "robberies, and the bank-vault jobs (up to $205,000 each) make "
        "short work of it once they unlock in Chapter 4.",
        [POWERPYX]),
    53: ("activities",
        "Spend $100,000 across all shops in total — every store type "
        "counts toward the same pot. Guns, vehicle mods and tattoos "
        "are the fastest way to burn through it; the world has dozens "
        "of outlets (24 Ammu-Nations, 67 clothing stores, 14 mod shops "
        "and more), so this is a money sink, not a scavenger hunt.",
        [POWERPYX]),
    54: ("activities",
        "Purchase all 8 garage properties. They appear in the Vice City "
        "Real Estate app that installs on your phone after Chapter 2's "
        "Daily Driver, and cost $160,000 in total — robberies, "
        "especially the higher-value ones from Chapters 3–4, fund them "
        "quickly. The 4 story garages are separate and do not count "
        "toward this trophy, but the bought garages do double duty: "
        "their parking spots are what let you register vehicles for On "
        "the Spot.",
        [POWERPYX]),
    55: ("activities",
        "Register 10 vehicles to the Scooter Bros app, which installs "
        "after Chapter 2's Moses mission and lets you summon registered "
        "cars anywhere. Drive a stolen vehicle to Moses in Port "
        "Gellhorn and choose Respray, then Register, at his garage. "
        "Each registration needs a free parking spot, so buy garages "
        "(Little Boxes) first, and register cheap low-end cars and "
        "bikes to keep the fees down. Early on Moses only accepts "
        "vehicles without trackers; from Chapter 3, cars with standard "
        "trackers can be registered at any Pay 'n' Spray.",
        [POWERPYX]),
})


def slugify(name: str) -> str:
    text = unicodedata.normalize("NFKD", name).replace("’", "'")
    text = text.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def main() -> int:
    starter = json.loads(STARTER.read_text(encoding="utf-8"))
    official = starter["trophies"]
    assert len(official) == 55, f"starter holds {len(official)} trophies"

    built = []
    for entry in official:
        tid = entry["id"]
        if tid not in ENRICH:
            print(f"missing enrichment for starter id {tid}", file=sys.stderr)
            return 1
        kind, guide, sources = ENRICH[tid]
        built.append({
            "id": slugify(entry["name"]),
            "name": entry["name"],
            "description": entry["description"],
            "grade": entry["grade"],
            "points": POINTS[entry["grade"]],
            "kind": kind,
            "secret": tid in SECRET_IDS,
            "missable": tid == 28,
            "guide": guide,
            "sources": sources,
        })

    # Validation against the starter list and the design targets.
    for want, got in zip(official, built):
        assert got["name"] == want["name"], (want, got)
        assert got["description"] == want["description"], want["name"]
        assert got["grade"] == want["grade"], want["name"]
    assert len({t["id"] for t in built}) == 55, "slugs must be unique"
    assert all(t["guide"].strip() for t in built), "every guide non-blank"

    from collections import Counter
    grades = Counter(t["grade"] for t in built)
    kinds = Counter(t["kind"] for t in built)
    secret = sum(1 for t in built if t["secret"])
    missable = [t["name"] for t in built if t["missable"]]
    points = sum(t["points"] for t in built)
    sourced = sum(1 for t in built if t["sources"])
    assert grades == {"platinum": 1, "gold": 2, "silver": 6, "bronze": 46}, grades
    assert kinds == {"story": 19, "missable": 1, "collectibles": 4,
                     "activities": 30, "platinum": 1}, kinds
    assert secret == 28, secret
    assert missable == ["Positive Mental Attitude"], missable
    assert points == 1350, points

    doc = {
        "game": starter["game"],
        "platform": starter["platform"],
        "list": "the official 55 trophies, 2026-11-18; names, descriptions "
                "and grades as PlayStation publishes them, guides and "
                "sources added by Leonida Ledger",
        "trophies": built,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n",
                   encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
    print(f"validated 55/55 names, descriptions, grades exact vs starter")
    print(f"grades: {dict(grades)}")
    print(f"kinds: {dict(kinds)} (online: 0)")
    print(f"secret: {secret} secret / {55 - secret} visible")
    print(f"missable: {missable}")
    print(f"points total: {points}; trophies with named sources: {sourced}/55")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
