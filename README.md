# Claude Code Games

A collection of browser games, mostly retro-inspired arcade games, built with Claude Code (Opus 5.5).

Each game is one self-contained `index.html`, except Tuxemon 3D and Space Fodder, which split their code into `css/` and `js/` files next to their `index.html`. There is no build step, no bundler and no game asset files: every model, texture, level and sound effect is generated in code at runtime. Neon Arkanoid, Space Fodder and Tardigrades draw on a plain 2D `<canvas>` (Tardigrades with a painted 3D look). The other games render in 3D with [three.js](https://threejs.org/), loaded from a CDN (r128 for Shakur Boy, r160–r169 for the rest).

Each folder also has a square logo, `icon.svg`, with PNG exports (`icon-512.png`, `icon-192.png`, `apple-touch-icon.png`) for buttons, launchers and home-screen shortcuts. Each page links it as its favicon and touch icon.

| Game | Folder (own README) | Genre |
| --- | --- | --- |
| **Katana Creed** | [`Katana Creed/`](Katana%20Creed/README.md) | Stealth-action ninja (Tenchu remake) |
| **X-Fighter**: Assault on the Iron Fortress | [`X-Fighter/`](X-Fighter/README.md) | 3D space combat shooter |
| **Sandstorm Circuit** | [`PodRace/`](PodRace/README.md) | Combat podracing |
| **Daido Dog Sim** | [`DaidoSim/`](DaidoSim/README.md) | Dog life sim / exploration |
| **Neon Arkanoid** | [`Arkanoid/`](Arkanoid/README.md) | Brick breaker |
| **Shakur Boy: Shroom Run 3D** | [`Shakur-Boy/`](Shakur-Boy/README.md) | Maze chase (Pac-Man style) |
| **Tuxemon 3D** | [`Tuxemon-3D/`](Tuxemon-3D/README.md) | Monster-catching RPG (Tuxemon remake) |
| **Space Fodder** | [`Space-Fodder/`](Space-Fodder/README.md) | Top-down squad shooter (Cannon Fodder style) |
| **Ass Monkey Empire** | [`Ass Monkey/`](Ass%20Monkey/README.md) | Jungle platformer trilogy (Donkey Kong Country 1–3 remake) |
| **Tardigrades** | [`Tardigrades/`](Tardigrades/README.md) | Turn-based artillery (Worms remake) |
| **Parcour Hobbits** | [`Parcour Hobbits/`](Parcour%20Hobbits/README.md) | Platformer saga (Super Mario All-Stars, World and Yoshi's Island remake) |
| **Soapbox Scramble 64** | [`Looney_Soapbox_64/`](Looney_Soapbox_64/README.md) | Cartoon kart racer (Mario Kart 64 remake) |

---

## How to play

**Online** (GitHub Pages): start from the launcher at <https://opivankristovi.github.io/Claude_Code_Games/>, which has a button for every game (mouse, touch, arrow keys or a gamepad). Hover over a button, or select it with the arrow keys, to see a short summary of the game. Drag the buttons (long-press on touch screens, or Shift + arrow keys) to put them in your own order, and pick a dark colour theme from the THEME menu; both are saved in your browser. Or go straight to a game:

- Katana Creed: <https://opivankristovi.github.io/Claude_Code_Games/Katana%20Creed/>
- X-Fighter: <https://opivankristovi.github.io/Claude_Code_Games/X-Fighter/>
- Sandstorm Circuit: <https://opivankristovi.github.io/Claude_Code_Games/PodRace/>
- Daido Dog Sim: <https://opivankristovi.github.io/Claude_Code_Games/DaidoSim/>
- Neon Arkanoid: <https://opivankristovi.github.io/Claude_Code_Games/Arkanoid/>
- Shakur Boy: <https://opivankristovi.github.io/Claude_Code_Games/Shakur-Boy/>
- Tuxemon 3D: <https://opivankristovi.github.io/Claude_Code_Games/Tuxemon-3D/>
- Space Fodder: <https://opivankristovi.github.io/Claude_Code_Games/Space-Fodder/>
- Ass Monkey Empire: <https://opivankristovi.github.io/Claude_Code_Games/Ass%20Monkey/>
- Tardigrades: <https://opivankristovi.github.io/Claude_Code_Games/Tardigrades/>
- Parcour Hobbits: <https://opivankristovi.github.io/Claude_Code_Games/Parcour%20Hobbits/>
- Soapbox Scramble 64: <https://opivankristovi.github.io/Claude_Code_Games/Looney_Soapbox_64/>

**Locally:**

```bash
git clone https://github.com/opivankristovi/Claude_Code_Games.git
cd Claude_Code_Games
python3 -m http.server 8000
```

Then open <http://localhost:8000/> for the launcher, or `http://localhost:8000/<folder>/` for a game, for example <http://localhost:8000/X-Fighter/>.

Opening `index.html` directly from disk will usually work too, but a local server is more reliable across browsers.

### Requirements

- A modern browser (current Chrome, Edge, Firefox or Safari). All games except Neon Arkanoid, Space Fodder and Tardigrades need WebGL (Parcour Hobbits falls back to a 2D renderer without it).
- An internet connection for the 3D games: three.js (and, for most of them, Google Fonts) load from CDNs. Neon Arkanoid needs no external files.
- A dedicated GPU is recommended for the 3D games. If Sandstorm Circuit stutters, press **Q** to switch to the faster graphics mode.
- Katana Creed, X-Fighter and Sandstorm Circuit: keyboard + mouse, or a standard gamepad (Xbox, PlayStation, Switch Pro layouts); no touch controls.
- Daido Dog Sim, Neon Arkanoid and Shakur Boy: keyboard (and mouse) or touch; no gamepad support.
- Tuxemon 3D: keyboard, with mouse for the menus; no touch or gamepad support.
- Space Fodder: mouse and keyboard, or touch; no gamepad support.
- Ass Monkey Empire: keyboard or a standard gamepad; no touch controls.
- Tardigrades: keyboard + mouse, or a standard gamepad; no touch controls.
- Parcour Hobbits: keyboard, a standard gamepad, or touch (on-screen joystick and buttons).
- Soapbox Scramble 64: keyboard, standard gamepads (up to four players in split-screen), or touch (on-screen stick and buttons).

---

## Katana Creed

A remake of the PS1 stealth classic *Tenchu: Stealth Assassins*: the same ten missions plus training, rebuilt with realistic 3D graphics and smooth free-run controls in the style of *Assassin's Creed* on a PS3/PS4 gamepad. Play as **Rikimaru** or **Ayame** and sneak through merchant districts, mountain checkpoints, bandit caves, a pirate harbour, a cult temple and a burning castle.

Stay in the shadows, crouch past guards and strike from behind or from above for one-hit stealth kills. If you're spotted, you fight with lock-on, blocks, parries and combos. Sprint to free-run: vault, climb walls, mantle onto roofs, vault over palisades and swing up with the grappling hook. Each mission ends with a rank from *Thug* to *Grand Master*, and progress is saved in the browser's `localStorage`.

### Controls

| Action | Keyboard / mouse | Gamepad (PlayStation layout) |
| --- | --- | --- |
| Move / camera | WASD / mouse | Left stick / right stick |
| Sprint / free-run | Shift (hold) | R2 (hold) |
| Jump · climb · leap | Space | ✕ |
| Attack · stealth kill | Left click / J | □ |
| Crouch · drop from wall | C / Ctrl | ○ |
| Lock on & block (tap to parry) | Right click / K (hold) | L1 (hold) |
| Grappling hook | E | R1 |
| Use item · interact | F | △ |
| Switch item | Q / R · mouse wheel | D-pad ◀ ▶ |
| Ki sense | Tab (hold) | L2 (hold) |
| Pause | Esc / P | Options |

---

## X-Fighter: Assault on the Iron Fortress

Fly a starfighter through a three-mission campaign against the Iron Fortress:

1. **Outer Perimeter**: break the interceptor screen by destroying 16 enemy fighters before the clock runs out.
2. **The Dreadnought**: take out the siege dreadnought's two shield-generator domes, then strike its exposed command bridge while dodging deck turrets.
3. **Trench Run**: fly the equatorial trench, avoid the barriers and turrets, and put a torpedo down the thermal exhaust port.

Each mission is timed and you have a limited number of homing torpedoes. You score points for kills and objectives, plus a time bonus and a shield bonus when you clear a mission. Your high score is saved in the browser's `localStorage`.

### Controls

| Action | Keyboard / mouse | Gamepad |
| --- | --- | --- |
| Steer | Mouse (virtual stick), WASD or arrow keys | Left stick / D-pad |
| Roll | Q / E | Right stick |
| Fire lasers (hold) | Left click / Space | RT / A |
| Homing torpedo | Right click / F | LT / B / X |
| Boost | Shift | RB / L3 |
| Brake | X | LB |
| Chase / cockpit view | V | Y |
| Pause | P / Esc | Start |
| Invert pitch | I | Back / Select |
| Mute | M | — |

---

## Sandstorm Circuit (PodRace)

A twin-engine podrace across a procedurally generated desert: **3 laps against 5 AI pilots**. Rivals shoot at you and ram you. Your pod has hull integrity, and your lasers build up heat, so firing nonstop makes them overheat.

Fly through bonus pickups on the track to collect power-ups:

| Power-up | Effect |
| --- | --- |
| Heavy Laser | Huge explosive bolts, 3× damage (12 s) |
| Multi Cannon | Five-way spread fire (12 s) |
| Warp Speed | Engine overdrive, +40% top speed (5 s) |
| Invincible | Energy shield; ram rivals aside (8 s) |
| Seeker Bolts | Lasers home in on rivals (12 s) |
| Cryo Coolant | Lasers never overheat (12 s) |
| Repair Kit | Restores 60 hull (instant) |

### Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Throttle / brake & reverse | W / S (or ↑ / ↓) | RT / LT |
| Steer | A / D (or ← / →) | Left stick |
| Handbrake (drift) | Space | LB |
| Lasers (hold, watch the heat) | Shift | RB |
| Reset onto the track | R | — |
| Start race | Enter | Start |
| Pause | P / Esc | — |
| Mute | M | — |
| Toggle graphics quality | Q | — |

---

## Daido Dog Sim

Spend a day in the meadow as a dog. Choose between two dogs, **Daido** and **Fluffy**, then play one of five levels or wander freely in **Free roam**. Each level is a short checklist of dog jobs: drinking from the stream, collecting bones, marking trees, fetching a ball or slipper for your human, and digging up or burying things. Each level begins with a poop on a marked spot and ends with the bowl of food your dog has earned. The interface is in Dutch by default, with a switch to English.

1. **First Morning**: a gentle start around the garden.
2. **Marking the Rounds**: patrol the path and leave your mark.
3. **Buried Treasure**: sniff out a bone, then hide it under the big oak.
4. **The Long Walk**: follow the stream north, then head for the fields.
5. **Hide and Seek**: your human is hiding; bring back the slipper and dig up your toys.

Levels unlock one at a time. Your progress and best time for each level are saved in the browser's `localStorage`.

### Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Move | WASD or arrow keys | On-screen joystick |
| Run | Shift | RUN button |
| Rotate camera | Drag | Drag |
| Zoom | Mouse wheel | — |
| Sit · Drink · Eat · Pee · Poo · Roll over · Lie down · Dig | 1–8 (or the action buttons) | Action buttons |
| Dig, or bury what you're carrying | 8 | Dig button |
| Switch dog | Buttons at the top right | Buttons at the top right |
| Menu | M / Esc | Menu button |

---

## Neon Arkanoid

A neon brick breaker. Six hand-built levels come first, then randomly generated levels continue for as long as you survive. The ball gets a little faster each level. You start with 3 lives (up to 6), and your high score is saved in the browser's `localStorage`.

Some bricks behave differently: **silver** bricks take 2 hits (3 after level 6), **gold** bricks are indestructible, and **explosive** bricks destroy their neighbours.

Broken bricks sometimes drop capsules. Catch them with the paddle:

| Capsule | Effect |
| --- | --- |
| **E** Expand | Wider paddle |
| **M** Multi-ball | Splits each ball into three (max 10 balls) |
| **L** Laser | Paddle shoots lasers (14 s) |
| **C** Catch | Ball sticks to the paddle until you launch it (16 s) |
| **S** Slow | Slower ball (10 s) |
| **F** Fireball | Ball passes straight through bricks, except gold (8 s) |
| **+** Extra life | One more life |

### Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Move paddle | Mouse, ← / → or A / D | Drag |
| Start, launch ball, fire laser | Click / Space / Enter | Tap |
| Pause | P / Esc | — |
| Mute | M | — |

---

## Shakur Boy: Shroom Run 3D

A Pac-Man-style maze chase in 3D with a neon look and a gangsta-rap / party theme, including drug references. You eat mushrooms (+10 each) around the maze while four police officers (Chief, Rookie, Detective and Sarge) chase you. Each of the four "XTC pills" in the corners turns the tables for a while, and you can chase down the cops; each one you catch in a row doubles in value (200, 400, 800, 1600). Bonus items such as a CD, a radio and a car appear for extra points.

You start with 3 lives and earn one extra life at 10,000 points. The maze changes colour each level, and your high score is saved in the browser's `localStorage`.

### Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | Arrow keys or WASD | Swipe |
| Start / restart | Enter / Space | Tap |
| Pause | P / Esc | — |
| Mute | M | Tap the bottom centre of the screen |

---

## Tuxemon 3D

A 3D remake of [Tuxemon](https://github.com/Tuxemon/Tuxemon), the open source monster-catching RPG. The 38 monsters, their types, movesets and the 13-element type chart come from the Tuxemon database; the creatures, characters, town, terrain and music are all generated in code. Pick a starter, explore Candy Town, Route 1, Mirror Lake, the Whispering Woods and the Warden's Shrine, and fight turn-based battles with Tuxemon's rules: techniques with recharge times, status effects, stat stages and type effectiveness. Catch wild Tuxemon, level them up and evolve them, beat the trainers and your rival, and face the Warden as the final boss. Progress is saved in the browser's `localStorage`.

Tuxemon 3D is GPL-3.0, like the Tuxemon project it takes its data from; see [`Tuxemon-3D/LICENSE`](Tuxemon-3D/LICENSE). The rest of this repository is not covered by that licence.

### Controls

| Action | Keyboard |
| --- | --- |
| Move (tap to turn, hold to walk) | WASD / arrow keys |
| Run | Shift |
| Talk, read signs, confirm | E / Enter / Space |
| Menu (Tuxemon, Bag, Tuxepedia, Save, Settings) | Esc |
| Back | Q / X / Backspace |
| Mute | M |

Menus also work with the mouse.

---

## Space Fodder

A top-down squad shooter in the spirit of *Cannon Fodder*. Lead a line of armoured drop troopers through twelve missions on five alien worlds against an insectoid swarm: destroy nests, escort colonists to the extraction beacon, and finally kill the brood mother. Every trooper has a name and gains rank as they survive; the fallen go on a memorial wall. Split the squad into up to three teams, and drive tanks, buggies and hovercraft. Art, sound, music and missions are all generated in code, and progress is saved in the browser's `localStorage`. The game's own README has a field manual with the stats of every unit.

Space Fodder is CC0 1.0 (public domain); see [`Space-Fodder/LICENSE`](Space-Fodder/LICENSE).

### Controls

| Action | Mouse / keyboard |
| --- | --- |
| Move the squad | Left click / hold |
| Fire at the cursor | Right click / hold, or F (Ctrl + click on a trackpad) |
| Throw a grenade / fire a rocket | Space, E, middle click, or both buttons |
| Choose grenades or rockets | 1 / 2, Q or Tab |
| Split marked troopers into a new team | Click names in the squad list, then X |
| Command another team / join a team | C or click a team name / J |
| Board a vehicle / get out | Click the vehicle / R |
| Pause / mute | Esc or P / M |

On touch screens, tap to move; the Fire and Bomb buttons auto-aim at the nearest threat, and the Team, Split and Out buttons manage teams and vehicles.

---

## Ass Monkey Empire

A 3D side-scrolling platformer trilogy that remakes the three *Donkey Kong Country* games, with original characters, enemies, levels and music. The heroes are baboons who gallop on all fours, and each game has its own duo: **Bongo & Pip**, **Pip & Lulu**, and **Lulu & Bobo**. Together the three games have more than 100 levels across 22 worlds, and the worlds follow the same order and level types as the originals: jungle runs, treetops with vines, underwater swims, barrel-cannon chains, mine carts, lights-out caves, ice, factories, brambles, rigging, lava and rising-flood climbs, with a boss at the end of every world.

Stomp or roll into enemies, carry and throw barrels, ride Tusk the warthog, Sprong the frog and Narly the narwhal, collect 100 bananas or the letters **B-U-T-T** for extra lives, and clear bonus rooms for medals that unlock the secret worlds. Progress is saved per game in the browser's `localStorage`.

### Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move · climb · swim | Arrow keys / WASD | Left stick / D-pad |
| Jump · fire barrel cannon | Space / K / Z | ✕ / A |
| Run · roll · carry & throw barrels | Shift / J / X | □ / X · R2 |
| Ground slap (Bongo, Bobo) | ↓ + run | ↓ + □ |
| Glide (Lulu) | Hold jump while falling | Hold ✕ |
| Team-up throw (games 2 & 3) | E / L / C | △ / Y |
| Swap baboons | Q / Tab | L1 / R1 |
| Pause | Esc / P | Options |

---

## Tardigrades

A remaster of the Mega Drive *Worms*, with tardigrades instead of worms. Teams of chubby, bandana-wearing water bears take turns on randomly generated, fully destructible islands in four landscapes: Moss Forest, Antarctic Ice, Hydrothermal Vent and Lichen Boulders. The 2D canvas gets a 3D look from per-pixel terrain lighting with bevelled crater edges, bump maps and scorch marks, plus parallax backdrops, drop shadows and animated water.

Walk, jump, swing on the ninja rope and pick one of 19 weapons each turn, from the bazooka, grenades and banana bomb to the air strike, dynamite and the walking Super Nematode, while the wind changes every turn. Fallen tardigrades curl up into a tun. You play against one to three CPU teams in three skill levels; the code is set up for hot-seat and online multiplayer later.

### Controls

| Action | Keyboard / mouse | Gamepad |
| --- | --- | --- |
| Walk · aim | ← → · ↑ ↓ (or WASD) | Left stick / D-pad |
| Jump · backflip | Enter · Backspace | Ⓐ · Ⓑ |
| Fire (hold to charge) | Space | Ⓧ / RT |
| Weapon menu · cycle weapons | Tab or right-click · Q / E | Ⓨ · LB / RB |
| Fuse time | 1–5 | – |
| Pick a target | Left-click | Right stick + Ⓧ |
| Zoom · look around | Mouse wheel · screen edges, middle-drag | Right stick |
| Pause · sound | Esc / P · M | Start |

---

## Parcour Hobbits

A remaster of the 16-bit plumber platformers with hobbits instead of plumbers and Truffle the pig instead of the dinosaur. Six games share one engine and follow the originals' gameplay, power-ups and level types: **The Shire Quest** (*Super Mario Bros.*), **The Lost Paths** (*The Lost Levels*), **Dreamland Picnic** (*Super Mario Bros. 2*), **Eight Kingdoms** (*Super Mario Bros. 3*), **Truffle's Island** (*Super Mario World*) and **Parcour Hobbits Babies** (*Yoshi's Island*). The levels are real 3D (three.js): solid blocks, round pipes, spinning metal coins, low-poly scenery, sun shadows, torch and lava lights and bloom, while the hand-drawn characters stand in that world as lit billboards. Without WebGL it falls back to a 2D renderer.

Grow with golden mushrooms, throw fireballs, fly with the oak leaf and the elven cloak, wear frog, badger and dwarf suits, pluck turnips, ride Truffle, and as Truffle snuffle enemies into truffle eggs to throw. Progress is saved per game in the browser's `localStorage`.

### Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move · climb · duck | Arrow keys / WASD | Left stick / D-pad |
| Jump (hold for higher, glide, float or flutter) | Space / Z / K | Ⓐ / ✕ |
| Run · fireball · tail whip · pick up and throw · snout | Shift / X / J | Ⓧ / Ⓨ / R2 |
| Spin jump · badger statue · aim and throw truffle eggs | C / E / L | Ⓑ / ○ |
| Change world on the map · open items | Q / R · C | L1 / R1 · Ⓑ |
| Pause | Esc / P | Start |

On touch screens the game shows a joystick and A, B and C buttons.

---

## Soapbox Scramble 64

A remaster of *Mario Kart 64* with eight original cartoon animals (a fox, an ostrich, a hen, a penguin, a hamster, a bear, a gator and a moose) racing homemade soapbox cars: a crate, a barrel, a pram, a sled, a teacup, a log, a bathtub and a brass bed. The modes, items, rules and course layouts follow the original: Grand Prix in four cups of four courses at 50cc, 100cc, 150cc and Mirror, Time Trials with saved ghosts, 2–4 player split-screen VS races and balloon battles in four arenas. Peels, bowling balls, homing pies, a winged bomb that hunts the leader, rockets, a lucky horseshoe, a shrink bolt, a spooky sheet and fake crates. Powerslides with mini-turbos, rocket starts and slipstreams. Everything renders in 3D with three.js: shadows, water, lava, snow, floodlights, bloom and a rainbow road in space.

### Controls

| Action | Keyboard (1 player) | Gamepad |
| --- | --- | --- |
| Gas · brake / reverse | ↑ / W · ↓ / S | Ⓐ or RT · Ⓑ or LT |
| Steer | ← → / A D | Left stick / D-pad |
| Hop and powerslide | Space / Shift | RB / R1 |
| Use item (hold to drag behind) | E / X / J / Ctrl | Ⓧ or LB |
| Look back | Q / C | Ⓨ |
| Pause | Esc / P | Start |

In two-player games player 1 uses W A S D, Space, E and Q, and player 2 the arrow keys, `.`, `/` or Enter and `,`. Players 3 and 4 use gamepads. On touch screens the game shows a steering stick and Item, Hop, Brake and Look buttons.

---

## Repository layout

```
.
├── Arkanoid/
│   ├── index.html   # Neon Arkanoid
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Ass Monkey/
│   ├── index.html   # Ass Monkey Empire
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── DaidoSim/
│   ├── index.html   # Daido Dog Sim
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Katana Creed/
│   ├── index.html   # Katana Creed
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Looney_Soapbox_64/
│   ├── index.html   # Soapbox Scramble 64
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Parcour Hobbits/
│   ├── index.html   # Parcour Hobbits (six games)
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── PodRace/
│   ├── index.html   # Sandstorm Circuit
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Shakur-Boy/
│   ├── index.html   # Shakur Boy: Shroom Run 3D
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Space-Fodder/
│   ├── index.html   # Space Fodder
│   ├── css/, js/    # its stylesheet and game code
│   ├── docs/images/ # README screenshots (+ tools/readme-images.js to regenerate them)
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   ├── LICENSE      # CC0 1.0, for this folder
│   └── README.md
├── Tardigrades/
│   ├── index.html   # Tardigrades
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Tuxemon-3D/
│   ├── index.html   # Tuxemon 3D
│   ├── css/, js/    # its stylesheet and game code
│   ├── serve.py     # local server (+ Play Tuxemon 3D.cmd for Windows)
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   ├── LICENSE      # GPL-3.0, for this folder
│   └── README.md
├── X-Fighter/
│   ├── index.html   # X-Fighter
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── scripts/
│   ├── games.js         # finds the game folders
│   └── render-icons.js  # renders icon.svg to the PNG icon set
├── tests/
│   └── launcher.test.js # every game has its icons and a launcher button
├── index.html       # launcher page with a button for every game
├── icon.svg         # launcher logo (+ PNG exports)
├── CLAUDE.md        # checklist for adding a game
└── README.md
```

## Adding a game

Every game needs its own logo and a button in the launcher. The full checklist is in [`CLAUDE.md`](CLAUDE.md):

1. Create a new folder with the game's `index.html` and a `README.md` (description, live link, how to run, controls).
2. Draw an `icon.svg` logo in the folder and run `node scripts/render-icons.js "<folder>"` to export `icon-512.png`, `icon-192.png` and `apple-touch-icon.png`. Link them from the game's `<head>`.
3. Add a button for the game, with a short hover summary, to the launcher (`index.html` at the root).
4. Add the game to this README: a row in the table at the top, a section with its controls, and its live link.

`npm run test:launcher` checks steps 2 and 3 and runs in CI on every push, so a game without a logo or a launcher button fails the build.
