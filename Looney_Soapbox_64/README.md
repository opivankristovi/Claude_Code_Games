# Soapbox Scramble 64

A remaster of the 64-bit kart racer (*Mario Kart 64*) in a single HTML file, with a cast of original cartoon animals racing homemade soapbox cars instead of karts. The modes, items, rules and course layouts follow the original; the characters, names, art, scenery and music are original and made in code.

The game renders in 3D with [three.js](https://threejs.org/) (r169, loaded from a CDN): lit and shadowed courses with textured roads, curbs, walls, tunnels and bridges, furry characters with blinking eyes and swinging tails, glossy soapboxes with spinning spoked wheels, water, lava, snowfall, embers, floodlights and a starry sky, plus drift sparks, boost flames, dust, splashes and bloom.

## Play

**Live:** <https://opivankristovi.github.io/Claude_Code_Games/Looney_Soapbox_64/>

**Locally:** from the root of the repository run

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/Looney_Soapbox_64/>.

## Racers

Eight drivers in three weight classes. Light racers accelerate fastest and turn sharpest, heavy racers have the highest top speed and shove others aside.

| Racer | Class | Soapbox |
| --- | --- | --- |
| Rusty Fox | Medium | Red crate racer |
| Ozzie Ostrich | Medium | Barrel buggy |
| Henrietta Hen | Light | Racing pram |
| Penny Penguin | Light | Wheeled sled |
| Nibbles Hamster | Light | Teacup roadster |
| Bobo Bear | Heavy | Log hauler |
| Gus Gator | Heavy | Bathtub cruiser |
| Moxie Moose | Heavy | Brass bed |

## Modes

- **Grand Prix** (1–2 players): 50cc, 100cc, 150cc and Mirror, four cups of four courses each, eight racers, three laps. The top four score 9, 6, 3 and 1 points; finish 5th or worse and you retry the race. After the fourth race the top three stand on the podium and you win a gold, silver or bronze cup. Winning gold in all four 150cc cups unlocks Mirror mode.
- **Time Trials** (1 player): start with three rockets and race your best time. Records, best laps and a ghost of your best run are saved per course.
- **VS Race** (2–4 players): split-screen, no computer racers.
- **Battle** (1–4 players): three balloons each in one of four arenas. Each hit pops a balloon; the last racer with balloons wins. One player battles three computer racers.

## Courses

| Cup | Courses |
| --- | --- |
| Carrot Cup | Sunny Raceway · Mole Hill Farm · Crab Cove Beach · Tumbleweed Desert |
| Daisy Cup | Rush Hour Turnpike · Frosty Peaks · Rockslide Mountain · Picnic Raceway |
| Horseshoe Cup | Muddy Stadium · Igloo Island · Royal Ramp Raceway · Gloom Castle |
| Anvil Cup | Jungle River Parkway · Twisting Valley · Spooky Boardwalk · Rainbow Ribbon |

Each course follows the shape and hazards of its counterpart in the original: a hot-air balloon and a tunnel, popping moles and cows on the road, crabs and a ramp over the water, a steam train that crosses the road twice, highway traffic, snowmen, falling boulders, a figure-eight bridge and snapping plants, a bumpy stadium with a big jump, sliding penguins on ice, a castle and a ramp over its lake, stone crushers, fire bars and lava, a paddle steamer and coconuts, a giant rolling boulder, bats in a haunted house, and giant glass marbles on a rainbow in space. The battle arenas are Donut Ring, Toy Block Fort, Double Decker and Rooftop Rumble.

## Items

Drive through the ? crates. The racers at the back get the strongest items.

| Item | Does |
| --- | --- |
| Banana Peel / Banana Bunch | Drop behind you (or throw ahead); spins out whoever hits it. The bunch trails five peels. |
| Bowling Ball / Triple Bowling Balls | Rolls straight and bounces off walls. The triple set orbits you as a shield. |
| Homing Cherry Pie / Triple Cherry Pies | Chases the racer in front of you. |
| Winged Bomb | Flies to the leader and explodes. |
| Rocket / Triple Rockets / Golden Rocket | Speed boost. The golden rocket boosts as often as you like for a few seconds. |
| Lucky Horseshoe | Invincible and faster for eight seconds; knocks over anyone you touch. |
| Shrink Bolt | Shrinks every other racer. Run them over while they are small. |
| Spooky Sheet | Turns you invisible and steals another racer's item. |
| Fake Crate | Looks like a ? crate. Flips whoever drives into it. |

Hold the item button to drag a peel, ball, pie or fake crate behind you as a shield, and release to use it. Hold brake while using an item to throw it the other way.

## Driving tricks

- **Powerslide:** hop while steering and keep the hop button held. Tap the steering against the slide to charge the sparks from blue to orange, then let go for a mini-turbo.
- **Rocket start:** press gas just as the "2" fades on the countdown. Too early and you burn rubber.
- **Slipstream:** tuck in right behind another racer for a moment to get a boost.

## Controls

| Action | Keyboard (1 player) | Gamepad |
| --- | --- | --- |
| Gas · brake / reverse | ↑ / W · ↓ / S | Ⓐ or RT · Ⓑ or LT |
| Steer | ← → / A D | Left stick / D-pad |
| Hop and powerslide | Space / Shift | RB / R1 |
| Use item (hold to drag) | E / X / J / Ctrl | Ⓧ or LB |
| Look back | Q / C | Ⓨ |
| Pause | Esc / P | Start |

In two-player games player 1 uses W A S D, Space (hop), E (item) and Q (look back), and player 2 uses the arrow keys, `.` (hop), `/` or Enter (item) and `,` (look back). Players 3 and 4 need gamepads; with gamepads connected, gamepad 1 goes to player 1, gamepad 2 to player 2, and so on. The game reads physical key positions, so AZERTY and other layouts work, and the help screen shows your own key labels.

On touch screens the game shows a steering stick and Item, Hop, Brake and Look buttons, and accelerates for you (turn auto-gas off in Options to get a Go button).

## Notes

Records, trophies, ghosts and options are saved in the browser's `localStorage`. The Options menu switches between High (bloom and shadows), Medium (shadows) and Low graphics. Music and sound effects are synthesized with the Web Audio API.

No assets, code or data come from the original cartridge. The `refeerence/` folder with the reference ROM is git-ignored and must never be committed.
