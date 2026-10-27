# Tardigrades

A remastered take on the 16-bit *Worms* (Sega Mega Drive), in a single HTML file. The turn-based artillery gameplay is the same, but the worms are now tardigrades: chubby, eight-legged water bears with team bandanas. The game draws everything on a 2D canvas with a 3D look: the destructible landscape is lit per pixel with bevelled edges, bump-mapped textures, specular highlights and scorch marks, and sits in front of soft-focus parallax backdrops with drop shadows, light shafts and animated water.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/Tardigrades/>

**Locally:** from the root of the repository run

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Tardigrades/>.

## How it plays

Two to four teams of 2–6 tardigrades take turns on a randomly generated island. On your turn you have a limited time (30–90 seconds) to walk, jump, use the ninja rope and fire one weapon. After you fire you get a few seconds to retreat. The tardigrade with the last team standing wins.

- **Destructible terrain:** every explosion digs a crater. Tardigrades that fall too far take damage, and any that drop into the water drown.
- **Wind** changes every turn and pushes rockets, air strikes and smoke.
- **Hazards:** mines lie around the map and oil drums burst into flames when hit.
- **Crates** sometimes parachute in: health crates (+30) and weapon crates. Shooting a weapon crate blows it up.
- **Sudden death:** after the chosen number of rounds, every tardigrade drops to 1 health and the water rises each turn.
- When a tardigrade's health hits zero, it curls up into a *tun* (the dried-out state real tardigrades survive almost anything in), then pops and leaves the tun behind as a gravestone.

**Weapons:** Bazooka, Homing Missile, Grenade, Cluster Bomb, Banana Bomb, Shotgun (two shots), Uzi, Fire Punch, Baseball Bat, Dynamite, Mine, Super Nematode (a walking bomb that replaces the Super Sheep), Air Strike, Ninja Rope, Teleport, Girder, Pneumatic Drill, Skip Go and Surrender. Each team has its own ammo.

**Landscapes:** Moss Forest, Antarctic Ice, Hydrothermal Vent and Lichen Boulders, each with its own textures, backdrop and music.

**CPU opponents** come in three skill levels. The CPU simulates hundreds of shots with the game's real physics (wind and bounces included), picks the one that does the most damage to your team and the least to its own, and then aims and fires through the same controls as you, with skill-based aiming errors.

The Graphics option switches between High and Fast (no shadows, motes or light shafts, and a 1× canvas). Your menu settings are saved in the browser's `localStorage`.

## Controls

| Action | Keyboard / mouse | Gamepad |
| --- | --- | --- |
| Walk (tap the other way to turn) | ← → / A D | Left stick / D-pad |
| Aim · rope up/down · rotate girder | ↑ ↓ / W S | Left stick / D-pad |
| Jump forward | Enter | Ⓐ |
| Backflip (high jump) | Backspace | Ⓑ |
| Fire (hold to charge) | Space | Ⓧ / RT |
| Weapon menu | Tab / right-click | Ⓨ |
| Previous / next weapon | Q / E | LB / RB |
| Fuse time (grenades, cluster, banana) | 1–5 | – |
| Pick a target (air strike, homing, teleport, girder) | Left-click | Right stick moves the cursor, Ⓧ confirms |
| Zoom | Mouse wheel / + − | – |
| Look around · re-centre | Screen edges, middle-drag · C | Right stick |
| Pause · sound on/off | Esc / P · M | Start |

## Multiplayer

For now each match is you against one to three CPU teams. The code is ready for more: every team is driven by a controller that turns its input into the same per-frame command (move, aim, jump, fire, weapon, target), and all gameplay randomness comes from one seeded generator. Hot-seat play only needs `ALLOW_MULTI_HUMAN` switched on, and online play needs a network controller that sends those commands in lockstep.

## Notes

The rules, weapons and pacing follow the original, but all code, graphics and sound are original and generated at runtime. No assets, code or data come from the cartridge. The `reference/` folder with the reference ROM is git-ignored and must never be committed.
