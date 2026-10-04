# Claude Code Games

A collection of browser games, mostly retro-inspired arcade games, built with Claude Code (Opus 5.5).

Each game is one self-contained `index.html`: no build step, no bundler, no asset files. Every model, texture, level and sound effect is generated in code at runtime. Neon Arkanoid draws on a plain 2D `<canvas>`. The other games render in 3D with [three.js](https://threejs.org/), loaded from a CDN (r128 for Shakur Boy, r160–r169 for the rest).

| Game | Folder | Genre |
| --- | --- | --- |
| **X-Fighter**: Assault on the Iron Fortress | [`X-Fighter/`](X-Fighter/index.html) | 3D space combat shooter |
| **Sandstorm Circuit** | [`PodRace/`](PodRace/index.html) | Combat podracing |
| **Daido Dog Sim** | [`DaidoSim/`](DaidoSim/index.html) | Dog life sim / exploration |
| **Neon Arkanoid** | [`Arkanoid/`](Arkanoid/index.html) | Brick breaker |
| **Shakur Boy: Shroom Run 3D** | [`Shakur-Boy/`](Shakur-Boy/index.html) | Maze chase (Pac-Man style) |

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

Spend a day in the meadow as a dog. Choose between two dogs, **Daido** and **Fluffy**, then play one of five levels or wander freely in **Free roam**. Each level is a short checklist of dog jobs: drinking from the stream, collecting bones, marking trees, fetching a ball or slipper for your human, and digging up or burying things. Each level begins with a poop on a marked spot and ends with the bowl of food your dog has earned.

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

**Online** (GitHub Pages):

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

Then open `http://localhost:8000/<folder>/`, for example <http://localhost:8000/X-Fighter/>.

Opening `index.html` directly from disk will usually work too, but a local server is more reliable across browsers.

### Requirements

- A modern browser (current Chrome, Edge, Firefox or Safari). All games except Neon Arkanoid need WebGL.
- An internet connection for the 3D games: three.js (and, for most of them, Google Fonts) load from CDNs. Neon Arkanoid needs no external files.
- A dedicated GPU is recommended for the 3D games. If Sandstorm Circuit stutters, press **Q** to switch to the faster graphics mode.
- X-Fighter and Sandstorm Circuit: keyboard + mouse, or a standard gamepad (Xbox, PlayStation, Switch Pro layouts); no touch controls.
- Daido Dog Sim, Neon Arkanoid and Shakur Boy: keyboard (and mouse) or touch; no gamepad support.

## Repository layout

```
.
├── Arkanoid/
│   └── index.html   # Neon Arkanoid
├── DaidoSim/
│   └── index.html   # Daido Dog Sim
├── PodRace/
│   └── index.html   # Sandstorm Circuit
├── Shakur-Boy/
│   └── index.html   # Shakur Boy: Shroom Run 3D
├── X-Fighter/
│   └── index.html   # X-Fighter
└── README.md
```

## Adding a game

Create a new folder containing a single `index.html`, then add a row to the table at the top and a section describing the game and its controls.
