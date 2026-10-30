# Parcour Hobbits

A remaster of the 16-bit plumber platformers (*Super Mario All-Stars*, *Super Mario World* and *Yoshi's Island*) in a single HTML file, with hobbits instead of plumbers and Truffle the pig instead of the dinosaur. The gameplay, power-ups and level types follow the originals; the art, levels and music are original and made in code.

The levels are rendered in real 3D with [three.js](https://threejs.org/) (r169, loaded from a CDN): solid blocks with grassy tops, round glossy pipes, spinning metal coins, low-poly trees, hills with hobbit-hole doors, fences, flowers, stalactites, crystals, castle pillars and torches, all lit by the sun with soft shadows, plus point lights for lanterns, torches, lava and fireballs, fog and bloom. The hand-drawn characters, enemies and items stand in that world as lit billboards with contact shadows (an HD-2D look). The physics stay exactly 2D, so the game plays like the originals. Without WebGL the game falls back to a painted 2D renderer; the Options menu switches between 3D high, 3D fast and 2D classic.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/Parcour%20Hobbits/>

**Locally:** from the root of the repository run

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Parcour%20Hobbits/>.

## The six games

| Game | Remake of | What's special |
| --- | --- | --- |
| **Parcour Hobbits**: The Shire Quest | *Super Mario Bros.* | 8 worlds × 4 levels, flagpoles, castles with a bridge, an axe and the orc king Grubnak |
| **Parcour Hobbits**: The Lost Paths | *The Lost Levels* | Harder layouts, gusts of wind and poison toadstools |
| **Parcour Hobbits 2**: Dreamland Picnic | *Super Mario Bros. 2* | Pick Merric, Lollo, Rosie or Hamfast; pluck turnips, ride and throw enemies, hearts instead of shrinking, an egg-spitting boss at the end of every level |
| **Parcour Hobbits 3**: Eight Kingdoms | *Super Mario Bros. 3* | World maps with hobbit holes, a P-meter, oak-leaf flight, frog, badger and dwarf suits, fortresses, airships and goal cards |
| **Parcour Hobbits World**: Truffle's Island | *Super Mario World* | Ride Truffle the pig, fly with the elven cloak, spin jump, dragon runes, ghost houses, goal tape and the Star Path |
| **Truffle's Island**: Parcour Hobbits Babies | *Yoshi's Island* | Truffle carries Wee Merric: flutter jump, ground pound, snuffle enemies into truffle eggs and throw them; if Truffle is hit, catch the baby's bubble before the star countdown runs out |

## How it plays

- **Power-ups:** the golden mushroom makes you big, the firethorn blossom throws fireballs, the elfstar makes you invincible, and the green mushroom is an extra life. Game 3 adds the oak leaf (squirrel tail: whip and fly when the P-meter is full), the frog suit (strong swimmer), the badger suit (fly, and turn to stone with C) and the dwarf suit (throws hammers). The World game has the eagle feather (elven cloak: glide, and spin to hit enemies) and an item box that drops a spare power-up when you get hurt.
- **Enemies:** mushlings, snails (stomp them into a shell, then kick or carry it), winged snails, hedgehogs, snapweeds in pipes, a cloud imp that throws burrs, cannons, hammer goblins, leaping fish, inklings, firebars, lava embers, wisps that freeze when you look at them, crushers, rattlebones and dino-goblins, plus hoodlings and hopbirds in the dream and island games.
- **Level types:** overland, underground, treetops and mushroom platforms, underwater, castles, fortresses, ghost houses, airships, sky levels, desert, snow and lava, each with its own backdrop, weather and music.
- **Pipes and bonus rooms:** some pipes can be entered with ↓. They lead to an underground coin room, and the side pipe at its end brings you back up out of a pipe further along the level. The first two games never scroll back, the first ? block of every level holds a power-up, and some levels hide an invisible 1-up block.
- **Collectibles:** 100 coins give an extra life. The World game has five dragon runes per level, Game 3 gives an extra life for three goal cards (more for a matching set), the dream game has cherries that summon a star, and the island game has flowers, red coins and stars.
- **Bosses:** Grubnak waits on a bridge over lava at the end of every castle in the first two games, Gobblebeak spits eggs you can ride and throw back, airship captains and rattlebones guard Game 3, and a giant hoodling guards the island forts.

Progress, lives, items and cleared levels are saved per game in the browser's `localStorage`. The Options menu switches between High and Fast graphics and sets the volumes.

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move · climb · duck | Arrow keys / WASD | Left stick / D-pad |
| Jump (hold for higher, tap to flap a tail, hold to glide, float or flutter) | Space / Z / K | Ⓐ / ✕ |
| Run · fireball · hammer · tail whip · pick up and throw · Truffle's snout | Shift / X / J | Ⓧ / Ⓨ / R2 |
| Spin jump and hop off Truffle (World) · badger statue (Game 3) · hold to aim a truffle egg, release to throw (Island) | C / E / L | Ⓑ / ○ |
| Ground pound (Island) | ↓ in the air | ↓ |
| Super jump (Game 2) | Hold ↓, then jump | Hold ↓ |
| Enter a pipe | ↓ on top of it | ↓ |
| Change world on the map · open items (Game 3) | Q / R · C | L1 / R1 · Ⓑ |
| Pause | Esc / P | Start |

On touch screens the game shows a joystick and A, B and C buttons.

## Notes

Levels are built from hand-tuned chunks that are seeded per level, so every level is the same each time you play it. No assets, code or data come from the original cartridges. The `reference/` folder with the reference ROMs is git-ignored and must never be committed.
