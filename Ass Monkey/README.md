# Ass Monkey Empire

A side-scrolling jungle platformer trilogy in a single HTML file. It remakes the structure and gameplay of the three 16-bit *Donkey Kong Country* games with original characters, enemies, levels and music. Everything is rendered in real-time 3D with three.js: soft shadows, bloom, swaying foliage, glowing lava, parallax 3D backdrops and procedural textures.

| Game | Heroes | Worlds |
| --- | --- | --- |
| **Ass Monkey Empire**: The Banana Heist | Bongo (silver-maned hamadryas: strong, ground slap) & Pip (olive baboon: fast, high jumper) | Banana Jungle, Rumble Mines, Creeper Valley, Frostbite Peaks, Croc & Co. Works, Hollow Caverns, The Rusty Galleon |
| **Ass Monkey Empire 2**: Pip's Pirate Panic | Pip & Lulu (yellow baboon: glides by spinning her tail) | Galleon Cove, Magma Bay, Croc Quay, Carnival Crags, Spooky Hollow, Croc Keep, Sky Galleon, secret Lost Isle |
| **Ass Monkey Empire 3**: Lulu's Double Trouble | Lulu & Bobo (black-furred baby baboon: heavy, ground slap) | Lakeside Landing, Pinewood Forest, Waterfall Cove, Mekanos Works, Frosty Ridge, Razorback Cliffs, Kaos Core, secret Lost Volcano |

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/Ass%20Monkey/>

**Locally:** from the root of the repository run

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Ass%20Monkey/>.

## How it plays

The heroes are baboons, with long muzzles, arched tufted tails and bright red rumps, and they gallop on all fours. You control a pair: the leader plays and the partner follows. If you get hit, the leader runs off and the partner takes over. Break a **DUO** barrel to get them back. If you get hit with only one monkey left, you lose a life.

- **Level types:** jungle runs, treetops with swinging vines and ropes, underwater swims, barrel-cannon chains, mine carts and roller coasters, lights-out caves, slippery ice, factories with moving and falling platforms, bramble mazes, ship rigging, lava lakes, and climbs with rising lava or floodwater.
- **Barrels:** pick up and throw wooden barrels, steel kegs and TNT. Barrels are the only way to beat spiky stingers and some bosses.
- **Animal buddies:** Tusk the warthog charges through enemies, Sprong the frog jumps very high, and Narly the narwhal dashes underwater.
- **Collectibles:** 100 bananas give an extra life, as do the letters **B-U-T-T**. Purple **B** cannons launch you into timed bonus rooms that award bonus medals. Medals unlock the secret worlds in games 2 and 3.
- **Bosses:** every world ends with a boss: giant beavers, wasp queens, swooping birds, enemy-spawning drums, a yeti and Captain Gnarltooth himself.

Progress, lives and medals are saved per game in the browser's `localStorage`. The Options menu toggles between High and Fast graphics.

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move · climb · swim | Arrow keys / WASD | Left stick / D-pad |
| Jump · swim stroke · fire barrel cannon | Space / K / Z | ✕ / A |
| Run · roll · hold to carry a barrel, release to throw | Shift / J / X | □ / X · R2 |
| Ground slap (Bongo, Bobo) | ↓ + run | ↓ + □ |
| Glide (Lulu) | Hold jump while falling | Hold ✕ |
| Team-up throw (games 2 & 3), hold ↑ to throw high | E / L / C | △ / Y · L2 |
| Swap monkeys | Q / Tab | L1 / R1 |
| Pause | Esc / P | Options / Start |

## Notes

The levels follow the world order, level types and pacing of the originals, but every layout is original. The game builds them from hand-made chunks that are seeded per level, so a level is the same every time you play it. No assets, code or data come from the original cartridges. The `referentie/` folder with the reference ROMs is git-ignored and must never be committed.
