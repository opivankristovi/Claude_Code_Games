# X-Fighter: Assault on the Iron Fortress

A 3D space combat shooter in a single HTML file. Fly a starfighter through a three-mission campaign against the Iron Fortress.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/X-Fighter/>

**Locally:** the game is a single `index.html`, so there is nothing to build or install. From the root of the repository run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/X-Fighter/>. Opening `X-Fighter/index.html` straight from disk usually works too, but a local server is more reliable.

## The missions

1. **Outer Perimeter**: break the interceptor screen by destroying 16 enemy fighters before the clock runs out.
2. **The Dreadnought**: destroy the siege dreadnought's two shield-generator domes, then strike its exposed command bridge while dodging deck turrets.
3. **Trench Run**: fly the equatorial trench, avoid the barriers and turrets, and put a torpedo down the thermal exhaust port.

Each mission is timed and you have a limited number of homing torpedoes. You score points for kills and objectives, plus a time bonus and a shield bonus when you clear a mission. Your high score is saved in the browser's `localStorage`.

## Controls

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

Press Space or Enter to move through the title and briefing screens. Gamepads (Xbox, PlayStation and Switch Pro layouts) connect when you press any button.

## Requirements

- A desktop browser with WebGL (current Chrome, Edge, Firefox or Safari).
- An internet connection: three.js (r160) and the Orbitron and Rajdhani fonts load from CDNs.
- A dedicated GPU is recommended. No touch controls.

---

[← Back to all games](../README.md)
