# Claude Code Games

A collection of browser games, mostly retro-inspired arcade games, built with Claude Code (Opus 5.5).

Each game is one self-contained `index.html`: no build step, no bundler, no asset files. Graphics are rendered in 3D with [three.js](https://threejs.org/) (r160–r169, loaded from the jsDelivr CDN), and every model, texture, level and sound effect is generated procedurally in code at runtime.

| Game | Folder | Genre |
| --- | --- | --- |
| **X-Fighter**: Assault on the Iron Fortress | [`X-Fighter/`](X-Fighter/index.html) | 3D space combat shooter |
| **Sandstorm Circuit** | [`PodRace/`](PodRace/index.html) | Combat podracing |
| **Daido Dog Sim** | [`DaidoSim/`](DaidoSim/index.html) | Dog life sim / exploration |

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

## How to play

**Online** (GitHub Pages):

- X-Fighter: <https://opivankristovi.github.io/Claude_Code_Games/X-Fighter/>
- Sandstorm Circuit: <https://opivankristovi.github.io/Claude_Code_Games/PodRace/>
- Daido Dog Sim: <https://opivankristovi.github.io/Claude_Code_Games/DaidoSim/>

**Locally:**

```bash
git clone https://github.com/opivankristovi/Claude_Code_Games.git
cd Claude_Code_Games
python3 -m http.server 8000
```

Then open <http://localhost:8000/X-Fighter/>, <http://localhost:8000/PodRace/> or <http://localhost:8000/DaidoSim/>.

Opening `index.html` directly from disk will usually work too, but a local server is more reliable across browsers.

### Requirements

- A modern browser with WebGL (current Chrome, Edge, Firefox or Safari). X-Fighter and Sandstorm Circuit are desktop-only; Daido Dog Sim also runs on phones and tablets.
- An internet connection: three.js (all games) and the Google Fonts Orbitron and Rajdhani (X-Fighter and Sandstorm Circuit) load from CDNs.
- A dedicated GPU is recommended. If Sandstorm Circuit stutters, press **Q** to switch to the faster graphics mode.
- X-Fighter and Sandstorm Circuit: keyboard + mouse, or a standard gamepad (Xbox, PlayStation, Switch Pro layouts); no touch controls.
- Daido Dog Sim: keyboard + mouse, or touch; no gamepad support.

## Repository layout

```
.
├── DaidoSim/
│   └── index.html   # Daido Dog Sim
├── PodRace/
│   └── index.html   # Sandstorm Circuit
├── X-Fighter/
│   └── index.html   # X-Fighter
└── README.md
```

## Adding a game

Create a new folder containing a single `index.html`, then add a row to the table at the top and a section describing the game and its controls.
