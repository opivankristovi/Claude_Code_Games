# Claude Code Games

A collection of browser games, mostly retro-inspired arcade games, built with Claude Code (Opus 5.5).

Each game is one self-contained `index.html`: no build step, no bundler, no game asset files. Every model, texture, level and sound effect is generated in code at runtime. Neon Arkanoid draws on a plain 2D `<canvas>`. The other games render in 3D with [three.js](https://threejs.org/), loaded from a CDN (r128 for Shakur Boy, r160–r169 for the rest).

Each folder also has a square logo, `icon.svg`, with PNG exports (`icon-512.png`, `icon-192.png`, `apple-touch-icon.png`) for buttons, launchers and home-screen shortcuts. Each page links it as its favicon and touch icon.

| Game | Folder (own README) | Genre |
| --- | --- | --- |
| **Katana Creed** | [`Katana Creed/`](Katana%20Creed/README.md) | Stealth-action ninja (Tenchu remake) |
| **X-Fighter**: Assault on the Iron Fortress | [`X-Fighter/`](X-Fighter/README.md) | 3D space combat shooter |
| **Sandstorm Circuit** | [`PodRace/`](PodRace/README.md) | Combat podracing |
| **Daido Dog Sim** | [`DaidoSim/`](DaidoSim/README.md) | Dog life sim / exploration |
| **Neon Arkanoid** | [`Arkanoid/`](Arkanoid/README.md) | Brick breaker |
| **Shakur Boy: Shroom Run 3D** | [`Shakur-Boy/`](Shakur-Boy/README.md) | Maze chase (Pac-Man style) |

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

## How to play

**Online** (GitHub Pages): start from the launcher at <https://opivankristovi.github.io/Claude_Code_Games/>, which has a button for every game (mouse, touch, arrow keys or a gamepad). Or go straight to a game:

- Katana Creed: <https://opivankristovi.github.io/Claude_Code_Games/Katana%20Creed/>
- X-Fighter: <https://opivankristovi.github.io/Claude_Code_Games/X-Fighter/>
- Sandstorm Circuit: <https://opivankristovi.github.io/Claude_Code_Games/PodRace/>
- Daido Dog Sim: <https://opivankristovi.github.io/Claude_Code_Games/DaidoSim/>
- Neon Arkanoid: <https://opivankristovi.github.io/Claude_Code_Games/Arkanoid/>
- Shakur Boy: <https://opivankristovi.github.io/Claude_Code_Games/Shakur-Boy/>

**Locally:**

```bash
git clone https://github.com/opivankristovi/Claude_Code_Games.git
cd Claude_Code_Games
python3 -m http.server 8000
```

Then open <http://localhost:8000/> for the launcher, or `http://localhost:8000/<folder>/` for a game, for example <http://localhost:8000/X-Fighter/>.

Opening `index.html` directly from disk will usually work too, but a local server is more reliable across browsers.

### Requirements

- A modern browser (current Chrome, Edge, Firefox or Safari). All games except Neon Arkanoid need WebGL.
- An internet connection for the 3D games: three.js (and, for most of them, Google Fonts) load from CDNs. Neon Arkanoid needs no external files.
- A dedicated GPU is recommended for the 3D games. If Sandstorm Circuit stutters, press **Q** to switch to the faster graphics mode.
- Katana Creed, X-Fighter and Sandstorm Circuit: keyboard + mouse, or a standard gamepad (Xbox, PlayStation, Switch Pro layouts); no touch controls.
- Daido Dog Sim, Neon Arkanoid and Shakur Boy: keyboard (and mouse) or touch; no gamepad support.

## Repository layout

```
.
├── Arkanoid/
│   ├── index.html   # Neon Arkanoid
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
├── PodRace/
│   ├── index.html   # Sandstorm Circuit
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
│   └── README.md
├── Shakur-Boy/
│   ├── index.html   # Shakur Boy: Shroom Run 3D
│   ├── icon.svg     # game logo (+ icon-512.png, icon-192.png, apple-touch-icon.png)
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
3. Add a button for the game to the launcher (`index.html` at the root).
4. Add the game to this README: a row in the table at the top, a section with its controls, and its live link.

`npm run test:launcher` checks steps 2 and 3 and runs in CI on every push, so a game without a logo or a launcher button fails the build.
