# Claude Code Games

A collection of retro-inspired arcade games built with Claude Code (Opus 5.5).

Each game is one self-contained `index.html`: no build step, no bundler, no asset files. Graphics are rendered in 3D with [three.js](https://threejs.org/) (r160, loaded from the jsDelivr CDN), and every model, texture, track and sound effect is generated procedurally in code at runtime.

| Game | Folder | Genre |
| --- | --- | --- |
| **X-Fighter**: Assault on the Iron Fortress | [`X-Fighter/`](X-Fighter/index.html) | 3D space combat shooter |
| **Sandstorm Circuit** | [`PodRace/`](PodRace/index.html) | Combat podracing |

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

## How to play

**Online:** to serve the games straight from this repo, enable GitHub Pages (Settings → Pages → deploy from the `main` branch). Each game is then available at `/<folder>/`.

**Locally:**

```bash
git clone https://github.com/opivankristovi/claude_code_games.git
cd claude_code_games
python3 -m http.server 8000
```

Then open <http://localhost:8000/X-Fighter/> or <http://localhost:8000/PodRace/>.

Opening `index.html` directly from disk will usually work too, but a local server is more reliable across browsers.

### Requirements

- A modern desktop browser with WebGL (current Chrome, Edge, Firefox or Safari).
- An internet connection: three.js and the Google Fonts (Orbitron, Rajdhani) load from CDNs.
- A dedicated GPU is recommended. If Sandstorm Circuit stutters, press **Q** to switch to the faster graphics mode.
- Keyboard + mouse or a standard gamepad (Xbox, PlayStation, Switch Pro layouts). Touch controls are not supported.

## Repository layout

```
.
├── PodRace/
│   └── index.html   # Sandstorm Circuit
├── X-Fighter/
│   └── index.html   # X-Fighter
└── README.md
```

## Adding a game

Create a new folder containing a single `index.html`, then add a row to the table at the top and a section describing the game and its controls.
