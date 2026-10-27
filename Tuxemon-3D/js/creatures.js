// Procedural 3D monsters: body plan from the Tuxemon "shape", decorations
// and palette from the elements, proportions from a per-species seed.
'use strict';

TX.creatures = (() => {
  const U = TX.util;
  const D = window.TX_DATA;

  // evolution stage: 0 basic, 1 stage1, 2 stage2
  const stageCache = {};
  function stageOf(slug) {
    if (slug in stageCache) return stageCache[slug];
    let stage = 0;
    for (const [s, sp] of Object.entries(D.species)) {
      if (sp.evo && sp.evo.to === slug) stage = stageOf(s) + 1;
    }
    return (stageCache[slug] = stage);
  }

  // ---- materials ---------------------------------------------------------------
  const matCache = new Map();
  function toon(color, opts = {}) {
    const key = 'toon' + color + JSON.stringify(opts);
    if (matCache.has(key)) return matCache.get(key);
    const m = new THREE.MeshToonMaterial({ color, gradientMap: TX.engine.toonMap(), ...opts });
    matCache.set(key, m);
    return m;
  }
  function glow(color, strength = 2.2) {
    const key = 'glow' + color + strength;
    if (matCache.has(key)) return matCache.get(key);
    const c = new THREE.Color(color).multiplyScalar(strength);
    const m = new THREE.MeshBasicMaterial({ color: c, toneMapped: true });
    matCache.set(key, m);
    return m;
  }
  function metal(color) {
    const key = 'metal' + color;
    if (matCache.has(key)) return matCache.get(key);
    const m = new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.28 });
    matCache.set(key, m);
    return m;
  }
  function ice() {
    if (matCache.has('ice')) return matCache.get('ice');
    const m = new THREE.MeshStandardMaterial({
      color: 0xbff4ff, emissive: 0x4fc3f7, emissiveIntensity: 0.6, roughness: 0.1,
      metalness: 0.1, transparent: true, opacity: 0.85, flatShading: true,
    });
    matCache.set('ice', m);
    return m;
  }

  // ---- geometry helpers ----------------------------------------------------------
  const sphere = (sx, sy, sz, seg = 22) => new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)).scale(sx, sy, sz);
  const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14);
  const cone = (r, h, seg = 10) => new THREE.ConeGeometry(r, h, seg);

  function part(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], outline = 0.03) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    if (outline) TX.engine.addOutline(m, outline);
    parent.add(m);
    return m;
  }

  function group(parent, pos = [0, 0, 0], rot = [0, 0, 0]) {
    const g = new THREE.Group();
    g.position.set(...pos);
    g.rotation.set(...rot);
    parent.add(g);
    return g;
  }

  // ---- palette ---------------------------------------------------------------------
  function palette(slug, types) {
    const r = U.rng(slug + ':pal');
    const main = new THREE.Color(U.ELEMENT[types[0]]?.color || '#c9b79c');
    const hsl = {};
    main.getHSL(hsl);
    const body = new THREE.Color().setHSL(
      (hsl.h + r.range(-0.04, 0.04) + 1) % 1,
      U.clamp(hsl.s * r.range(0.65, 0.95), 0.2, 0.85),
      U.clamp(hsl.l * r.range(0.85, 1.15), 0.32, 0.68)
    );
    if (types[0] === 'shadow') body.setHSL(0.74, 0.25, 0.22);
    if (types[0] === 'metal') body.setHSL(0.6, 0.12, 0.62);
    if (types[0] === 'normal') body.setHSL(r.range(0.05, 0.11), 0.35, r.range(0.5, 0.68));
    const second = types[1] ? new THREE.Color(U.ELEMENT[types[1]].color) : body.clone().offsetHSL(0, -0.05, -0.16);
    const belly = new THREE.Color().setHSL((hsl.h + 0.08) % 1, 0.35, 0.86);
    const dark = body.clone().offsetHSL(0, 0, -0.2);
    return {
      body: '#' + body.getHexString(),
      second: '#' + second.getHexString(),
      belly: '#' + belly.getHexString(),
      dark: '#' + dark.getHexString(),
      glow: U.ELEMENT[types[0]]?.glow || '#ffffff',
    };
  }

  // ---- eyes / head -------------------------------------------------------------------
  function eyes(head, { y = 0.1, z = 0.8, spread = 0.38, size = 0.26, glowColor = null }) {
    const res = [];
    for (const s of [-1, 1]) {
      const eg = group(head, [s * spread, y, z + 0.06]);
      const white = part(eg, sphere(size * 0.85, size, size * 0.55), toon('#ffffff'), [0, 0, 0], [0, 0, 0], 0.02);
      const pupil = part(eg, sphere(size * 0.55, size * 0.7, size * 0.3), glowColor ? glow(glowColor, 2.5) : toon('#1c1530'), [0, -size * 0.05, size * 0.32], [0, 0, 0], 0);
      part(eg, sphere(size * 0.18, size * 0.18, size * 0.1), glow('#ffffff', 1.5), [size * 0.18, size * 0.22, size * 0.52], [0, 0, 0], 0);
      res.push({ g: eg, white, pupil });
    }
    return res;
  }

  function ears(head, kind, mat, r) {
    const res = [];
    for (const s of [-1, 1]) {
      let e;
      if (kind === 'pointy') {
        e = part(head, cone(0.22, 0.6, 8), mat, [s * 0.45, 0.72, -0.05], [0, 0, -s * 0.35]);
      } else if (kind === 'long') {
        e = part(head, sphere(0.16, 0.55, 0.1), mat, [s * 0.4, 0.85, -0.1], [0, 0, -s * 0.25]);
      } else if (kind === 'round') {
        e = part(head, sphere(0.25, 0.25, 0.1), mat, [s * 0.62, 0.55, 0], [0, 0, 0]);
      } else {
        continue;
      }
      e.userData.side = s;
      res.push(e);
    }
    return res;
  }

  // ---- element decorations -----------------------------------------------------------
  function flame(parent, pos, size, rig) {
    const g = group(parent, pos);
    const layers = [['#ff3d00', 1], ['#ff9100', 0.72], ['#ffe082', 0.45]];
    layers.forEach(([c, k], i) => {
      const f = part(g, cone(0.32 * size * k, 0.95 * size * k, 9), glow(c, 2.6 - i * 0.3), [0, 0.42 * size * k, 0.02 * i], [0, 0, 0], 0);
      f.castShadow = false;
    });
    rig.flames.push(g);
    return g;
  }

  function leaf(parent, pos, rot, size, color) {
    return part(parent, sphere(0.16 * size, 0.04 * size, 0.38 * size, 12).translate(0, 0, 0.3 * size), toon(color), pos, rot, 0.015);
  }

  function rockPlate(parent, pos, size, color) {
    const geo = new THREE.IcosahedronGeometry(0.3 * size, 0);
    const m = new THREE.MeshToonMaterial({ color, gradientMap: TX.engine.toonMap(), flatShading: true });
    return part(parent, geo, m, pos, [Math.random(), Math.random(), Math.random()], 0.02);
  }

  function crystal(parent, pos, rot, size) {
    const geo = new THREE.OctahedronGeometry(0.22 * size, 0).scale(0.6, 1.6, 0.6);
    return part(parent, geo, ice(), pos, rot, 0.015);
  }

  function zigzag(parent, pos, rot, size) {
    const shape = new THREE.Shape();
    const pts = [[0, 0], [0.18, 0.35], [0.06, 0.35], [0.24, 0.75], [-0.04, 0.3], [0.08, 0.3], [-0.06, 0]];
    shape.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) shape.lineTo(p[0], p[1]);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false }).scale(size, size, size);
    return part(parent, geo, glow('#ffe14d', 2.2), pos, rot, 0.012);
  }

  function wing(parent, side, size, color, rig, feather = true) {
    const g = group(parent, [side * 0.45 * size, 0.15 * size, -0.1 * size]);
    const n = feather ? 4 : 1;
    for (let i = 0; i < n; i++) {
      const len = (feather ? 0.75 - i * 0.12 : 0.85) * size;
      part(g, sphere(len, 0.06 * size, 0.2 * size, 14).translate(side * len * 0.9, 0, 0), toon(color), [0, -i * 0.06 * size, -i * 0.12 * size], [0, side * (0.15 + i * 0.12), 0], 0.015);
    }
    g.userData.side = side;
    rig.wings.push(g);
    return g;
  }

  function decorate(types, rig, pal, size, r) {
    const { head, body, tailTip } = rig;
    for (const t of types) {
      switch (t) {
        case 'fire':
          flame(head, [0, 0.75, -0.1], 0.75 * size, rig);
          if (tailTip) flame(tailTip, [0, 0.05, 0], 0.7 * size, rig);
          break;
        case 'water':
          part(body, sphere(0.06, 0.38, 0.5, 12), toon(pal.second), [0, 0.55, -0.15], [0.3, 0, 0], 0.015);
          for (const s of [-1, 1]) part(head, sphere(0.05, 0.25, 0.32, 10), toon(pal.second), [s * 0.75, 0.0, -0.1], [0, s * 0.6, s * 0.3], 0.015);
          break;
        case 'wood': {
          const n = r.int(3, 5);
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            leaf(head, [0, 0.82, 0], [-0.9 + Math.sin(a) * 0.2, a, 0], 1.2 * size, i % 2 ? '#5fd35f' : '#2e9e48');
          }
          part(head, new THREE.CylinderGeometry(0.03, 0.04, 0.25, 6), toon('#4e7a2a'), [0, 0.9, 0], [0, 0, 0], 0.01);
          break;
        }
        case 'earth':
          for (let i = 0; i < 4; i++) rockPlate(body, [r.range(-0.3, 0.3), 0.5 + r.range(0, 0.15), -0.2 + i * 0.15 - 0.2], size * r.range(0.8, 1.2), i % 2 ? '#8d6e63' : '#a1887f');
          break;
        case 'metal':
          part(head, new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), metal('#cfd8dc'), [0, 0.95, 0], [0, 0, 0], 0.01);
          part(head, sphere(0.09, 0.09, 0.09, 10), glow('#ff5252', 2.5), [0, 1.22, 0], [0, 0, 0], 0);
          for (const s of [-1, 1]) part(head, new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), metal('#90a4ae'), [s * 0.82, 0, 0], [0, 0, Math.PI / 2], 0.01);
          break;
        case 'sky':
          if (!rig.wings.length) {
            wing(body, -1, size * 0.8, pal.belly, rig);
            wing(body, 1, size * 0.8, pal.belly, rig);
          }
          break;
        case 'frost':
          for (let i = 0; i < 5; i++) crystal(body, [r.range(-0.35, 0.35), 0.55, -0.35 + i * 0.16], [r.range(-0.4, 0.4), 0, r.range(-0.5, 0.5)], size);
          crystal(head, [0, 0.85, 0], [0, 0, 0], size * 1.2);
          break;
        case 'lightning':
          for (const s of [-1, 1]) zigzag(head, [s * 0.35, 0.6, 0], [0, 0, -s * 0.4], size * 0.9);
          if (tailTip) zigzag(tailTip, [0, 0, 0], [0, 0, 0.3], size);
          break;
        case 'shadow': {
          const w = new THREE.Group();
          head.add(w);
          rig.wisps = w;
          for (let i = 0; i < 3; i++) part(w, sphere(0.12, 0.12, 0.12, 10), glow('#b388ff', 2), [Math.cos(i * 2.1) * 0.9, 0.4, Math.sin(i * 2.1) * 0.9], [0, 0, 0], 0);
          break;
        }
        case 'cosmic': {
          part(head, new THREE.OctahedronGeometry(0.13, 0), glow('#ff80ff', 2.4), [0, 0.45, 0.78], [0, 0, 0], 0.01);
          const orb = new THREE.Group();
          body.add(orb);
          rig.orbit = orb;
          for (let i = 0; i < 2; i++) part(orb, new THREE.OctahedronGeometry(0.1, 0), glow('#e1bee7', 2.4), [Math.cos(i * Math.PI) * 1.1, 0.5, Math.sin(i * Math.PI) * 1.1], [0, 0, 0], 0);
          break;
        }
        case 'venom':
          for (let i = 0; i < 6; i++) {
            const a = r.range(0, Math.PI * 2);
            part(body, sphere(0.09, 0.09, 0.04, 8), toon('#8e24aa'), [Math.cos(a) * 0.55, 0.3 + r.range(-0.1, 0.25), Math.sin(a) * 0.55], [0, -a, 0], 0);
          }
          for (let i = 0; i < 3; i++) part(body, cone(0.08, 0.3, 6), toon('#ce93d8'), [0, 0.62, -0.3 + i * 0.25], [-0.3, 0, 0], 0.01);
          break;
        case 'normal':
          part(head, sphere(0.25, 0.18, 0.2, 10), toon(pal.belly), [0, 0.68, 0.15], [0.3, 0, 0], 0.015);
          break;
        case 'heroic':
          part(head, cone(0.12, 0.45, 6), toon('#ff4f6d'), [0, 0.8, 0], [-0.3, 0, 0], 0.015);
          break;
      }
    }
  }

  // ---- body plans --------------------------------------------------------------------
  // Each returns a rig { root, body, head, legs:[], arms:[], tail, tailTip, wings:[], flames:[] }
  function newRig() {
    const root = new THREE.Group();
    const pivot = group(root);
    return { root, pivot, body: null, head: null, legs: [], arms: [], tail: null, tailTip: null, wings: [], flames: [], ears: [], eyes: [], float: 0 };
  }

  function legs4(rig, pal, { len = 0.5, width = 0.15, spread = 0.38, front = 0.42, back = -0.42, y = 0 }) {
    for (const z of [front, back]) {
      for (const s of [-1, 1]) {
        const g = group(rig.body, [s * spread, y, z]);
        part(g, capsule(width, len), toon(pal.dark), [0, -len * 0.55, 0], [0, 0, 0], 0.02);
        part(g, sphere(width * 1.2, width * 0.7, width * 1.5), toon(pal.dark), [0, -len - width * 0.4, width * 0.4], [0, 0, 0], 0.02);
        g.userData.phase = (z > 0 ? 0 : Math.PI) + (s > 0 ? Math.PI : 0);
        rig.legs.push(g);
      }
    }
  }

  function legs2(rig, pal, { len = 0.5, width = 0.17, spread = 0.32, y = 0 }) {
    for (const s of [-1, 1]) {
      const g = group(rig.body, [s * spread, y, 0]);
      part(g, capsule(width, len), toon(pal.dark), [0, -len * 0.55, 0], [0, 0, 0], 0.02);
      part(g, sphere(width * 1.3, width * 0.7, width * 1.7), toon(pal.dark), [0, -len - width * 0.4, width * 0.45], [0, 0, 0], 0.02);
      g.userData.phase = s > 0 ? Math.PI : 0;
      rig.legs.push(g);
    }
  }

  function arms(rig, pal, { len = 0.5, width = 0.13, spread = 0.6, y = 0.25 }) {
    for (const s of [-1, 1]) {
      const g = group(rig.body, [s * spread, y, 0.05], [0, 0, s * 0.35]);
      part(g, capsule(width, len), toon(pal.body), [0, -len * 0.5, 0], [0, 0, 0], 0.02);
      part(g, sphere(width * 1.3, width * 1.3, width * 1.3), toon(pal.belly), [0, -len - width * 0.3, 0], [0, 0, 0], 0.02);
      g.userData.side = s;
      rig.arms.push(g);
    }
  }

  function tail(rig, pal, { pos, segments = 4, size = 0.18, curl = 0.35, up = 0.4 }) {
    let parent = group(rig.body, pos);
    rig.tail = parent;
    let s = size;
    for (let i = 0; i < segments; i++) {
      part(parent, sphere(s, s, s * 1.3, 14), toon(i === segments - 1 ? pal.second : pal.body), [0, 0, -s], [0, 0, 0], 0.02);
      const next = group(parent, [0, s * up, -s * 1.6], [-curl * 0.5, 0, 0]);
      parent = next;
      s *= 0.82;
    }
    rig.tailTip = parent;
  }

  function headWith(rig, parent, pal, { pos, size = 0.75, snout = 0, ears: earKind = 'none', r }) {
    const head = group(parent, pos);
    part(head, sphere(size, size * 0.92, size * 0.9), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
    if (snout) part(head, sphere(size * 0.45, size * 0.35, size * 0.45 * snout), toon(pal.belly), [0, -size * 0.28, size * 0.75], [0, 0, 0], 0.02);
    // cheek blush
    for (const s of [-1, 1]) part(head, sphere(size * 0.14, size * 0.08, size * 0.05, 8), toon('#ff8a9a'), [s * size * 0.55, -size * 0.25, size * 0.74], [0, s * 0.5, 0], 0);
    head.scale.setScalar(1);
    const eyeHolder = group(head);
    eyeHolder.scale.setScalar(size / 0.75);
    rig.eyes = eyes(eyeHolder, { y: 0.05, z: 0.62, spread: 0.32, size: 0.24, glowColor: rig.glowEyes });
    rig.ears = ears(eyeHolder, earKind, toon(pal.body), r);
    rig.head = head;
    return head;
  }

  const PLANS = {
    blob(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.95, 0]);
      part(rig.body, sphere(0.95, 0.85, 0.9), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.035);
      part(rig.body, sphere(0.62, 0.5, 0.3), toon(pal.belly), [0, -0.15, 0.68], [0, 0, 0], 0.02);
      for (const s of [-1, 1]) {
        const g = group(rig.body, [s * 0.45, -0.8, 0.2]);
        part(g, sphere(0.26, 0.15, 0.32), toon(pal.dark), [0, 0, 0], [0, 0, 0], 0.02);
        g.userData.phase = s > 0 ? Math.PI : 0;
        rig.legs.push(g);
      }
      rig.head = group(rig.body, [0, 0.25, 0.05]);
      const eh = group(rig.head);
      rig.eyes = eyes(eh, { y: 0.0, z: 0.78, spread: 0.32, size: 0.24, glowColor: rig.glowEyes });
      rig.ears = ears(eh, r.pick(['round', 'pointy', 'none']), toon(pal.body), r);
    },
    brute(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 1.15, 0]);
      part(rig.body, sphere(0.85, 0.9, 0.7), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.035);
      part(rig.body, sphere(0.55, 0.6, 0.3), toon(pal.belly), [0, -0.1, 0.5], [0, 0, 0], 0.02);
      arms(rig, pal, { len: 0.75, width: 0.2, spread: 0.85, y: 0.35 });
      legs2(rig, pal, { len: 0.55, width: 0.22, spread: 0.4, y: -0.6 });
      headWith(rig, rig.body, pal, { pos: [0, 0.95, 0.15], size: 0.55, snout: 0.8, ears: 'round', r });
    },
    dragon(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.95, 0]);
      part(rig.body, sphere(0.62, 0.55, 0.85), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      part(rig.body, sphere(0.42, 0.35, 0.65), toon(pal.belly), [0, -0.22, 0.12], [0, 0, 0], 0.02);
      legs4(rig, pal, { len: 0.45, width: 0.15, spread: 0.4, front: 0.45, back: -0.4, y: -0.25 });
      const neck = group(rig.body, [0, 0.35, 0.55], [-0.5, 0, 0]);
      part(neck, capsule(0.2, 0.35), toon(pal.body), [0, 0.2, 0], [0, 0, 0], 0.02);
      headWith(rig, neck, pal, { pos: [0, 0.6, 0.1], size: 0.5, snout: 1.2, ears: 'none', r });
      rig.head.rotation.x = 0.5;
      for (const s of [-1, 1]) part(rig.head, cone(0.08, 0.4, 6), toon(pal.belly), [s * 0.25, 0.45, -0.15], [-0.6, 0, -s * 0.3], 0.012);
      tail(rig, pal, { pos: [0, 0.05, -0.7], segments: 5, size: 0.22, curl: 0.25, up: 0.2 });
      if (r.chance(0.6)) { wing(rig.body, -1, 0.7, pal.second, rig, false); wing(rig.body, 1, 0.7, pal.second, rig, false); }
    },
    flier(rig, pal, r) {
      rig.float = 0.55;
      rig.body = group(rig.pivot, [0, 1.0, 0]);
      part(rig.body, sphere(0.6, 0.62, 0.7), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      part(rig.body, sphere(0.42, 0.45, 0.3), toon(pal.belly), [0, -0.1, 0.42], [0, 0, 0], 0.02);
      headWith(rig, rig.body, pal, { pos: [0, 0.65, 0.2], size: 0.48, ears: 'none', r });
      part(rig.head, cone(0.13, 0.35, 8), toon('#ffb300'), [0, -0.08, 0.5], [Math.PI / 2, 0, 0], 0.015);
      part(rig.head, sphere(0.12, 0.25, 0.08, 8), toon(pal.second), [0, 0.45, -0.05], [-0.4, 0, 0], 0.012);
      wing(rig.body, -1, 1.05, pal.second, rig);
      wing(rig.body, 1, 1.05, pal.second, rig);
      for (let i = -1; i <= 1; i++) part(rig.body, sphere(0.1, 0.04, 0.4, 10), toon(pal.second), [i * 0.12, 0.05, -0.75], [0.3, i * 0.3, 0], 0.012);
      legs2(rig, pal, { len: 0.25, width: 0.07, spread: 0.2, y: -0.55 });
    },
    grub(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.5, 0]);
      const n = 4;
      for (let i = 0; i < n; i++) {
        const s = 0.5 - i * 0.06;
        const seg = part(rig.body, sphere(s, s * 0.9, s * 0.85), toon(i % 2 ? pal.body : pal.second), [0, 0, -i * 0.55], [0, 0, 0], 0.03);
        seg.userData.seg = i;
        for (const side of [-1, 1]) {
          const g = group(rig.body, [side * s * 0.8, -s * 0.6, -i * 0.55]);
          part(g, capsule(0.05, 0.12), toon(pal.dark), [0, -0.05, 0], [0, 0, side * 0.6], 0.01);
          g.userData.phase = i + (side > 0 ? Math.PI : 0);
          rig.legs.push(g);
        }
      }
      headWith(rig, rig.body, pal, { pos: [0, 0.25, 0.55], size: 0.55, ears: 'none', r });
      for (const s of [-1, 1]) {
        part(rig.head, new THREE.CylinderGeometry(0.02, 0.03, 0.5, 5), toon(pal.dark), [s * 0.2, 0.6, 0], [0, 0, -s * 0.3], 0.01);
        part(rig.head, sphere(0.07, 0.07, 0.07, 8), toon(pal.second), [s * 0.28, 0.85, 0], [0, 0, 0], 0.01);
      }
      rig.tailTip = group(rig.body, [0, 0.2, -1.8]);
    },
    humanoid(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 1.15, 0]);
      part(rig.body, capsule(0.42, 0.5), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      part(rig.body, sphere(0.3, 0.4, 0.18), toon(pal.belly), [0, -0.05, 0.33], [0, 0, 0], 0.02);
      arms(rig, pal, { len: 0.55, width: 0.13, spread: 0.52, y: 0.3 });
      legs2(rig, pal, { len: 0.55, width: 0.16, spread: 0.22, y: -0.6 });
      headWith(rig, rig.body, pal, { pos: [0, 0.95, 0.05], size: 0.55, snout: 0.6, ears: r.pick(['round', 'pointy']), r });
    },
    hunter(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.85, 0]);
      part(rig.body, sphere(0.5, 0.45, 0.78), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      part(rig.body, sphere(0.35, 0.3, 0.6), toon(pal.belly), [0, -0.18, 0.1], [0, 0, 0], 0.02);
      legs4(rig, pal, { len: 0.45, width: 0.13, spread: 0.3, front: 0.45, back: -0.45, y: -0.2 });
      headWith(rig, rig.body, pal, { pos: [0, 0.55, 0.65], size: 0.55, snout: 0.9, ears: 'pointy', r });
      tail(rig, pal, { pos: [0, 0.2, -0.7], segments: 5, size: 0.14, curl: 0.4, up: 0.6 });
    },
    landrace(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 1.1, 0]);
      part(rig.body, sphere(0.55, 0.48, 0.85), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      legs4(rig, pal, { len: 0.7, width: 0.12, spread: 0.32, front: 0.5, back: -0.5, y: -0.25 });
      const neck = group(rig.body, [0, 0.3, 0.6], [-0.7, 0, 0]);
      part(neck, capsule(0.18, 0.45), toon(pal.body), [0, 0.25, 0], [0, 0, 0], 0.02);
      headWith(rig, neck, pal, { pos: [0, 0.7, 0.05], size: 0.45, snout: 1.1, ears: 'long', r });
      rig.head.rotation.x = 0.7;
      tail(rig, pal, { pos: [0, 0.2, -0.8], segments: 3, size: 0.12, curl: -0.3, up: -0.4 });
    },
    leviathan(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.8, 0]);
      part(rig.body, sphere(0.85, 0.7, 1.05), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.035);
      part(rig.body, sphere(0.6, 0.4, 0.85), toon(pal.belly), [0, -0.38, 0.1], [0, 0, 0], 0.02);
      for (const s of [-1, 1]) {
        const g = group(rig.body, [s * 0.8, -0.35, 0.3]);
        part(g, sphere(0.45, 0.08, 0.25, 12).translate(s * 0.35, 0, 0), toon(pal.second), [0, 0, 0], [0, 0, s * -0.3], 0.015);
        g.userData.phase = s > 0 ? Math.PI : 0;
        rig.legs.push(g);
      }
      const eh = group(rig.body, [0, 0.25, 0.25]);
      rig.head = eh;
      rig.eyes = eyes(eh, { y: 0.0, z: 0.75, spread: 0.45, size: 0.22, glowColor: rig.glowEyes });
      tail(rig, pal, { pos: [0, 0.0, -0.9], segments: 3, size: 0.3, curl: -0.2, up: 0.1 });
      part(rig.tailTip, sphere(0.55, 0.06, 0.25, 12), toon(pal.second), [0, 0, -0.1], [0, 0, 0], 0.015);
    },
    piscine(rig, pal, r) {
      rig.float = 0.7;
      rig.body = group(rig.pivot, [0, 0.9, 0]);
      part(rig.body, sphere(0.45, 0.6, 0.8), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      part(rig.body, sphere(0.3, 0.38, 0.55), toon(pal.belly), [0, -0.22, 0.12], [0, 0, 0], 0.02);
      part(rig.body, sphere(0.05, 0.45, 0.45, 12), toon(pal.second), [0, 0.5, -0.1], [0.3, 0, 0], 0.015);
      const t = group(rig.body, [0, 0, -0.8]);
      rig.tail = t;
      part(t, sphere(0.05, 0.5, 0.35, 12), toon(pal.second), [0, 0, -0.25], [0, 0, 0], 0.015);
      for (const s of [-1, 1]) {
        const g = group(rig.body, [s * 0.4, -0.1, 0.2]);
        part(g, sphere(0.3, 0.05, 0.18, 10).translate(s * 0.2, 0, 0), toon(pal.second), [0, 0, 0], [0, 0, 0], 0.012);
        g.userData.phase = s > 0 ? Math.PI : 0;
        rig.legs.push(g);
      }
      const eh = group(rig.body, [0, 0.12, 0.25]);
      rig.head = eh;
      rig.eyes = eyes(eh, { y: 0.0, z: 0.5, spread: 0.32, size: 0.2, glowColor: rig.glowEyes });
      rig.tailTip = t;
    },
    polliwog(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.7, 0]);
      part(rig.body, sphere(0.72, 0.6, 0.7), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      part(rig.body, sphere(0.5, 0.35, 0.3), toon(pal.belly), [0, -0.2, 0.48], [0, 0, 0], 0.02);
      const eh = group(rig.body, [0, 0.15, 0.1]);
      rig.head = eh;
      rig.eyes = eyes(eh, { y: 0.15, z: 0.6, spread: 0.36, size: 0.24, glowColor: rig.glowEyes });
      // axolotl gills
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
        part(eh, sphere(0.05, 0.22, 0.05, 8), toon('#ff8fb1'), [s * 0.7, 0.2 + i * 0.12, -0.1], [0, 0, -s * (0.9 + i * 0.35)], 0.01);
      }
      legs4(rig, pal, { len: 0.2, width: 0.1, spread: 0.5, front: 0.3, back: -0.3, y: -0.45 });
      tail(rig, pal, { pos: [0, 0.0, -0.65], segments: 4, size: 0.2, curl: 0.05, up: 0.05 });
    },
    serpent(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.35, 0]);
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = i * 0.9;
        const s = 0.32 - i * 0.025;
        part(rig.body, sphere(s, s, s), toon(i % 2 ? pal.body : pal.second), [Math.sin(a) * 0.45, 0, -i * 0.38 + 0.6], [0, 0, 0], 0.025);
      }
      const neck = group(rig.body, [0, 0.0, 0.75]);
      part(neck, capsule(0.24, 0.5), toon(pal.body), [0, 0.4, 0], [0, 0, 0], 0.025);
      headWith(rig, neck, pal, { pos: [0, 0.95, 0.1], size: 0.48, snout: 0.8, ears: 'none', r });
      part(rig.head, sphere(0.75, 0.6, 0.08, 14), toon(pal.second), [0, 0.0, -0.3], [0, 0, 0], 0.015);
      rig.tailTip = group(rig.body, [Math.sin(6 * 0.9) * 0.45, 0.1, -1.8]);
    },
    sprite(rig, pal, r) {
      rig.float = 0.65;
      rig.body = group(rig.pivot, [0, 0.9, 0]);
      part(rig.body, sphere(0.55, 0.55, 0.5), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      headWith(rig, rig.body, pal, { pos: [0, 0.55, 0.05], size: 0.6, ears: r.pick(['pointy', 'long', 'round']), r });
      for (const s of [-1, 1]) {
        const g = group(rig.body, [s * 0.35, 0.3, -0.35]);
        part(g, sphere(0.45, 0.04, 0.25, 12).translate(s * 0.4, 0.15, 0), new THREE.MeshToonMaterial({ color: pal.belly, gradientMap: TX.engine.toonMap(), transparent: true, opacity: 0.7 }), [0, 0, 0], [0, 0, s * 0.4], 0.01);
        g.userData.side = s;
        rig.wings.push(g);
      }
      arms(rig, pal, { len: 0.22, width: 0.09, spread: 0.45, y: 0.0 });
    },
    varmint(rig, pal, r) {
      rig.body = group(rig.pivot, [0, 0.6, 0]);
      part(rig.body, sphere(0.55, 0.5, 0.65), toon(pal.body), [0, 0, 0], [0, 0, 0], 0.03);
      part(rig.body, sphere(0.38, 0.35, 0.35), toon(pal.belly), [0, -0.12, 0.35], [0, 0, 0], 0.02);
      legs4(rig, pal, { len: 0.18, width: 0.11, spread: 0.3, front: 0.35, back: -0.35, y: -0.38 });
      headWith(rig, rig.body, pal, { pos: [0, 0.5, 0.45], size: 0.55, snout: 0.7, ears: r.pick(['round', 'long', 'pointy']), r });
      tail(rig, pal, { pos: [0, 0.1, -0.55], segments: 4, size: 0.16, curl: 0.6, up: 0.8 });
    },
  };

  // ---- build -----------------------------------------------------------------------------
  function build(slug) {
    const sp = D.species[slug];
    const types = sp ? sp.types : ['normal'];
    const shape = sp && PLANS[sp.shape] ? sp.shape : 'blob';
    const r = U.rng(slug);
    const pal = palette(slug, types);
    const rig = newRig();
    rig.glowEyes = types.includes('shadow') ? '#d1a3ff' : null;
    PLANS[shape](rig, pal, r);
    if (!rig.head) rig.head = rig.body;
    decorate(types, rig, pal, 1, r);

    // normalise height by evolution stage
    const stage = stageOf(slug);
    const target = [1.35, 1.8, 2.3][Math.min(stage, 2)];
    rig.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(rig.pivot);
    const h = box.max.y - box.min.y;
    const k = target / h;
    rig.pivot.scale.setScalar(k);
    rig.pivot.position.y = -box.min.y * k + rig.float * k * 0.5;
    rig.baseY = rig.pivot.position.y;
    rig.height = target;
    rig.radius = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * k * 0.5;
    rig.phase = r.range(0, 10);
    rig.slug = slug;
    rig.types = types;
    rig.palette = pal;
    rig.root.userData.rig = rig;
    return rig;
  }

  // idle animation; mood: 'idle' | 'walk' | 'happy'
  function animate(rig, time, mood = 'idle') {
    const t = time + rig.phase;
    const speed = mood === 'walk' ? 9 : mood === 'happy' ? 6 : 2.2;
    const breath = Math.sin(t * speed * 0.5);
    rig.pivot.position.y = rig.baseY + (rig.float ? Math.sin(t * 2) * 0.12 : Math.max(0, Math.sin(t * speed)) * (mood === 'idle' ? 0.02 : 0.08));
    if (rig.body) {
      rig.body.scale.set(1 + breath * 0.02, 1 - breath * 0.02, 1 + breath * 0.02);
    }
    if (rig.head && rig.head !== rig.body) {
      rig.head.rotation.z = Math.sin(t * 0.9) * 0.06;
      rig.head.rotation.y = Math.sin(t * 0.6) * 0.12;
    }
    rig.legs.forEach((l) => {
      l.rotation.x = Math.sin(t * speed + (l.userData.phase || 0)) * (mood === 'walk' ? 0.6 : 0.08);
    });
    rig.arms.forEach((a) => {
      a.rotation.x = Math.sin(t * speed * 0.6 + (a.userData.side > 0 ? Math.PI : 0)) * (mood === 'idle' ? 0.12 : 0.5);
    });
    rig.wings.forEach((w) => {
      const s = w.userData.side || 1;
      w.rotation.z = s * Math.sin(t * (rig.float ? 10 : 3)) * (rig.float ? 0.55 : 0.18);
    });
    if (rig.tail) {
      rig.tail.rotation.y = Math.sin(t * 2.5) * 0.35;
    }
    rig.ears.forEach((e) => {
      e.rotation.x = Math.sin(t * 1.3 + e.userData.side) * 0.08;
    });
    rig.flames.forEach((f, i) => {
      const k = 1 + Math.sin(t * 18 + i) * 0.08 + Math.sin(t * 31 + i * 2) * 0.05;
      f.scale.set(1 / Math.sqrt(k), k, 1 / Math.sqrt(k));
    });
    if (rig.orbit) rig.orbit.rotation.y = t * 1.5;
    if (rig.wisps) rig.wisps.rotation.y = -t * 1.1;
    // blink
    const blink = (t % 4.3) < 0.12 ? 0.1 : 1;
    rig.eyes.forEach((e) => (e.g.scale.y = blink));
  }

  // ---- portraits (cached data URLs) ------------------------------------------------------
  let pr = null;
  const portraitCache = {};
  function portrait(slug) {
    if (portraitCache[slug]) return portraitCache[slug];
    if (!pr) {
      const canvas = document.createElement('canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setSize(256, 256, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.6));
      const dl = new THREE.DirectionalLight(0xffffff, 2.2);
      dl.position.set(2, 4, 5);
      scene.add(dl);
      const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      pr = { renderer, scene, cam, canvas };
    }
    const rig = build(slug);
    animate(rig, 0);
    rig.root.rotation.y = 0.45;
    pr.scene.add(rig.root);
    const h = rig.height;
    pr.cam.position.set(0, h * 0.62, h * 3.1);
    pr.cam.lookAt(0, h * 0.48, 0);
    pr.renderer.render(pr.scene, pr.cam);
    const url = pr.canvas.toDataURL('image/png');
    pr.scene.remove(rig.root);
    portraitCache[slug] = url;
    return url;
  }

  return { build, animate, portrait, stageOf };
})();
