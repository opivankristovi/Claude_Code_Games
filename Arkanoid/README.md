# Neon Arkanoid

A neon brick breaker in a single HTML file. It draws on a plain 2D `<canvas>` and loads nothing from outside, so it also works offline.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/Arkanoid/>

**Locally:** the game is a single `index.html`, so there is nothing to build or install. From the root of the repository run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Arkanoid/>. Opening `Arkanoid/index.html` straight from disk usually works too, but a local server is more reliable.

## How it works

Six hand-built levels come first, then randomly generated levels continue for as long as you survive. The ball gets a little faster each level. You start with 3 lives (up to 6), and your high score is saved in the browser's `localStorage`.

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

## Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Move paddle | Mouse, ← / → or A / D | Drag |
| Start, launch ball, fire laser | Click / Space / Enter | Tap |
| Pause | P / Esc | — |
| Mute | M | — |

The game pauses by itself when the window loses focus.

## Requirements

- Any modern browser. No WebGL, no internet connection and no gamepad needed.

---

[← Back to all games](../README.md)
