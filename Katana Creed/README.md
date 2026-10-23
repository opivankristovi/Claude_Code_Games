# Katana Creed

A third-person stealth-action ninja game in a single HTML file: a remake of the PS1 classic *Tenchu: Stealth Assassins* with the same ten missions, rebuilt with realistic real-time 3D graphics and smooth, modern free-run controls in the style of *Assassin's Creed* on a PS3/PS4 gamepad.

Play as **Rikimaru**, in a black hood and mask with armoured shoulders and a katana on his back, or **Ayame**, in a red hood and scarf, with long red sash tails and twin kodachi.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/Katana%20Creed/>

**Locally:** the game is a single `index.html`, so there is nothing to build or install. From the root of the repository run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Katana%20Creed/>. Opening `Katana Creed/index.html` straight from disk usually works too, but a local server is more reliable.

## How it works

Every mission is a stealth sandbox. Stay out of sight and out of the light, crouch to move quietly, and strike unseen foes from behind or from above for a one-hit **stealth kill**. Guards hear noise, grow suspicious, search, and raise the alarm. Get spotted and you fight sword to sword: lock on, block, parry, roll, and chain combos.

The ninja climbs most walls and **free-runs** while sprinting: vaulting low obstacles, mantling onto ledges, vaulting over palisades, leaping between roofs, and swinging up with the grappling hook. **Ki sense** shows enemies through walls.

Missions unlock one at a time. At the end of each mission you get a rank, from *Thug* up to *Grand Master*, based on stealth kills, times detected, damage taken and time. Your progress and best ranks are saved in the browser's `localStorage`.

### Missions

| # | Mission | Goal |
| --- | --- | --- |
| 0 | Training | Learn to move, climb, grapple and kill in the Azuma dojo |
| 1 | Punish the Evil Merchant | Kill the merchant Echigoya in his mansion |
| 2 | Deliver the Secret Message | Take Lord Gohda's letter to the envoy at the shrine across the river |
| 3 | Cross the Checkpoint | Get past the mountain barrier and reach the northern road |
| 4 | Execute the Corrupt Minister | Kill Minister Kataoka in his garden |
| 5 | Rescue the Captive Ninja | Free the Azuma ninja held in the bandit caves, then get out |
| 6 | Destroy the Foreign Pirates | Board the flagship and kill the pirate captain |
| 7 | Infiltrate the Manji Cult | Kill the high priest in the mountain temple |
| 8 | Cure the Princess | Find the herb in the snowbound caves, guarded by a giant spider |
| 9 | Reclaim the Castle | Fight through the burning castle and kill Onikage |
| 10 | Free the Princess | Rescue Princess Kiku and defeat Lord Mei-Oh |

### Items

Pick your loadout in the mission briefing, and find more along the way: shuriken, medicine, smoke bombs, poison rice, caltrops and grenades.

## Controls

| Action | Keyboard / mouse | Gamepad (PlayStation layout) |
| --- | --- | --- |
| Move | WASD | Left stick |
| Camera | Mouse | Right stick |
| Sprint / free-run (auto vault, climb, leap) | Shift (hold) | R2 (hold) |
| Jump · climb · leap from walls | Space | ✕ |
| Attack · stealth kill · air kill | Left click / J | □ |
| Crouch (sneak) · drop from wall | C / Ctrl | ○ |
| Lock on & block (tap to parry) | Right click / K (hold) | L1 (hold) |
| Dodge roll (while locked on) | C + direction | ○ + direction |
| Grappling hook (aim at the ◯ marker) | E | R1 |
| Use item · interact | F | △ |
| Switch item | Q / R · mouse wheel | D-pad ◀ ▶ |
| Ki sense (see foes through walls) | Tab (hold) | L2 (hold) |
| Recenter camera | V / middle click | R3 |
| Pause | Esc / P | Options |

Xbox and other standard gamepads work too, with the buttons in the same positions (A = ✕, X = □, and so on).

## Requirements

- A desktop browser with WebGL 2 (current Chrome, Edge, Firefox or Safari).
- An internet connection: three.js (r169) and the Cinzel and Noto Serif JP fonts load from CDNs.
- A dedicated GPU is recommended: the game uses real-time shadows, physically based materials and bloom.
- Keyboard and mouse, or a standard gamepad; no touch controls.

---

[← Back to all games](../README.md)
