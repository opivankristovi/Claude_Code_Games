# Tuxemon 3D

A 3D browser remake of [Tuxemon](https://github.com/Tuxemon/Tuxemon), the open source monster-catching RPG. The monsters, their types, movesets, technique numbers and the 13-element type chart come straight from the Tuxemon database. Everything you see is generated in code: the creatures, characters, town, terrain, water, sky, effects and music.

## Play

**Play online: https://opivankristovi.github.io/Tuxemon-3D/**

To run it locally, double-click **`Play Tuxemon 3D.cmd`**. It starts a small local web server and opens the game in your browser. Close the server window to stop it.

Or from a terminal:

```sh
python serve.py 8765 --open
```

The game uses ES module imports, so it needs to be served over http rather than opened as a file. Three.js loads from a CDN, so you need an internet connection the first time.

## Controls

| Key | Action |
| --- | --- |
| `WASD` / arrows | Move (tap to turn, hold to walk) |
| `Shift` | Run |
| `E` / `Enter` / `Space` | Talk, read signs, confirm |
| `Esc` | Menu: Tuxemon, Bag, Tuxepedia, Save, Settings |
| `Q` / `X` / `Backspace` | Back |
| `M` | Mute |

Menus also work with the mouse.

## What's in it

- **World**: Candy Town, Route 1, Mirror Lake, the Whispering Woods and the Warden's Shrine. It has a day/night cycle, lamps and windows that light up at night, fireflies, chimney smoke, a working fountain, animated water with shoreline foam, and grass that sways in the wind and parts around you.
- **Creatures**: 38 Tuxemon species built procedurally from their Tuxemon body shape and elements. They are toon-shaded with outlines and have idle animations.
- **Battles**: turn-based, using Tuxemon's rules: techniques with recharge times, status effects, stat stages and type effectiveness. Each element has its own 3D effects, the camera moves cinematically, and damage numbers pop up.
- **Catching, EXP, level-ups, new techniques and evolution**, with an evolution cutscene.
- **Trainers** who spot you from a distance, a rival, and the Warden as the final boss.
- **Tuxemon Center** for healing, a shop, a Tuxepedia and settings (graphics quality, day length). Progress is saved in your browser.

## Credits

Monster data: the Tuxemon project and its contributors (GPL-3.0). This remake is also GPL-3.0, see `LICENSE`.
