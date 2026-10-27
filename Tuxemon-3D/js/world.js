// The overworld: tile map, terrain, water, vegetation, buildings, props, NPCs.
'use strict';

TX.world = (() => {
  const U = TX.util;
  const W = 56, H = 76;
  const T = { GRASS: 0, PATH: 1, TALL: 2, WATER: 3, SAND: 4, TREE: 5, BUILD: 6, FENCE: 7, ROCK: 8, FLOWER: 9, BRIDGE: 10, PROP: 11, STONE: 12 };
  const WALKABLE = new Set([T.GRASS, T.PATH, T.TALL, T.SAND, T.FLOWER, T.BRIDGE, T.STONE]);

  // ---- authored layout ------------------------------------------------------------
  const PATHS = [
    [[27.5, 74], [27.5, 44], [18.5, 44], [18.5, 34], [31.5, 34], [31.5, 20], [40.5, 20], [40.5, 12], [34.5, 12], [34.5, 7.5], [29, 7.5]],
    [[31.5, 22], [21.5, 22], [21.5, 16.5], [19.5, 16.5]],
    [[10, 60.5], [47, 60.5]],
  ];
  const TALL_RECTS = [
    [21, 36, 26, 42], [30, 37, 37, 43], [11, 27, 17, 33], [22, 26, 29, 32], // route 1
    [7, 18, 18, 21], // lake reeds
    [36, 14, 39, 19], [42, 15, 47, 21], [42, 5, 48, 10], // woods
  ];
  const BUILDINGS = [
    { id: 'home', x: 10, z: 51, w: 7, d: 5, door: 13, wall: '#f4e3c3', roof: '#d9534f', name: 'Your house' },
    { id: 'center', x: 32, z: 50, w: 9, d: 6, door: 36, wall: '#fdfdfd', roof: '#e53950', name: 'Tuxemon Center', center: true },
    { id: 'house2', x: 43, z: 51, w: 6, d: 5, door: 45, wall: '#e8eef7', roof: '#3a7bd5' },
    { id: 'house3', x: 10, z: 64, w: 7, d: 5, door: 13, wall: '#f7e6f0', roof: '#8e44ad' },
    { id: 'lab', x: 38, z: 64, w: 8, d: 5, door: 41, wall: '#e9f5ec', roof: '#2e8b57', name: 'Professor\'s Lab' },
  ];
  const FOUNTAIN = { x: 27, z: 59 }; // 2x2 at (27..28, 59..60)
  const LAMPS = [[25, 58], [30, 58], [25, 63], [30, 63], [26, 49], [29, 49], [19, 59], [36, 62]];
  const SIGNS = [
    { x: 29, z: 47, text: 'Route 1 — north to Mirror Lake and the Whispering Woods.' },
    { x: 26, z: 70, text: 'Candy Town. Sweet dreams start here.' },
    { x: 24, z: 23, text: 'Mirror Lake. Water Tuxemon hide in the reeds on the south shore.' },
    { x: 33, z: 21, text: 'Whispering Woods. Beyond lies the Warden\'s Shrine. Only strong tamers return.' },
    { x: 30, z: 11, text: 'Warden\'s Shrine. Defeat the Warden to become a Tuxemon Champion.' },
  ];
  const FENCES = [
    [[9, 57], [17, 57]], [[9, 70], [17, 70]], [[42, 57], [49, 57]], [[37, 70], [46, 70]],
  ];
  const FLOWER_RECTS = [[10, 58, 12, 59], [15, 58, 16, 59], [44, 58, 48, 59], [10, 69, 12, 69], [15, 69, 16, 69], [21, 65, 24, 66], [31, 65, 34, 66], [21, 56, 23, 56], [32, 56, 34, 56]];
  const ROCKS = [[15, 40], [24, 45], [36, 28], [12, 24], [44, 24], [8, 33], [26, 25], [45, 13]];
  const DOCK = { x0: 14, x1: 19, z: 16 };

  const AREAS = [
    { name: "Warden's Shrine", test: (x, z) => z < 12 && x < 40 && x > 22, music: 'woods' },
    { name: 'Candy Town', test: (x, z) => z >= 49, music: 'town' },
    { name: 'Mirror Lake', test: (x, z) => z < 24 && x < 27, music: 'route' },
    { name: 'Whispering Woods', test: (x, z) => z < 25 && x >= 27, music: 'woods' },
    { name: 'Route 1', test: () => true, music: 'route' },
  ];

  const ENCOUNTERS = {
    'Route 1': { levels: [2, 5], table: [['chickadee', 3], ['dandicub', 3], ['pickoon', 3], ['aardorn', 2], ['hatchling', 2]] },
    'Mirror Lake': { levels: [4, 7], table: [['fluoresfin', 3], ['kroki', 3], ['bumbulus', 2], ['chickadee', 1]] },
    'Whispering Woods': { levels: [6, 10], table: [['rockitten', 3], ['foxfire', 3], ['nut', 3], ['eskipup', 2], ['noctula', 2], ['bumbulus', 1]] },
    "Warden's Shrine": { levels: [8, 11], table: [['rockitten', 2], ['noctula', 2], ['foxfire', 2], ['nut', 2]] },
  };

  // NPCs and trainers. facing: 'up' | 'down' | 'left' | 'right'
  const NPCS = [
    { id: 'mom', style: 'mom', x: 14, z: 59, face: 'down', wander: 2, lines: ['Morning, sweetie! Don\'t forget to heal your Tuxemon at the Center.', 'Tall grass is where wild Tuxemon hide. Bring Tuxeballs!'] },
    { id: 'prof', style: 'elder', x: 41, z: 70, face: 'down', lines: ['Ah, the Warden waits at the shrine past the Whispering Woods.', 'Type matters! Fire beats wood, water beats fire, wood beats water... and many more.'] },
    { id: 'kid1', style: 'kid', x: 22, z: 62, face: 'right', wander: 3, lines: ['When I grow up I\'m catching a Rockitten!', 'Did you know? Run with Shift!'] },
    { id: 'lass1', style: 'lass', x: 33, z: 61, face: 'left', wander: 2, lines: ['The fountain glows at night. Isn\'t it pretty?'] },
    { id: 'nurse', style: 'nurse', x: 35, z: 56, face: 'down', lines: ['Welcome to the Tuxemon Center!'], service: 'center' },
    { id: 'clerk', style: 'clerk', x: 38, z: 56, face: 'down', lines: ['Need supplies?'], service: 'shop' },
    { id: 'hiker0', style: 'hiker', x: 24, z: 34, face: 'down', wander: 2, lines: ['Tuxemon in the woods are much tougher. Level up on Route 1 first!'] },
    {
      id: 'pip', style: 'kid', x: 19, z: 38, face: 'right', sight: 4,
      trainer: { name: 'Youngster Pip', team: [['chickadee', 4], ['pickoon', 5]], reward: 120 },
      lines: ['Hey! You\'ve got Tuxemon! Let\'s battle!'], after: ['Aww, my Pickoon needs a nap now.'],
    },
    {
      id: 'mira', style: 'lass', x: 33, z: 30, face: 'left', sight: 4,
      trainer: { name: 'Lass Mira', team: [['dandicub', 6], ['hatchling', 6]], reward: 180 },
      lines: ['My cuties will blow you away!'], after: ['Hmph. Not bad at all.'],
    },
    {
      id: 'gil', style: 'fisher', x: 15, z: 16, face: 'right', sight: 3,
      trainer: { name: 'Fisher Gil', team: [['kroki', 7], ['fluoresfin', 8]], reward: 240 },
      lines: ['Shh! You scared the fish! Battle me!'], after: ['The lake will forgive you. Maybe.'],
    },
    {
      id: 'ash', style: 'ranger', x: 41, z: 17, face: 'down', sight: 4,
      trainer: { name: 'Ranger Ash', team: [['foxfire', 8], ['nut', 9]], reward: 300 },
      lines: ['The woods are protected. Prove you belong here!'], after: ['You respect the forest. Go on.'],
    },
    {
      id: 'rival', style: 'rival', x: 34, z: 10, face: 'down', sight: 3,
      trainer: { name: 'Rival Kai', team: [['eskipup', 9], ['bumbulus', 9], ['rival_starter', 11]], reward: 450, rival: true },
      lines: ['Took you long enough! The Warden is mine. Unless you beat me first!'], after: ['Tch... fine. Go show the Warden what you\'ve got.'],
    },
    {
      id: 'warden', style: 'warden', x: 29, z: 5, face: 'down', sight: 3,
      trainer: { name: 'Warden Mara', team: [['rockat', 12], ['noctula', 12], ['vulpyre', 13]], reward: 1200, boss: true },
      lines: ['So, a new tamer climbs to my shrine.', 'Show me the bond you share with your Tuxemon!'],
      after: ['Splendid. You are a true Tuxemon Champion.'],
    },
  ];

  // ---- map generation ---------------------------------------------------------------
  const tiles = new Uint8Array(W * H);
  const idx = (x, z) => z * W + x;
  const inside = (x, z) => x >= 0 && z >= 0 && x < W && z < H;
  const get = (x, z) => (inside(x, z) ? tiles[idx(x, z)] : T.TREE);
  const set = (x, z, v) => { if (inside(x, z)) tiles[idx(x, z)] = v; };

  function generate() {
    const r = U.rng('candy-town');
    const noise = U.makeNoise(7);
    tiles.fill(T.GRASS);
    for (let z = 0; z < H; z++) {
      for (let x = 0; x < W; x++) {
        const edge = Math.min(x, z, W - 1 - x, H - 1 - z);
        const n = noise.fbm(x * 0.15, z * 0.15);
        if (edge < 2 + Math.floor(n * 2.5)) { set(x, z, T.TREE); continue; }
        let p = 0;
        if (z < 25 && x >= 29) p = 0.5; // woods
        else if (z < 24) p = 0.08;
        else if (z < 49) p = 0.06 + (n > 0.6 ? 0.25 : 0);
        else p = (x < 9 || x > 48) ? 0.25 : 0;
        if (r() < p) set(x, z, T.TREE);
      }
    }
    // lake + pond
    const ell = (cx, cz, rx, rz, inner, outer) => {
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        const d = Math.hypot((x + 0.5 - cx) / rx, (z + 0.5 - cz) / rz) + (noise(x * 0.4, z * 0.4) - 0.5) * 0.18;
        if (d < 1) set(x, z, inner);
        else if (d < outer) set(x, z, T.SAND);
      }
    };
    ell(13, 11, 8.5, 6.5, T.WATER, 1.22);
    ell(8.5, 40, 4.2, 3.2, T.WATER, 1.3);
    // tall grass
    for (const [x0, z0, x1, z1] of TALL_RECTS) {
      for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
        if (get(x, z) !== T.WATER && noise(x * 0.5, z * 0.5) > 0.2) set(x, z, T.TALL);
      }
    }
    // shrine clearing
    for (let z = 0; z < 14; z++) for (let x = 20; x < 40; x++) {
      const d = Math.hypot(x + 0.5 - 29.5, z + 0.5 - 6.5);
      if (d < 4.6) set(x, z, T.STONE);
      else if (d < 6.5 && get(x, z) === T.TREE) set(x, z, T.GRASS);
    }
    // town: clear and lay out
    for (let z = 49; z < H - 3; z++) for (let x = 8; x < 49; x++) {
      if (get(x, z) === T.TREE && x > 8 && x < 48) set(x, z, T.GRASS);
    }
    for (let z = 56; z <= 64; z++) for (let x = 20; x <= 35; x++) set(x, z, T.STONE);
    for (const [x0, z0, x1, z1] of FLOWER_RECTS) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) set(x, z, T.FLOWER);
    // paths
    for (const line of PATHS) {
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, az] = line[i], [bx, bz] = line[i + 1];
        const steps = Math.ceil(Math.hypot(bx - ax, bz - az) * 3);
        for (let s = 0; s <= steps; s++) {
          const px = U.lerp(ax, bx, s / steps), pz = U.lerp(az, bz, s / steps);
          for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) {
            const x = Math.floor(px + dx + 0.5), z = Math.floor(pz + dz + 0.5);
            const cur = get(x, z);
            if (cur === T.STONE) continue;
            set(x, z, cur === T.WATER ? T.BRIDGE : T.PATH);
          }
        }
      }
    }
    // loosen trees next to paths
    for (let z = 1; z < H - 1; z++) for (let x = 1; x < W - 1; x++) {
      if (get(x, z) !== T.TREE) continue;
      let near = false;
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (get(x + dx, z + dz) === T.PATH) near = true;
      if (near && r() < 0.8) set(x, z, T.GRASS);
    }
    // dock
    for (let x = DOCK.x0; x <= DOCK.x1; x++) set(x, DOCK.z, T.BRIDGE);
    // buildings, fountain, fences, lamps, signs, rocks
    for (const b of BUILDINGS) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) set(x, z, T.BUILD);
    for (let z = FOUNTAIN.z; z < FOUNTAIN.z + 2; z++) for (let x = FOUNTAIN.x; x < FOUNTAIN.x + 2; x++) set(x, z, T.PROP);
    const isGate = (x, z) => BUILDINGS.some((b) => b.door === x && Math.abs(b.z + b.d - z) <= 2);
    for (const [[x0, z0], [x1]] of FENCES) for (let x = x0; x <= x1; x++) if (get(x, z0) !== T.PATH && !isGate(x, z0)) set(x, z0, T.FENCE);
    for (const [x, z] of LAMPS) set(x, z, T.PROP);
    for (const s of SIGNS) set(s.x, s.z, T.PROP);
    for (const [x, z] of ROCKS) set(x, z, T.ROCK);
    // keep NPC tiles and door fronts walkable
    for (const n of NPCS) if (!WALKABLE.has(get(n.x, n.z))) set(n.x, n.z, T.GRASS);
    for (const b of BUILDINGS) if (get(b.door, b.z + b.d) !== T.PATH) set(b.door, b.z + b.d, T.STONE);
  }

  // ---- heights -------------------------------------------------------------------------
  let heights = null; // per tile (smoothed)
  function computeHeights() {
    const noise = U.makeNoise(21);
    const h = new Float32Array(W * H);
    // distance to nearest walkable tile (for raising wild areas)
    const dist = new Int16Array(W * H).fill(99);
    const q = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (WALKABLE.has(get(x, z))) { dist[idx(x, z)] = 0; q.push([x, z]); }
    }
    for (let i = 0; i < q.length; i++) {
      const [x, z] = q[i];
      const d = dist[idx(x, z)];
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, nz = z + dz;
        if (inside(nx, nz) && dist[idx(nx, nz)] > d + 1) { dist[idx(nx, nz)] = d + 1; q.push([nx, nz]); }
      }
    }
    // distance into water
    const wd = new Int16Array(W * H).fill(0);
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (get(x, z) !== T.WATER) continue;
      let m = 9;
      for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) {
        const t = get(x + dx, z + dz);
        if (t !== T.WATER && t !== T.BRIDGE) m = Math.min(m, Math.hypot(dx, dz));
      }
      wd[idx(x, z)] = m;
    }
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const t = get(x, z), i = idx(x, z);
      if (t === T.WATER || (t === T.BRIDGE && wd[i] >= 0 && isWaterish(x, z))) h[i] = -0.35 - Math.min(wd[i], 4) * 0.28;
      else if (!WALKABLE.has(t) && t !== T.BUILD && t !== T.PROP && t !== T.FENCE) {
        const d = dist[i];
        h[i] = d > 1 ? Math.min((d - 1) * 0.45, 2.2) + noise.fbm(x * 0.2, z * 0.2) * 0.8 * Math.min(1, d - 1) : 0;
      }
    }
    // blur
    const out = new Float32Array(W * H);
    for (let pass = 0; pass < 2; pass++) {
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        let s = 0, c = 0;
        for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
          if (!inside(x + dx, z + dz)) continue;
          s += h[idx(x + dx, z + dz)]; c++;
        }
        out[idx(x, z)] = s / c;
      }
      h.set(out);
    }
    // walkable land stays near level
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const t = get(x, z);
      if (WALKABLE.has(t) && t !== T.BRIDGE) h[idx(x, z)] *= t === T.SAND ? 0.6 : 0.25;
    }
    heights = h;
  }
  function isWaterish(x, z) {
    // a bridge/dock tile over water: any water neighbour within 1
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (get(x + dx, z + dz) === T.WATER) return true;
    return false;
  }

  // bilinear ground height at world coordinates (tile centers at +0.5)
  function groundAt(wx, wz) {
    const fx = U.clamp(wx - 0.5, 0, W - 1.001), fz = U.clamp(wz - 0.5, 0, H - 1.001);
    const x0 = Math.floor(fx), z0 = Math.floor(fz);
    const tx = fx - x0, tz = fz - z0;
    const a = heights[idx(x0, z0)], b = heights[idx(x0 + 1, z0)];
    const c = heights[idx(x0, z0 + 1)], d = heights[idx(x0 + 1, z0 + 1)];
    return U.lerp(U.lerp(a, b, tx), U.lerp(c, d, tx), tz);
  }
  function standHeight(wx, wz) {
    if (get(Math.floor(wx), Math.floor(wz)) === T.BRIDGE) return Math.max(0.08, groundAt(wx, wz));
    return Math.max(groundAt(wx, wz), -0.12);
  }

  // ---- meshes ------------------------------------------------------------------------------
  const WATER_Y = -0.16;

  function groundTexture() {
    const S = 32;
    const noise = U.makeNoise(3);
    const r = U.rng('ground');
    return TX.engine.canvasTexture(W * S, H * S, (g) => {
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        const t = get(x, z);
        const n = noise.fbm(x * 0.25, z * 0.25);
        let col;
        if (t === T.SAND || t === T.WATER) col = t === T.WATER ? `hsl(160, 25%, ${22 + n * 10}%)` : `hsl(42, 55%, ${70 + n * 8}%)`;
        else if (t === T.TREE || t === T.ROCK) col = `hsl(${95 + n * 20}, 38%, ${22 + n * 10}%)`;
        else if (t === T.TALL) col = `hsl(${100 + n * 12}, 45%, ${26 + n * 8}%)`;
        else col = `hsl(${88 + n * 26}, ${48 + n * 10}%, ${36 + n * 12}%)`;
        g.fillStyle = col;
        g.fillRect(x * S, z * S, S, S);
      }
      // speckles for texture
      for (let i = 0; i < W * H * 10; i++) {
        const x = r() * W * S, z = r() * H * S;
        const t = get(Math.floor(x / S), Math.floor(z / S));
        if (t === T.WATER) continue;
        g.fillStyle = r() < 0.5 ? 'rgba(255,255,220,0.07)' : 'rgba(0,30,0,0.08)';
        g.fillRect(x, z, 2, 2);
      }
      // soft dirt paths
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        const t = get(x, z);
        if (t !== T.PATH) continue;
        const cx = (x + 0.5) * S, cz = (z + 0.5) * S;
        const grd = g.createRadialGradient(cx, cz, 2, cx, cz, S * 0.95);
        grd.addColorStop(0, 'rgba(201,164,107,1)');
        grd.addColorStop(0.6, 'rgba(190,150,96,0.95)');
        grd.addColorStop(1, 'rgba(190,150,96,0)');
        g.fillStyle = grd;
        g.fillRect(cx - S, cz - S, S * 2, S * 2);
      }
      for (let i = 0; i < 4000; i++) {
        const x = Math.floor(r() * W), z = Math.floor(r() * H);
        if (get(x, z) !== T.PATH) continue;
        g.fillStyle = r() < 0.5 ? 'rgba(120,90,60,0.5)' : 'rgba(240,220,180,0.5)';
        g.beginPath();
        g.arc(x * S + r() * S, z * S + r() * S, 1 + r() * 2, 0, Math.PI * 2);
        g.fill();
      }
      // cobblestones on stone tiles
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        if (get(x, z) !== T.STONE) continue;
        g.fillStyle = '#b9b2a6';
        g.fillRect(x * S, z * S, S, S);
        for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
          const ox = x * S + i * 16 + (j % 2) * 4, oz = z * S + j * 16;
          g.fillStyle = `hsl(35, 8%, ${62 + r() * 14}%)`;
          g.beginPath();
          g.roundRect(ox + 1.5, oz + 1.5, 13, 13, 4);
          g.fill();
        }
      }
    });
  }

  function buildGround(scene) {
    const geo = new THREE.PlaneGeometry(W, H, W * 2, H * 2);
    geo.rotateX(-Math.PI / 2);
    geo.translate(W / 2, 0, H / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, groundAt(pos.getX(i), pos.getZ(i)));
    geo.computeVertexNormals();
    const tex = groundTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    scene.add(mesh);
    // skirt far beyond the map so the horizon is not empty
    const outer = new THREE.Shape();
    outer.moveTo(-300, -300); outer.lineTo(300, -300); outer.lineTo(300, 300); outer.lineTo(-300, 300); outer.lineTo(-300, -300);
    const hole = new THREE.Path();
    hole.moveTo(-W / 2 + 0.5, -H / 2 + 0.5); hole.lineTo(-W / 2 + 0.5, H / 2 - 0.5); hole.lineTo(W / 2 - 0.5, H / 2 - 0.5); hole.lineTo(W / 2 - 0.5, -H / 2 + 0.5); hole.lineTo(-W / 2 + 0.5, -H / 2 + 0.5);
    outer.holes.push(hole);
    const far = new THREE.Mesh(new THREE.ShapeGeometry(outer).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#3f6b35', roughness: 1 }));
    far.position.set(W / 2, 0.9, H / 2);
    far.receiveShadow = true;
    scene.add(far);
  }

  function heightTexture() {
    const data = new Float32Array(W * H);
    data.set(heights);
    const t = new THREE.DataTexture(data, W, H, THREE.RedFormat, THREE.FloatType);
    t.minFilter = t.magFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  }

  function buildWater(scene, uniforms) {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uHeight: { value: heightTexture() },
          uSize: { value: new THREE.Vector2(W, H) },
          uSunDir: { value: new THREE.Vector3(0.4, 1, 0.3) },
          uNight: { value: 0 },
        },
      ]),
      vertexShader: `
        uniform float uTime;
        varying vec3 vWorld;
        #include <fog_pars_vertex>
        void main() {
          vec3 p = position;
          vec4 world = modelMatrix * vec4(p, 1.0);
          world.y += sin(world.x * 1.3 + uTime * 1.4) * 0.03 + sin(world.z * 1.7 + uTime * 1.1) * 0.03;
          vWorld = world.xyz;
          vec4 mvPosition = viewMatrix * world;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        uniform float uTime, uNight;
        uniform sampler2D uHeight;
        uniform vec2 uSize;
        uniform vec3 uSunDir;
        varying vec3 vWorld;
        #include <fog_pars_fragment>
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
        }
        void main() {
          vec2 uv = (vWorld.xz - 0.5) / (uSize - 1.0);
          float ground = texture2D(uHeight, uv).r;
          float depth = ${WATER_Y.toFixed(2)} - ground;
          if (depth < -0.05) discard;
          vec2 p = vWorld.xz * 1.6;
          float n1 = vnoise(p + vec2(uTime * 0.35, uTime * 0.2));
          float n2 = vnoise(p * 1.9 - vec2(uTime * 0.25, -uTime * 0.3));
          vec3 nrm = normalize(vec3((n1 - 0.5) * 0.5, 1.0, (n2 - 0.5) * 0.5));
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(nrm, viewDir), 0.0), 3.0);
          vec3 shallow = mix(vec3(0.25, 0.75, 0.75), vec3(0.08, 0.2, 0.3), uNight);
          vec3 deep = mix(vec3(0.05, 0.32, 0.55), vec3(0.02, 0.06, 0.15), uNight);
          vec3 col = mix(shallow, deep, smoothstep(0.0, 0.9, depth));
          vec3 sky = mix(vec3(0.75, 0.88, 1.0), vec3(0.1, 0.15, 0.3), uNight);
          col = mix(col, sky, fres * 0.6);
          vec3 h = normalize(normalize(uSunDir) + viewDir);
          float spec = pow(max(dot(nrm, h), 0.0), 140.0);
          col += vec3(1.0, 0.95, 0.85) * spec * mix(2.5, 0.8, uNight);
          // shoreline foam
          float foam = smoothstep(0.18, 0.0, depth) * (0.6 + 0.4 * sin(uTime * 2.0 + vWorld.x * 3.0 + vWorld.z * 2.0));
          foam *= step(0.45, vnoise(p * 3.0 + uTime * 0.5));
          col = mix(col, vec3(1.0), foam * 0.8);
          float alpha = mix(0.55, 0.92, smoothstep(0.0, 0.6, depth));
          alpha = max(alpha, foam);
          alpha *= smoothstep(-0.05, 0.03, depth);
          gl_FragColor = vec4(col, alpha);
          #include <fog_fragment>
        }`,
    });
    mat.uniforms.uTime = uniforms.uTime;
    const geo = new THREE.PlaneGeometry(W, H, W, H).rotateX(-Math.PI / 2).translate(W / 2, WATER_Y, H / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 2;
    scene.add(mesh);
    return mesh;
  }

  // merge simple geometries (non-indexed) with per-vertex colors
  function merge(parts) {
    const pos = [], nor = [], col = [];
    for (const { geo, color } of parts) {
      const g = geo.index ? geo.toNonIndexed() : geo;
      g.computeVertexNormals();
      const c = new THREE.Color(color);
      const p = g.attributes.position.array, n = g.attributes.normal.array;
      for (let i = 0; i < p.length; i += 3) {
        pos.push(p[i], p[i + 1], p[i + 2]);
        nor.push(n[i], n[i + 1], n[i + 2]);
        col.push(c.r, c.g, c.b);
      }
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return out;
  }

  function treeGeometries() {
    const round = merge([
      { geo: new THREE.CylinderGeometry(0.12, 0.18, 1.2, 7).translate(0, 0.6, 0), color: '#6d4c33' },
      { geo: new THREE.IcosahedronGeometry(0.85, 1).translate(0, 1.75, 0), color: '#4caf50' },
      { geo: new THREE.IcosahedronGeometry(0.6, 1).translate(0.5, 1.45, 0.2), color: '#43a047' },
      { geo: new THREE.IcosahedronGeometry(0.62, 1).translate(-0.45, 1.5, -0.15), color: '#66bb6a' },
      { geo: new THREE.IcosahedronGeometry(0.5, 1).translate(0.05, 2.35, 0.05), color: '#81c784' },
    ]);
    const pine = merge([
      { geo: new THREE.CylinderGeometry(0.1, 0.15, 1.0, 6).translate(0, 0.5, 0), color: '#5d4037' },
      { geo: new THREE.ConeGeometry(0.95, 1.3, 8).translate(0, 1.3, 0), color: '#2e7d4f' },
      { geo: new THREE.ConeGeometry(0.75, 1.1, 8).translate(0, 1.95, 0), color: '#388e5c' },
      { geo: new THREE.ConeGeometry(0.5, 0.9, 8).translate(0, 2.55, 0), color: '#43a06a' },
    ]);
    const bush = merge([
      { geo: new THREE.IcosahedronGeometry(0.55, 1).scale(1, 0.75, 1).translate(0, 0.38, 0), color: '#558b2f' },
      { geo: new THREE.IcosahedronGeometry(0.4, 1).translate(0.35, 0.35, 0.1), color: '#689f38' },
    ]);
    return { round, pine, bush };
  }

  function instanced(scene, geo, mat, items, { cast = true, receive = true } = {}) {
    const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, items.length));
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    items.forEach((it, i) => {
      q.setFromEuler(new THREE.Euler(it.rx || 0, it.ry || 0, it.rz || 0));
      s.set(it.sx ?? it.s ?? 1, it.sy ?? it.s ?? 1, it.sz ?? it.s ?? 1);
      p.set(it.x, it.y, it.z);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
      if (it.color) mesh.setColorAt(i, new THREE.Color(it.color));
    });
    mesh.count = items.length;
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    scene.add(mesh);
    return mesh;
  }

  function buildVegetation(scene) {
    const r = U.rng('veg');
    const geos = treeGeometries();
    const leafMat = TX.engine.addWind(new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 }), { sway: 0.06, height: 0.4, speed: 1.1 });
    const groups = { round: [], pine: [], bush: [] };
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (get(x, z) !== T.TREE) continue;
      const woods = z < 25 && x >= 27;
      const kind = woods ? (r() < 0.7 ? 'pine' : 'round') : r() < 0.75 ? 'round' : r() < 0.6 ? 'pine' : 'bush';
      const y = groundAt(x + 0.5, z + 0.5);
      const s = r.range(0.85, 1.35) * (kind === 'bush' ? 1 : 1.1);
      const tint = new THREE.Color().setHSL(r.range(-0.02, 0.04) + 0, 0, 1).offsetHSL(0, 0, 0);
      tint.setRGB(r.range(0.82, 1.08), r.range(0.9, 1.08), r.range(0.8, 1.0));
      groups[kind].push({ x: x + 0.5 + r.range(-0.2, 0.2), y: y - 0.05, z: z + 0.5 + r.range(-0.2, 0.2), s, ry: r() * 6.28, color: tint });
    }
    // decorative bushes on grass edges
    for (let i = 0; i < 160; i++) {
      const x = r.int(3, W - 4), z = r.int(3, H - 4);
      if (get(x, z) !== T.GRASS) continue;
      if ((z >= 50 && z <= 70 && x > 18 && x < 37)) continue;
      groups.bush.push({ x: x + r.range(0.1, 0.9), y: groundAt(x + 0.5, z + 0.5), z: z + r.range(0.1, 0.9), s: r.range(0.4, 0.7), ry: r() * 6, color: new THREE.Color(1, 1, 1) });
    }
    for (const k of Object.keys(groups)) instanced(scene, geos[k], leafMat, groups[k]);

    // grass blades
    const blade = new THREE.PlaneGeometry(0.07, 1, 1, 4);
    const bp = blade.attributes.position;
    const colors = [];
    for (let i = 0; i < bp.count; i++) {
      const y = bp.getY(i) + 0.5;
      bp.setY(i, y);
      bp.setX(i, bp.getX(i) * (1 - y * 0.85));
      bp.setZ(i, y * y * 0.12);
      const c = new THREE.Color('#2f6b1f').lerp(new THREE.Color('#b5e36b'), y);
      colors.push(c.r, c.g, c.b);
    }
    blade.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    blade.computeVertexNormals();
    const grassMat = TX.engine.addWind(new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.8 }), { sway: 0.22, height: 1.6, push: 0.9, speed: 2.1 });
    const short = [], tall = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const t = get(x, z);
      if (t === T.TALL) {
        for (let i = 0; i < 26; i++) {
          const px = x + r(), pz = z + r();
          tall.push({ x: px, y: groundAt(px, pz), z: pz, sx: r.range(1, 1.6), sy: r.range(0.55, 0.85), sz: 1, ry: r() * 6.28, color: new THREE.Color().setRGB(r.range(0.8, 1), r.range(0.85, 1.05), r.range(0.7, 0.95)) });
        }
      } else if (t === T.GRASS || t === T.FLOWER) {
        const n = t === T.FLOWER ? 4 : 7;
        for (let i = 0; i < n; i++) {
          const px = x + r(), pz = z + r();
          short.push({ x: px, y: groundAt(px, pz), z: pz, sx: r.range(0.9, 1.3), sy: r.range(0.16, 0.3), sz: 1, ry: r() * 6.28, color: new THREE.Color().setRGB(r.range(0.85, 1.05), r.range(0.9, 1.05), r.range(0.75, 0.95)) });
        }
      }
    }
    instanced(scene, blade, grassMat, short, { cast: false });
    instanced(scene, blade, grassMat, tall, { cast: true });

    // flowers
    const head = new THREE.IcosahedronGeometry(0.07, 0);
    const flowerMat = TX.engine.addWind(new THREE.MeshStandardMaterial({ roughness: 0.6, emissive: 0x111111 }), { sway: 0.08, height: 3 });
    const flowers = [];
    const hues = ['#ff6b8b', '#ffd166', '#ffffff', '#c39bff', '#ff9f43', '#7fd1ff'];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const t = get(x, z);
      const n = t === T.FLOWER ? 10 : t === T.GRASS && r() < 0.12 ? 2 : 0;
      for (let i = 0; i < n; i++) {
        const px = x + r(), pz = z + r();
        flowers.push({ x: px, y: groundAt(px, pz) + r.range(0.15, 0.3), z: pz, s: r.range(0.8, 1.3), color: r.pick(hues) });
      }
    }
    instanced(scene, head, flowerMat, flowers, { cast: false });

    // rocks
    const rockGeo = new THREE.IcosahedronGeometry(0.55, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: '#9ea3a8', flatShading: true, roughness: 0.9 });
    const rocks = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (get(x, z) === T.ROCK) rocks.push({ x: x + 0.5, y: groundAt(x + 0.5, z + 0.5) + 0.25, z: z + 0.5, sx: 1.1, sy: 0.8, sz: 1, ry: r() * 6 });
    }
    for (let i = 0; i < 90; i++) {
      const x = r.int(2, W - 3), z = r.int(2, H - 3);
      const t = get(x, z);
      if (t !== T.TREE && t !== T.SAND) continue;
      rocks.push({ x: x + r(), y: groundAt(x + 0.5, z + 0.5) + 0.05, z: z + r(), s: r.range(0.25, 0.6), ry: r() * 6, rx: r() });
    }
    instanced(scene, rockGeo, rockMat, rocks);
  }

  // ---- buildings & props ------------------------------------------------------------------
  const windowMats = [];
  function buildHouse(scene, b) {
    const g = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: b.wall, roughness: 0.85 });
    const trimMat = new THREE.MeshStandardMaterial({ color: '#8d6e63', roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: b.roof, roughness: 0.6, flatShading: true });
    const w = b.w - 0.3, d = b.d - 0.3, h = b.center ? 2.8 : 2.3;
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    walls.position.y = h / 2;
    walls.castShadow = walls.receiveShadow = true;
    g.add(walls);
    const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.3, d + 0.1), new THREE.MeshStandardMaterial({ color: '#9e9e9e', roughness: 0.9 }));
    base.position.y = 0.15;
    base.receiveShadow = true;
    g.add(base);
    // gabled roof
    const rh = b.center ? 1.2 : 1.5;
    const shape = new THREE.Shape();
    shape.moveTo(-d / 2 - 0.35, 0);
    shape.lineTo(0, rh);
    shape.lineTo(d / 2 + 0.35, 0);
    shape.lineTo(-d / 2 - 0.35, 0);
    const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: w + 0.5, bevelEnabled: false });
    roofGeo.translate(0, 0, -(w + 0.5) / 2);
    roofGeo.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h;
    roof.castShadow = roof.receiveShadow = true;
    g.add(roof);
    // windows (glow at night)
    const winMat = new THREE.MeshStandardMaterial({ color: '#cfe8ff', emissive: '#ffb347', emissiveIntensity: 0, roughness: 0.2 });
    windowMats.push(winMat);
    const front = d / 2 + 0.01;
    const doorX = b.door - b.x + 0.5 - b.w / 2;
    const winGeo = new THREE.PlaneGeometry(0.7, 0.6);
    const frameGeo = new THREE.BoxGeometry(0.85, 0.75, 0.05);
    for (let wx = -w / 2 + 0.9; wx < w / 2 - 0.5; wx += 1.6) {
      if (Math.abs(wx - doorX) < 1) continue;
      const fr = new THREE.Mesh(frameGeo, trimMat);
      fr.position.set(wx, h * 0.58, front);
      g.add(fr);
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(wx, h * 0.58, front + 0.03);
      g.add(win);
      // flower box
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.2), trimMat);
      box.position.set(wx, h * 0.58 - 0.42, front + 0.1);
      g.add(box);
      for (let i = 0; i < 4; i++) {
        const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color: ['#ff6b8b', '#ffd166', '#c39bff'][i % 3] }));
        f.position.set(wx - 0.3 + i * 0.2, h * 0.58 - 0.3, front + 0.12);
        g.add(f);
      }
    }
    // door
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.35, 0.1), new THREE.MeshStandardMaterial({ color: b.center ? '#90caf9' : '#7b4b2a', roughness: 0.5, emissive: b.center ? '#4fc3f7' : '#000000', emissiveIntensity: b.center ? 0.3 : 0 }));
    door.position.set(doorX, 0.98, front + 0.02);
    g.add(door);
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: '#bdbdbd' }));
    step.position.set(doorX, 0.06, front + 0.25);
    step.receiveShadow = true;
    g.add(step);
    // chimney
    if (!b.center) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 0.4), new THREE.MeshStandardMaterial({ color: '#8d6e63' }));
      ch.position.set(w / 2 - 0.8, h + 0.9, -d / 4);
      ch.castShadow = true;
      g.add(ch);
      g.userData.chimney = new THREE.Vector3(b.x + b.w / 2 + w / 2 - 0.8, h + 1.5, b.z + b.d / 2 - d / 4);
    }
    // sign for named public buildings
    if (b.name && b.id !== 'home') {
      const tex = TX.engine.canvasTexture(512, 128, (c) => {
        c.fillStyle = b.center ? '#e53950' : '#2e8b57';
        c.beginPath();
        c.roundRect(0, 0, 512, 128, 28);
        c.fill();
        c.fillStyle = '#fff';
        c.font = 'bold 54px Fredoka, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(b.name.toUpperCase(), 256, 68);
      });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      sign.position.set(doorX, h + 0.1, front + 0.06);
      g.add(sign);
    }
    g.position.set(b.x + b.w / 2, 0, b.z + b.d / 2);
    scene.add(g);
    return g;
  }

  function buildProps(scene, particles) {
    const lampLights = [];
    const lampMat = new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffcf70', emissiveIntensity: 0.2 });
    windowMats.push(lampMat);
    const postMat = new THREE.MeshStandardMaterial({ color: '#37474f', roughness: 0.5, metalness: 0.4 });
    LAMPS.forEach(([x, z], i) => {
      const g = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 2.2, 8), postMat);
      post.position.y = 1.1;
      post.castShadow = true;
      g.add(post);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), lampMat);
      lamp.position.y = 2.3;
      g.add(lamp);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.2, 8), postMat);
      cap.position.y = 2.5;
      g.add(cap);
      if (i < 6) {
        const pl = new THREE.PointLight(0xffc56b, 0, 9, 1.6);
        pl.position.y = 2.2;
        g.add(pl);
        lampLights.push(pl);
      }
      g.position.set(x + 0.5, groundAt(x + 0.5, z + 0.5), z + 0.5);
      scene.add(g);
    });
    // signs
    const signMat = new THREE.MeshStandardMaterial({ color: '#a1887f', roughness: 0.8 });
    for (const s of SIGNS) {
      const g = new THREE.Group();
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), signMat);
      p.position.y = 0.45;
      g.add(p);
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.08), signMat);
      board.position.y = 0.95;
      board.castShadow = true;
      g.add(board);
      g.position.set(s.x + 0.5, groundAt(s.x + 0.5, s.z + 0.5), s.z + 0.5);
      scene.add(g);
    }
    // fences
    const fenceMat = new THREE.MeshStandardMaterial({ color: '#f5f0e6', roughness: 0.7 });
    const posts = [], rails = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (get(x, z) !== T.FENCE) continue;
      const y = groundAt(x + 0.5, z + 0.5);
      posts.push({ x: x + 0.5, y: y + 0.35, z: z + 0.5 });
      if (get(x + 1, z) === T.FENCE) for (const hy of [0.3, 0.55]) rails.push({ x: x + 1, y: y + hy, z: z + 0.5 });
    }
    instanced(scene, new THREE.BoxGeometry(0.12, 0.7, 0.12), fenceMat, posts);
    instanced(scene, new THREE.BoxGeometry(1, 0.08, 0.05), fenceMat, rails);
    // fountain
    const fx = FOUNTAIN.x + 1, fz = FOUNTAIN.z + 1;
    const stone = new THREE.MeshStandardMaterial({ color: '#cfc8bb', roughness: 0.8 });
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.45, 28, 1, true), stone);
    basin.position.set(fx, 0.22, fz);
    basin.castShadow = basin.receiveShadow = true;
    scene.add(basin);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.1, 8, 32).rotateX(Math.PI / 2), stone);
    rim.position.set(fx, 0.45, fz);
    scene.add(rim);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 1.4, 12), stone);
    pillar.position.set(fx, 0.7, fz);
    pillar.castShadow = true;
    scene.add(pillar);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI), stone);
    bowl.position.set(fx, 1.4, fz);
    scene.add(bowl);
    const fw = new THREE.Mesh(new THREE.CircleGeometry(1.1, 28).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4fc3f7', emissive: '#29b6f6', emissiveIntensity: 0.2, roughness: 0.1, transparent: true, opacity: 0.85 }));
    fw.position.set(fx, 0.38, fz);
    windowMats.push(fw.material);
    scene.add(fw);
    // shrine pillars
    const shrineMat = new THREE.MeshStandardMaterial({ color: '#d7ccc8', roughness: 0.7 });
    const crystalMat = new THREE.MeshStandardMaterial({ color: '#b388ff', emissive: '#7c4dff', emissiveIntensity: 1.2, flatShading: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      const px = 29.5 + Math.cos(a) * 4.3, pz = 6.5 + Math.sin(a) * 4.3;
      if (pz > 9.5 && Math.abs(px - 29.5) < 2) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.4, 10), shrineMat);
      col.position.set(px, 1.2, pz);
      col.castShadow = true;
      scene.add(col);
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0).scale(1, 1.6, 1), crystalMat);
      cr.position.set(px, 2.75, pz);
      scene.add(cr);
      set(Math.floor(px), Math.floor(pz), T.PROP);
    }
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.3, 24), shrineMat);
    altar.position.set(29.5, 0.15, 4.5);
    altar.receiveShadow = true;
    scene.add(altar);
    // dock planks
    const plankMat = new THREE.MeshStandardMaterial({ color: '#a47148', roughness: 0.9 });
    for (let x = DOCK.x0; x <= DOCK.x1; x++) {
      const pl = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 1.1), plankMat);
      pl.position.set(x + 0.5, 0.04, DOCK.z + 0.5);
      pl.castShadow = pl.receiveShadow = true;
      scene.add(pl);
      for (const s of [-0.45, 0.45]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), plankMat);
        post.position.set(x + 0.5, -0.4, DOCK.z + 0.5 + s);
        scene.add(post);
      }
    }
    return { lampLights };
  }

  // ---- NPC runtime ---------------------------------------------------------------------------
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const FACE_ANGLE = { up: Math.PI, down: 0, left: -Math.PI / 2, right: Math.PI / 2 };

  function spawnNpcs(scene) {
    return NPCS.map((def) => {
      const c = TX.characters.build(TX.characters.STYLES[def.style]);
      scene.add(c.root);
      const n = {
        def, c, x: def.x, z: def.z, face: def.face, moving: false, from: null, to: null, t: 0,
        home: [def.x, def.z], timer: 2 + Math.random() * 4, bubble: null,
      };
      placeNpc(n);
      return n;
    });
  }
  function placeNpc(n) {
    const px = n.moving ? U.lerp(n.from[0], n.to[0], n.t) : n.x;
    const pz = n.moving ? U.lerp(n.from[1], n.to[1], n.t) : n.z;
    n.c.root.position.set(px + 0.5, standHeight(px + 0.5, pz + 0.5), pz + 0.5);
    const target = FACE_ANGLE[n.face];
    let d = target - n.c.root.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    n.c.root.rotation.y += d * 0.3;
  }

  // ---- public build -----------------------------------------------------------------------------
  function build(scene) {
    generate();
    computeHeights();
    const uniforms = TX.engine.uniforms;
    buildGround(scene);
    const water = buildWater(scene, uniforms);
    buildVegetation(scene);
    const houses = BUILDINGS.map((b) => buildHouse(scene, b));
    const props = buildProps(scene);
    const npcs = spawnNpcs(scene);

    // ambient particles: fireflies, chimney smoke, fountain spray
    const fireflies = new TX.engine.Particles(140, { color: 0xd4ff6b, size: 0.18 });
    scene.add(fireflies.points);
    const smoke = new TX.engine.Particles(120, { color: 0xbfbfbf, size: 0.9, additive: false, opacity: 0.35 });
    scene.add(smoke.points);
    const spray = new TX.engine.Particles(160, { color: 0xbfe9ff, size: 0.12 });
    scene.add(spray.points);
    const chimneys = houses.map((h) => h.userData.chimney).filter(Boolean);
    const r = U.rng('ambient');
    let fireTimer = 0, smokeTimer = 0, sprayTimer = 0;

    const world = {
      W, H, T, tiles, get, water, npcs, props, buildings: BUILDINGS, signs: SIGNS,
      groundAt, standHeight,
      walkable(x, z, ignore) {
        if (!WALKABLE.has(get(x, z))) return false;
        for (const n of npcs) {
          if (n === ignore) continue;
          if ((n.x === x && n.z === z) || (n.moving && n.to[0] === x && n.to[1] === z)) return false;
        }
        return true;
      },
      isTall: (x, z) => get(x, z) === T.TALL,
      area(x, z) { return AREAS.find((a) => a.test(x, z)); },
      encounterTable(x, z) { return ENCOUNTERS[this.area(x, z).name]; },
      npcAt(x, z) { return npcs.find((n) => n.x === x && n.z === z); },
      signAt(x, z) { return SIGNS.find((s) => s.x === x && s.z === z); },
      doorAt(x, z) { return BUILDINGS.find((b) => b.door === x && b.z + b.d - 1 === z); },
      update(dt, time, playerTile, frozen) {
        const night = TX.engine.night;
        water.material.uniforms.uNight.value = night;
        for (const m of windowMats) m.emissiveIntensity = night * (m.emissive.getHex() === 0x29b6f6 ? 1.2 : 1.6) + 0.05;
        props.lampLights.forEach((l) => (l.intensity = night * 6));
        // NPC wandering
        for (const n of npcs) {
          if (n.moving) {
            n.t += dt * 3.2;
            if (n.t >= 1) { n.moving = false; n.x = n.to[0]; n.z = n.to[1]; }
          } else if (n.def.wander && !frozen && !n.busy) {
            n.timer -= dt;
            if (n.timer <= 0) {
              n.timer = 2 + Math.random() * 5;
              const dir = U.rng(Math.random() * 1e9).pick(Object.keys(DIRS));
              const [dx, dz] = DIRS[dir];
              const nx = n.x + dx, nz = n.z + dz;
              n.face = dir;
              const far = Math.abs(nx - n.home[0]) > n.def.wander || Math.abs(nz - n.home[1]) > n.def.wander;
              if (!far && world.walkable(nx, nz, n) && !(playerTile[0] === nx && playerTile[1] === nz)) {
                n.moving = true; n.t = 0; n.from = [n.x, n.z]; n.to = [nx, nz];
              }
            }
          }
          placeNpc(n);
          TX.characters.animate(n.c, dt, n.moving, false);
        }
        // fireflies at night around the player
        fireTimer -= dt;
        if (night > 0.3 && fireTimer <= 0) {
          fireTimer = 0.05;
          const px = playerTile[0] + r.range(-14, 14), pz = playerTile[1] + r.range(-10, 10);
          const t = get(Math.floor(px), Math.floor(pz));
          if (t !== T.WATER && t !== T.BUILD) {
            fireflies.emit({ x: px, y: groundAt(px, pz) + r.range(0.3, 1.8), z: pz, vx: r.range(-0.3, 0.3), vy: r.range(-0.1, 0.1), vz: r.range(-0.3, 0.3), life: r.range(3, 6), fade: 'in-out', size: r.range(0.7, 1.4),
              update: (p, d) => { p.vx += Math.sin(p.age * 3 + p.z) * d * 0.6; p.vz += Math.cos(p.age * 2.5 + p.x) * d * 0.6; } });
          }
        }
        fireflies.mat.uniforms.uOpacity.value = U.clamp((night - 0.2) * 2, 0, 1);
        fireflies.update(dt);
        smokeTimer -= dt;
        if (smokeTimer <= 0) {
          smokeTimer = 0.25;
          for (const c of chimneys) smoke.emit({ x: c.x + r.range(-0.1, 0.1), y: c.y, z: c.z, vx: 0.15, vy: r.range(0.4, 0.7), vz: r.range(-0.05, 0.05), life: 4, size: r.range(0.6, 1), grow: 2.5, drag: 0.1 });
        }
        smoke.update(dt);
        sprayTimer -= dt;
        if (sprayTimer <= 0) {
          sprayTimer = 0.02;
          const a = r() * Math.PI * 2;
          spray.emit({ x: FOUNTAIN.x + 1, y: 1.55, z: FOUNTAIN.z + 1, vx: Math.cos(a) * r.range(0.5, 0.9), vy: r.range(1.2, 1.8), vz: Math.sin(a) * r.range(0.5, 0.9), g: 5, life: 0.75, size: r.range(0.6, 1.1) });
        }
        spray.update(dt);
      },
      setSun(dir) { water.material.uniforms.uSunDir.value.copy(dir); },
    };
    return world;
  }

  return { build, W, H, T, DIRS, FACE_ANGLE, ENCOUNTERS };
})();
