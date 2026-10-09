# Daido Dog Sim

A 3D dog life sim in a single HTML file. Spend a day in the meadow as a dog.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/DaidoSim/>

**Locally:** the game is a single `index.html`, so there is nothing to build or install. From the root of the repository run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/DaidoSim/>. Opening `DaidoSim/index.html` straight from disk usually works too, but a local server is more reliable.

## How it works

Choose between two dogs, **Daido** and **Fluffy**, with the buttons at the top right. Then play one of five levels or wander freely in **Free roam**. Each level is a short checklist of dog jobs: drinking from the stream, collecting bones, marking trees, fetching a ball or slipper for your human, and digging up or burying things. Each level begins with a poop on a marked spot and ends with the bowl of food your dog has earned.

1. **First Morning**: a gentle start around the garden.
2. **Marking the Rounds**: patrol the path and leave your mark.
3. **Buried Treasure**: sniff out a bone, then hide it under the big oak.
4. **The Long Walk**: follow the stream north, then head for the fields.
5. **Hide and Seek**: your human is hiding; bring back the slipper and dig up your toys.

Levels unlock one at a time. Your progress and best time for each level are saved in the browser's `localStorage`.

## Controls

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

## Requirements

- A modern browser with WebGL (current Chrome, Edge, Firefox or Safari). It also runs on phones and tablets.
- An internet connection: three.js (r169) loads from a CDN.
- No gamepad support.

---

[← Back to all games](../README.md)
