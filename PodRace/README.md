# Sandstorm Circuit

A combat podracing game in a single HTML file. Race a twin-engine pod across a procedurally generated desert: **3 laps against 5 AI pilots**. (The folder is called `PodRace`; the game's title is Sandstorm Circuit.)

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/PodRace/>

**Locally:** the game is a single `index.html`, so there is nothing to build or install. From the root of the repository run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/PodRace/>. Opening `PodRace/index.html` straight from disk usually works too, but a local server is more reliable.

## How it works

Rivals shoot at you and ram you. Your pod has hull integrity, and your lasers build up heat, so firing nonstop makes them overheat. Fly through bonus pickups on the track to collect power-ups:

| Power-up | Effect |
| --- | --- |
| Heavy Laser | Huge explosive bolts, 3× damage (12 s) |
| Multi Cannon | Five-way spread fire (12 s) |
| Warp Speed | Engine overdrive, +40% top speed (5 s) |
| Invincible | Energy shield; ram rivals aside (8 s) |
| Seeker Bolts | Lasers home in on rivals (12 s) |
| Cryo Coolant | Lasers never overheat (12 s) |
| Repair Kit | Restores 60 hull (instant) |

## Controls

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

## Requirements

- A desktop browser with WebGL (current Chrome, Edge, Firefox or Safari).
- An internet connection: three.js (r160) and the Orbitron and Rajdhani fonts load from CDNs.
- A dedicated GPU is recommended. If the game stutters, press **Q** to switch to the faster graphics mode.
- No touch controls.

---

[← Back to all games](../README.md)
