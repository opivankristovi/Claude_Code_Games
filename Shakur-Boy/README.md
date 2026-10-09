# Shakur Boy: Shroom Run 3D

A Pac-Man-style maze chase in 3D, in a single HTML file, with a neon look and a gangsta-rap / party theme. The theme includes drug references (mushrooms, "XTC pills") and police.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/Shakur-Boy/>

**Locally:** the game is a single `index.html`, so there is nothing to build or install. From the root of the repository run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Shakur-Boy/>. Opening `Shakur-Boy/index.html` straight from disk usually works too, but a local server is more reliable.

## How it works

Eat the mushrooms around the maze (+10 each) while four police officers, **Chief**, **Rookie**, **Detective** and **Sarge**, chase you. The four "XTC pills" in the corners let you turn the tables for a while and chase down the cops. Each cop you catch in a row is worth double the last (200, 400, 800, 1600). Bonus items such as a CD, a radio and a car appear for extra points.

You start with 3 lives and earn one extra life at 10,000 points. The maze changes colour each level, and your high score is saved in the browser's `localStorage`.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | Arrow keys or WASD | Swipe |
| Start / restart | Enter / Space | Tap |
| Pause | P / Esc | — |
| Mute | M | Tap the bottom centre of the screen |

The game pauses by itself when the window loses focus.

## Requirements

- A modern browser with WebGL (current Chrome, Edge, Firefox or Safari). It also works on phones and tablets.
- An internet connection: three.js (r128) and the Press Start 2P font load from CDNs.
- No gamepad support.

---

[← Back to all games](../README.md)
