// 3D battles: arena scene, cinematic camera, technique VFX, turn flow, catching.
'use strict';

TX.battle = (() => {
  const U = TX.util;
  const { $, el } = U;
  const M = () => TX.mon;

  let POS, CAM_BASE, cam; // created lazily: THREE loads after this script
  function initConsts() {
    if (POS) return;
    POS = {
      player: new THREE.Vector3(-1.9, 0, 1.7),
      enemy: new THREE.Vector3(2.1, 0, -1.9),
      trainerP: new THREE.Vector3(-3.6, 0, 3.6),
      trainerE: new THREE.Vector3(4.0, 0, -3.8),
    };
    CAM_BASE = { pos: new THREE.Vector3(-4.9, 2.7, 6.3), look: new THREE.Vector3(0.6, 0.95, -0.5) };
    cam = { pos: new THREE.Vector3(), look: new THREE.Vector3(), shake: 0, t: 0 };
  }

  let S = null; // scene bundle

  function arenaTexture() {
    const noise = U.makeNoise(11);
    return TX.engine.canvasTexture(1024, 1024, (g, w, h) => {
      const img = g.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const n = noise.fbm(x / 60, y / 60);
        const i = (y * w + x) * 4;
        img.data[i] = 60 + n * 50;
        img.data[i + 1] = 110 + n * 70;
        img.data[i + 2] = 45 + n * 30;
        img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      for (const [cx, cy] of [[0.36, 0.64], [0.66, 0.34]]) {
        const grd = g.createRadialGradient(cx * w, cy * h, 10, cx * w, cy * h, 150);
        grd.addColorStop(0, 'rgba(206,176,120,0.95)');
        grd.addColorStop(0.75, 'rgba(190,160,105,0.6)');
        grd.addColorStop(1, 'rgba(190,160,105,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, w, h);
      }
    });
  }

  function buildScene() {
    initConsts();
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcfdcea, 18, 70);
    const rig = TX.engine.lightingRig(scene, { shadowSize: 2048, shadowExtent: 9 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: arenaTexture(), roughness: 1 }));
    ground.material.map.repeat.set(1, 1);
    ground.receiveShadow = true;
    scene.add(ground);
    // tuxeball-style platform rings
    for (const p of [POS.player, POS.enemy]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.42, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
      ring.position.set(p.x, 0.02, p.z);
      scene.add(ring);
    }
    const r = U.rng('arena');
    const envs = {};
    const mk = (name) => { const g = new THREE.Group(); scene.add(g); envs[name] = g; return g; };
    const leafMat = TX.engine.addWind(new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true }), { sway: 0.05, height: 0.4 });
    const trunk = (g, x, z, s, pine) => {
      const t = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.22 * s, 1.4 * s, 7), new THREE.MeshStandardMaterial({ color: '#6d4c33' }));
      tr.position.y = 0.7 * s;
      tr.castShadow = true;
      t.add(tr);
      const col = new THREE.Color(pine ? '#2e7d4f' : '#4caf50').offsetHSL(r.range(-0.03, 0.03), 0, r.range(-0.06, 0.06));
      for (let i = 0; i < 3; i++) {
        const geo = pine ? new THREE.ConeGeometry((1.1 - i * 0.28) * s, 1.3 * s, 8) : new THREE.IcosahedronGeometry((0.9 - i * 0.15) * s, 1);
        const cg = geo.toNonIndexed();
        const cols = [];
        const c2 = col.clone().offsetHSL(0, 0, i * 0.05);
        for (let k = 0; k < cg.attributes.position.count; k++) cols.push(c2.r, c2.g, c2.b);
        cg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
        cg.computeVertexNormals();
        const f = new THREE.Mesh(cg, leafMat);
        f.position.set(pine ? 0 : r.range(-0.3, 0.3) * s, (pine ? 1.4 + i * 0.6 : 1.8 + i * 0.4) * s, pine ? 0 : r.range(-0.3, 0.3) * s);
        f.castShadow = true;
        t.add(f);
      }
      t.position.set(x, 0, z);
      g.add(t);
    };
    const ringTrees = (g, n, pineK, rMin, rMax) => {
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, d = r.range(rMin, rMax);
        const x = Math.cos(a) * d, z = Math.sin(a) * d;
        if (z > 3 && Math.abs(x + 3) < 7) continue; // keep the camera's view open
        trunk(g, x, z, r.range(1, 1.8), r() < pineK);
      }
    };
    // meadow
    const meadow = mk('Route 1');
    ringTrees(meadow, 46, 0.2, 11, 26);
    // lake
    const lake = mk('Mirror Lake');
    ringTrees(lake, 26, 0.3, 14, 28);
    const water = new THREE.Mesh(new THREE.CircleGeometry(30, 48, Math.PI * 1.05, Math.PI * 0.9).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2f8fd8', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.9 }));
    water.position.set(5, 0.03, -6);
    lake.add(water);
    // woods
    const woods = mk('Whispering Woods');
    ringTrees(woods, 70, 0.8, 8.5, 26);
    // shrine
    const shrine = mk("Warden's Shrine");
    ringTrees(shrine, 34, 0.85, 13, 26);
    const stone = new THREE.MeshStandardMaterial({ color: '#d7ccc8', roughness: 0.7 });
    const crystalMat = new THREE.MeshStandardMaterial({ color: '#b388ff', emissive: '#7c4dff', emissiveIntensity: 1.4, flatShading: true });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      if (Math.sin(a) > 0.5 && Math.cos(a) < 0) continue;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 3.4, 10), stone);
      c.position.set(Math.cos(a) * 8, 1.7, Math.sin(a) * 8);
      c.castShadow = true;
      shrine.add(c);
      const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0).scale(1, 1.7, 1), crystalMat);
      cr.position.set(Math.cos(a) * 8, 3.9, Math.sin(a) * 8);
      shrine.add(cr);
    }
    const floor = new THREE.Mesh(new THREE.CircleGeometry(7.5, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#bcaaa4', roughness: 0.9 }));
    floor.position.y = 0.01;
    floor.receiveShadow = true;
    shrine.add(floor);
    // grass tufts everywhere (shared)
    const blade = new THREE.ConeGeometry(0.05, 0.6, 3).translate(0, 0.3, 0);
    const grassMat = TX.engine.addWind(new THREE.MeshStandardMaterial({ color: '#5aa83a', roughness: 0.9 }), { sway: 0.15, height: 1.5 });
    const n = 2600;
    const tufts = new THREE.InstancedMesh(blade, grassMat, n);
    const m4 = new THREE.Matrix4();
    let k = 0;
    for (let i = 0; i < n * 3 && k < n; i++) {
      const x = r.range(-14, 14), z = r.range(-14, 10);
      if (Math.hypot(x - POS.player.x, z - POS.player.z) < 1.6 || Math.hypot(x - POS.enemy.x, z - POS.enemy.z) < 1.6) continue;
      if (Math.hypot(x, z) < 3.2 && r() < 0.7) continue;
      m4.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-0.2, 0.2), r() * 6, r.range(-0.2, 0.2))), new THREE.Vector3(1, r.range(0.6, 1.4), 1));
      tufts.setMatrixAt(k, m4);
      tufts.setColorAt(k, new THREE.Color().setHSL(r.range(0.24, 0.3), 0.55, r.range(0.3, 0.5)));
      k++;
    }
    tufts.count = k;
    tufts.receiveShadow = true;
    scene.add(tufts);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    const fxAdd = new TX.engine.Particles(900, { color: 0xffffff, size: 0.5 });
    const fxNorm = new TX.engine.Particles(500, { color: 0xffffff, size: 0.6, additive: false });
    scene.add(fxAdd.points, fxNorm.points);
    const flashLight = new THREE.PointLight(0xffffff, 0, 12, 1.5);
    scene.add(flashLight);
    const holder = new THREE.Group();
    scene.add(holder);
    S = { scene, rig, camera, envs, fxAdd, fxNorm, flashLight, holder, ground, extras: [], tufts };
  }

  // ---- camera ----------------------------------------------------------------------------
  function camTo(pos, look, dur = 0.8) {
    const p0 = cam.pos.clone(), l0 = cam.look.clone();
    return U.tween(dur, (k) => {
      cam.pos.lerpVectors(p0, pos, k);
      cam.look.lerpVectors(l0, look, k);
    });
  }
  const camBase = (dur = 0.8) => camTo(CAM_BASE.pos, CAM_BASE.look, dur);
  function updateCamera(dt) {
    cam.t += dt;
    const sway = new THREE.Vector3(Math.sin(cam.t * 0.25) * 0.25, Math.sin(cam.t * 0.31) * 0.08, 0);
    S.camera.position.copy(cam.pos).add(sway);
    if (cam.shake > 0) {
      cam.shake = Math.max(0, cam.shake - dt * 2.5);
      S.camera.position.x += (Math.random() - 0.5) * cam.shake * 0.5;
      S.camera.position.y += (Math.random() - 0.5) * cam.shake * 0.5;
    }
    S.camera.lookAt(cam.look);
  }

  // ---- side objects --------------------------------------------------------------------------
  function sideObj(side) { return side === 'player' ? B.p : B.e; }

  function placeMon(side, slug) {
    const s = sideObj(side);
    if (s.rig) S.holder.remove(s.rig.root);
    const rig = TX.creatures.build(slug);
    const pos = side === 'player' ? POS.player : POS.enemy;
    const other = side === 'player' ? POS.enemy : POS.player;
    rig.root.position.copy(pos);
    rig.root.rotation.y = Math.atan2(other.x - pos.x, other.z - pos.z) + (side === 'player' ? -0.25 : 0.25);
    S.holder.add(rig.root);
    s.rig = rig;
    s.home = pos.clone();
    return rig;
  }

  function placeTrainer(side, style) {
    const c = TX.characters.build(TX.characters.STYLES[style]);
    const pos = side === 'player' ? POS.trainerP : POS.trainerE;
    const other = side === 'player' ? POS.enemy : POS.player;
    c.root.position.copy(pos);
    c.root.rotation.y = Math.atan2(other.x - pos.x, other.z - pos.z);
    c.root.scale.setScalar(1.25);
    S.holder.add(c.root);
    return c;
  }

  // ---- VFX ------------------------------------------------------------------------------------
  const FX = {
    fire: { colors: [0xff5a1f, 0xffa726], add: true, g: -1.5, rise: 1, light: 0xff7b29 },
    water: { colors: [0x29b6f6, 0xb3e5fc], add: false, g: 6, light: 0x4fc3f7 },
    wood: { colors: [0x66bb6a, 0xc5e1a5], add: false, g: 0.6, swirl: true, light: 0x9ccc65 },
    earth: { colors: [0x8d6e63, 0xd7ccc8], add: false, g: 9, fromSky: true, light: 0xffcc80 },
    metal: { colors: [0xffffff, 0xcfd8dc], add: true, g: 4, fast: true, light: 0xffffff },
    sky: { colors: [0xe1f5fe, 0xffffff], add: true, g: 0, swirl: true, ring: true, light: 0xe1f5fe },
    frost: { colors: [0x80deea, 0xffffff], add: true, g: 1.5, light: 0x80deea },
    lightning: { colors: [0xfff176, 0xffffff], add: true, g: 0, bolt: true, fast: true, light: 0xfff59d },
    shadow: { colors: [0x4a148c, 0x7e57c2], add: false, g: -0.8, rise: 1, light: 0x7c4dff },
    cosmic: { colors: [0xff80ff, 0xb388ff], add: true, g: 0, swirl: true, light: 0xea80fc },
    venom: { colors: [0xab47bc, 0xce93d8], add: false, g: -1, rise: 1, light: 0xce93d8 },
    normal: { colors: [0xfff8e1, 0xffffff], add: true, g: 2, light: 0xffffff },
    heroic: { colors: [0xff5252, 0xffd740], add: true, g: 2, light: 0xff8a80 },
  };

  function burst(type, at, count = 40, power = 1) {
    const f = FX[type] || FX.normal;
    const sys = f.add ? S.fxAdd : S.fxNorm;
    sys.mat.uniforms.uColor.value.set(f.colors[0]);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, el2 = Math.random() * Math.PI - Math.PI / 2;
      const sp = (f.fast ? 6 : 3) * power * (0.4 + Math.random());
      const p = {
        x: at.x, y: at.y, z: at.z,
        vx: Math.cos(a) * Math.cos(el2) * sp, vy: Math.abs(Math.sin(el2)) * sp * (f.rise ? 1.2 : 0.8) + (f.rise ? 1.5 : 0), vz: Math.sin(a) * Math.cos(el2) * sp,
        g: f.g, drag: 1.5, life: 0.5 + Math.random() * 0.7, size: (f.add ? 0.6 : 0.9) * (0.6 + Math.random()), grow: f.rise ? 1.5 : 0,
      };
      if (f.swirl) p.update = (q, d) => { const ang = d * 5; const x = q.vx; q.vx = x * Math.cos(ang) - q.vz * Math.sin(ang); q.vz = x * Math.sin(ang) + q.vz * Math.cos(ang); };
      if (f.fromSky) { p.x += (Math.random() - 0.5) * 1.8; p.z += (Math.random() - 0.5) * 1.8; p.y = at.y + 3 + Math.random() * 2; p.vx = p.vz = 0; p.vy = -2; p.life = 0.8; }
      sys.emit(p);
    }
    S.flashLight.color.set(f.light);
    S.flashLight.position.copy(at).add(new THREE.Vector3(0, 0.6, 0));
    U.tween(0.45, (k) => (S.flashLight.intensity = 40 * (1 - k)), (t) => t);
  }

  function trail(type, from, to, dur) {
    const f = FX[type] || FX.normal;
    const sys = f.add ? S.fxAdd : S.fxNorm;
    sys.mat.uniforms.uColor.value.set(f.colors[0]);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(f.colors[0]).multiplyScalar(3) }));
    S.scene.add(orb);
    const light = new THREE.PointLight(f.light, 25, 6, 1.6);
    orb.add(light);
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 1.2, 0));
    return U.tween(dur, (k) => {
      const a = from.clone().lerp(mid, k), b = mid.clone().lerp(to, k);
      orb.position.copy(a.lerp(b, k));
      for (let i = 0; i < 3; i++) sys.emit({ x: orb.position.x, y: orb.position.y, z: orb.position.z, vx: (Math.random() - 0.5), vy: (Math.random() - 0.5), vz: (Math.random() - 0.5), life: 0.4, size: 0.7, drag: 2 });
    }, (t) => t).then(() => {
      S.scene.remove(orb);
      orb.geometry.dispose();
    });
  }

  function bolt(at) {
    const pts = [];
    let p = at.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 7, (Math.random() - 0.5) * 2));
    for (let i = 0; i <= 10; i++) {
      const k = i / 10;
      pts.push(p.clone().lerp(at, k).add(new THREE.Vector3((Math.random() - 0.5) * 0.6 * (1 - k), 0, (Math.random() - 0.5) * 0.6 * (1 - k))));
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.06, 6);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff59d).multiplyScalar(4) }));
    S.scene.add(mesh);
    TX.engine.flash(0xfff9c4, 0.25, 0.5);
    return U.wait(0.18).then(() => { S.scene.remove(mesh); geo.dispose(); });
  }

  function ringWave(at, color) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.5), transparent: true }));
    ring.position.copy(at);
    S.scene.add(ring);
    return U.tween(0.5, (k) => { ring.scale.setScalar(1 + k * 3); ring.material.opacity = 1 - k; }).then(() => S.scene.remove(ring));
  }

  async function lunge(side) {
    const s = sideObj(side), o = sideObj(side === 'player' ? 'enemy' : 'player');
    const from = s.home.clone(), to = from.clone().lerp(o.home, 0.62);
    await U.tween(0.18, (k) => s.rig.root.position.lerpVectors(from, to, k), U.easeOut);
    const back = U.tween(0.3, (k) => s.rig.root.position.lerpVectors(to, from, k));
    return back;
  }

  async function playTechniqueFx(fx) {
    const side = fx.user === B.pb ? 'player' : 'enemy';
    const s = sideObj(side), o = sideObj(side === 'player' ? 'enemy' : 'player');
    const type = fx.types[0] || 'normal';
    const t = M().tech(fx.slug);
    const damaging = t.effects.some((e) => e[0] === 'damage' || e[0] === 'multiattack');
    const userAt = s.rig.root.position.clone().add(new THREE.Vector3(0, s.rig.height * 0.55, 0));
    const tgtAt = o.rig.root.position.clone().add(new THREE.Vector3(0, o.rig.height * 0.5, 0));
    const sfx = { fire: 'fire', water: 'water', lightning: 'zap', sky: 'wind', frost: 'wind' }[type] || 'hit';
    if (!damaging) {
      // self buff / status move: glow around the user or target
      const target = t.effects.some((e) => e[1] === 'enemy_monster' || e[2] === 'enemy_monster') ? tgtAt : userAt;
      TX.audio.sfx('heal');
      burst(type, target, 50, 0.6);
      await ringWave(target.clone().setY(0.1), (FX[type] || FX.normal).colors[0]);
      return;
    }
    // camera punch-in
    const mid = userAt.clone().lerp(tgtAt, 0.5);
    camTo(CAM_BASE.pos.clone().lerp(mid, 0.25).add(new THREE.Vector3(0, 0.2, 0)), CAM_BASE.look.clone().lerp(tgtAt, 0.35), 0.35);
    if (fx.range === 'melee' || fx.range === 'touch') {
      const back = await lunge(side);
      TX.audio.sfx(sfx);
      burst(type, tgtAt, 45, 1);
      await back;
    } else {
      // charge-up
      burst(type, userAt, 18, 0.4);
      TX.audio.sfx(sfx);
      if ((FX[type] || {}).bolt) await bolt(tgtAt);
      else if ((FX[type] || {}).fromSky) { burst(type, tgtAt, 30, 1); await U.wait(0.45); }
      else await trail(type, userAt, tgtAt, 0.45);
      burst(type, tgtAt, 55, 1.1);
      if ((FX[type] || {}).ring) ringWave(tgtAt, 0xffffff);
    }
  }

  async function hitReact(side, amount, mult, crit) {
    const s = sideObj(side);
    cam.shake = crit || mult > 1 ? 1.1 : 0.5;
    TX.audio.sfx(crit ? 'crit' : mult < 1 ? 'weak' : 'hit');
    if (mult > 1 || crit) TX.engine.flash(0xffffff, 0.2, 0.25);
    floatText(side, '-' + amount, mult > 1 ? 'big' : mult < 1 ? 'small' : '');
    const root = s.rig.root, home = s.home;
    await U.tween(0.35, (k) => {
      root.position.x = home.x + Math.sin(k * 40) * 0.12 * (1 - k);
      root.scale.set(1 + Math.sin(k * Math.PI) * 0.12, 1 - Math.sin(k * Math.PI) * 0.12, 1 + Math.sin(k * Math.PI) * 0.12);
    }, (t) => t);
    root.position.copy(home);
    root.scale.setScalar(1);
  }

  function floatText(side, text, cls) {
    const s = sideObj(side);
    const p = s.rig.root.position.clone().add(new THREE.Vector3(0, s.rig.height + 0.3, 0));
    p.project(S.camera);
    const d = el('div', 'float-num ' + cls, text);
    d.style.left = ((p.x * 0.5 + 0.5) * window.innerWidth) + 'px';
    d.style.top = ((-p.y * 0.5 + 0.5) * window.innerHeight) + 'px';
    $('battle').appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  async function faintAnim(side) {
    const s = sideObj(side);
    TX.audio.sfx('faint');
    const root = s.rig.root;
    burst('shadow', root.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 30, 0.5);
    await U.tween(0.7, (k) => {
      root.position.y = -k * 0.6;
      root.rotation.z = (side === 'player' ? 1 : -1) * k * 0.6;
      root.scale.setScalar(1 - k * 0.6);
    });
    S.holder.remove(root);
    s.rig = null;
  }

  // ball mesh
  function ballMesh() {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e53950', roughness: 0.3 }));
    const bot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#fafafa', roughness: 0.3 }));
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 24).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#222' }));
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff', emissiveIntensity: 0.5 }));
    btn.position.z = 0.2;
    g.add(top, bot, band, btn);
    g.traverse((o) => (o.castShadow = true));
    return g;
  }

  async function throwBall(from, to, spin = true) {
    const ball = ballMesh();
    S.scene.add(ball);
    TX.audio.sfx('throw');
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 2.2, 0));
    await U.tween(0.65, (k) => {
      const a = from.clone().lerp(mid, k), b = mid.clone().lerp(to, k);
      ball.position.copy(a.lerp(b, k));
      if (spin) ball.rotation.x += 0.4;
    }, (t) => t);
    return ball;
  }

  async function sendOut(side, mon, fromTrainer = true) {
    const pos = side === 'player' ? POS.player : POS.enemy;
    const tpos = side === 'player' ? POS.trainerP : POS.trainerE;
    if (fromTrainer) {
      const ball = await throwBall(tpos.clone().add(new THREE.Vector3(0, 1.4, 0)), pos.clone().add(new THREE.Vector3(0, 0.4, 0)));
      S.scene.remove(ball);
    }
    const rig = placeMon(side, mon.slug);
    burst(D().species[mon.slug].types[0], pos.clone().add(new THREE.Vector3(0, 0.6, 0)), 50, 0.8);
    TX.engine.flash(0xffffff, 0.25, 0.35);
    await U.tween(0.45, (k) => rig.root.scale.setScalar(k), U.easeOutBack);
    rig.root.scale.setScalar(1);
    renderPlates();
  }
  const D = () => window.TX_DATA;

  // ---- HUD ---------------------------------------------------------------------------------------
  function plateHtml(b, side) {
    const m = b.m;
    const sp = D().species[m.slug];
    const mh = M().maxHp(m);
    const k = m.hp / mh;
    const col = k > 0.5 ? 'var(--hp-good)' : k > 0.2 ? 'var(--hp-mid)' : 'var(--hp-low)';
    const caught = side === 'enemy' && B.state.caught[m.slug] ? '<span class="caught-dot" title="Caught">&#9679;</span>' : '';
    let xp = '';
    if (side === 'player') {
      const cur = M().expFor(m.level), nxt = M().expFor(m.level + 1);
      xp = `<div class="xpbar"><div class="xpfill" style="width:${U.clamp(((m.exp - cur) / (nxt - cur)) * 100, 0, 100).toFixed(1)}%"></div></div>`;
    }
    return `<div class="plate-top"><b>${M().displayName(m)}</b>${caught}<span class="lv">Lv ${m.level}</span></div>
      <div class="plate-types">${TX.ui.typeChips(sp.types)} ${TX.ui.statusChip(m)}</div>
      <div class="hpbar"><div class="hpfill" style="width:${(k * 100).toFixed(1)}%;background:${col}"></div></div>
      ${side === 'player' ? `<div class="mc-hp">${m.hp} / ${mh}</div>` : ''}${xp}`;
  }
  function renderPlates() {
    if (B.pb) $('plate-player').innerHTML = plateHtml(B.pb, 'player');
    if (B.eb) $('plate-enemy').innerHTML = plateHtml(B.eb, 'enemy');
    $('plate-player').hidden = !B.pb || !B.p.rig;
    $('plate-enemy').hidden = !B.eb || !B.e.rig;
  }
  // animate HP from old value to the current one
  async function animateHp(b, from) {
    const m = b.m, to = m.hp;
    await U.tween(0.5, (k) => {
      m.hp = Math.round(U.lerp(from, to, k));
      renderPlates();
    });
    m.hp = to;
    renderPlates();
  }

  function log(text, minWait = 0.9) {
    $('battle-log').textContent = text;
    return new Promise((resolve) => {
      let t = 0;
      const h = {
        tick(dt) { t += dt; if (t > minWait + text.length * 0.018) done(); },
        onInput(a) { if (a === 'ok' && t > 0.2) done(); },
      };
      let fin = false;
      const done = () => { if (fin) return; fin = true; TX.ui.pop(h); resolve(); };
      TX.ui.push(h);
    });
  }

  // ---- battle state ----------------------------------------------------------------------------------
  let B = null;

  async function start({ state, wild = null, trainer = null, env = 'Route 1', time = 0.5 }) {
    if (!S) buildScene();
    for (const [name, g] of Object.entries(S.envs)) g.visible = name === env || (!S.envs[env] && name === 'Route 1');
    S.holder.clear();
    TX.engine.applyDay(S.rig, time, new THREE.Vector3(0, 0, 0));
    S.ground.material.color.set(env === "Warden's Shrine" ? '#d7ccc8' : '#ffffff');
    B = {
      state, wild, trainer, env, done: false, result: null,
      p: { rig: null }, e: { rig: null }, pb: null, eb: null,
      enemyTeam: trainer ? trainer.team : [wild], enemyIdx: 0,
      participants: new Set(), evolutions: [], time,
    };
    $('battle').hidden = false;
    $('battle-menu').hidden = true;
    $('plate-player').hidden = $('plate-enemy').hidden = true;
    TX.audio.play(trainer && trainer.boss ? 'battle' : 'battle');
    const first = state.party.findIndex((m) => m.hp > 0);
    B.pb = M().battler(state.party[first]);
    B.participants.add(state.party[first].uid);
    B.eb = M().battler(B.enemyTeam[0]);
    state.seen[B.eb.m.slug] = true;

    // intro
    const pc = placeTrainer('player', 'player');
    let ec = null;
    cam.pos.set(POS.enemy.x + 2.5, 1.3, POS.enemy.z + 4.2);
    cam.look.copy(POS.enemy).add(new THREE.Vector3(0, 1, 0));
    if (trainer) {
      ec = placeTrainer('enemy', trainer.style);
      await TX.ui.fade(0, 0.5);
      await log(`${trainer.name} wants to battle!`);
      await log(`${trainer.name} sent out ${M().displayName(B.eb.m)}!`, 0.4);
      await sendOut('enemy', B.eb.m, true);
    } else {
      placeMon('enemy', B.eb.m.slug);
      B.e.rig.root.scale.setScalar(0.01);
      await TX.ui.fade(0, 0.5);
      burst('wood', POS.enemy.clone().add(new THREE.Vector3(0, 0.3, 0)), 40, 0.7);
      await U.tween(0.5, (k) => B.e.rig.root.scale.setScalar(k), U.easeOutBack);
      renderPlates();
      await log(`A wild ${M().displayName(B.eb.m)} appeared!`);
    }
    await camBase(1.1);
    await log(`Go, ${M().displayName(B.pb.m)}!`, 0.3);
    await sendOut('player', B.pb.m, true);
    S.holder.remove(pc.root);
    if (ec) S.holder.remove(ec.root);

    while (!B.done) await turn();
    $('battle-menu').hidden = true;
    $('battle').hidden = true;
    return { result: B.result, evolutions: B.evolutions };
  }

  async function chooseAction() {
    $('battle-log').textContent = `What will ${M().displayName(B.pb.m)} do?`;
    const menu = $('battle-menu');
    menu.hidden = false;
    for (;;) {
      const a = await TX.ui.choose([
        { label: 'Fight', value: 'fight', cls: 'act fight' },
        { label: 'Bag', value: 'bag', cls: 'act bag' },
        { label: 'Tuxemon', value: 'party', cls: 'act party' },
        { label: 'Run', value: 'run', cls: 'act run' },
      ], { container: menu, cancel: false, columns: 2, cls: 'actions' });
      if (a === 'fight') {
        const moves = B.pb.m.moves;
        const opts = moves.map((mv) => {
          const t = M().tech(mv.slug);
          const ty = t.types[0] || 'normal';
          const mult = M().typeMult(t.types, B.eb.m.slug);
          const hint = t.effects.some((e) => e[0] === 'damage') ? (mult > 1 ? '<em class="eff up">Super effective</em>' : mult < 1 ? '<em class="eff down">Not very effective</em>' : '') : '<em class="eff">Effect</em>';
          return {
            html: `<span class="mv-name">${M().techName(mv.slug)}</span><span class="chip" style="--c:${U.ELEMENT[ty].color}">${U.ELEMENT[ty].label}</span><span class="mv-meta">${t.power ? 'Pow ' + t.power : ''} &middot; ${Math.round((t.acc ?? 1) * 100)}%${mv.cd ? ` &middot; <b>Recharging ${mv.cd}</b>` : ''}</span>${hint}`,
            value: mv.slug, disabled: mv.cd > 0, cls: 'move', style: ty,
          };
        });
        if (moves.every((mv) => mv.cd > 0)) opts.push({ html: '<span class="mv-name">Struggle</span><span class="mv-meta">All techniques recharging</span>', value: 'struggle', cls: 'move' });
        const m = await TX.ui.choose(opts, { container: menu, columns: 2, cls: 'moves' });
        if (m) { menu.hidden = true; return { kind: 'move', slug: m }; }
      } else if (a === 'bag') {
        menu.hidden = true;
        const r = await TX.ui.bag(B.state, { inBattle: true, wild: !B.trainer });
        if (r) return { kind: 'item', ...r };
        menu.hidden = false;
      } else if (a === 'party') {
        menu.hidden = true;
        const i = await TX.ui.party(B.state, { mode: 'switch', title: 'Switch to...' });
        if (i !== null) {
          const m = B.state.party[i];
          if (m === B.pb.m) await TX.ui.say(`${M().displayName(m)} is already in battle!`);
          else if (m.hp <= 0) await TX.ui.say(`${M().displayName(m)} has fainted!`);
          else return { kind: 'switch', index: i };
        }
        menu.hidden = false;
      } else if (a === 'run') {
        menu.hidden = true;
        return { kind: 'run' };
      }
    }
  }

  async function doSwitch(index) {
    await log(`Come back, ${M().displayName(B.pb.m)}!`, 0.3);
    const rig = B.p.rig;
    await U.tween(0.35, (k) => rig.root.scale.setScalar(1 - k));
    S.holder.remove(rig.root);
    B.p.rig = null;
    B.pb = M().battler(B.state.party[index]);
    B.participants.add(B.pb.m.uid);
    await log(`Go, ${M().displayName(B.pb.m)}!`, 0.3);
    await sendOut('player', B.pb.m, false);
  }

  async function runEvents(events) {
    for (const ev of events) {
      if (ev.fx) {
        await log(ev.text, 0.2);
        await playTechniqueFx(ev.fx);
        continue;
      }
      if (ev.type === 'damage') {
        const side = ev.target === B.pb ? 'player' : 'enemy';
        const before = ev.target.m.hp + ev.amount;
        if (ev.dot) burst(ev.dot === 'burn' ? 'fire' : 'venom', sideObj(side).rig.root.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 25, 0.5);
        await Promise.all([hitReact(side, ev.amount, ev.mult, ev.crit), animateHp(ev.target, before)]);
        if (ev.text) await log(ev.text);
      } else if (ev.type === 'heal') {
        const side = ev.target === B.pb ? 'player' : 'enemy';
        if (ev.amount > 0) {
          burst('wood', sideObj(side).rig.root.position.clone().add(new THREE.Vector3(0, 0.6, 0)), 30, 0.5);
          await animateHp(ev.target, ev.target.m.hp - ev.amount);
        }
        await log(ev.text);
      } else if (ev.type === 'status' || ev.type === 'stat') {
        renderPlates();
        const side = ev.target === B.pb ? 'player' : 'enemy';
        if (sideObj(side).rig) ringWave(sideObj(side).rig.root.position.clone().setY(0.1), ev.up ? 0x80d8ff : 0xff8a80);
        await log(ev.text);
      } else if (ev.text) {
        if (ev.type === 'miss') TX.audio.sfx('miss');
        await log(ev.text);
      }
    }
    camBase(0.6);
  }

  async function act(user, target, action) {
    if (user.m.hp <= 0 || target.m.hp <= 0) return;
    await runEvents(M().useTechnique(user, target, action.slug));
  }

  async function turn() {
    const action = await chooseAction();
    const enemyMove = M().chooseAI(B.eb, B.pb, !!B.trainer);
    // non-attack actions go first
    if (action.kind === 'run') {
      if (B.trainer) { await log("You can't run from a trainer battle!"); return; }
      const chance = U.clamp(0.55 + (M().eff(B.pb, 'speed') - M().eff(B.eb, 'speed')) / 80, 0.35, 0.95);
      if (Math.random() < chance) {
        await log('Got away safely!');
        TX.audio.sfx('back');
        return end('run');
      }
      await log("Couldn't get away!");
    } else if (action.kind === 'switch') {
      await doSwitch(action.index);
    } else if (action.kind === 'item') {
      const it = M().ITEMS[action.item];
      if (it.use === 'ball') {
        B.state.bag[action.item]--;
        const caught = await catchAttempt(it.ball);
        if (caught) return;
      } else {
        await log(`You used a ${it.name}.`, 0.3);
        if (action.res && action.res.heal && B.state.party[action.target] === B.pb.m) {
          burst('wood', B.p.rig.root.position.clone().add(new THREE.Vector3(0, 0.6, 0)), 30, 0.5);
          await animateHp(B.pb, B.pb.m.hp - action.res.heal);
        }
        renderPlates();
        await log(action.res.text);
      }
    }

    if (action.kind === 'move') {
      const pFirst = M().eff(B.pb, 'speed') >= M().eff(B.eb, 'speed');
      const order = pFirst ? [[B.pb, B.eb, action], [B.eb, B.pb, { slug: enemyMove }]] : [[B.eb, B.pb, { slug: enemyMove }], [B.pb, B.eb, action]];
      for (const [u, t, a] of order) {
        await act(u, t, a);
        if (await checkFaints()) return;
      }
    } else {
      await act(B.eb, B.pb, { slug: enemyMove });
      if (await checkFaints()) return;
    }
    // end of turn effects
    for (const b of [B.pb, B.eb]) await runEvents(M().endTurn(b));
    renderPlates();
    await checkFaints();
  }

  // returns true if the battle ended
  async function checkFaints() {
    if (B.eb.m.hp <= 0 && B.e.rig) {
      await log(`${B.trainer ? 'The foe\'s ' : 'The wild '}${M().displayName(B.eb.m)} fainted!`, 0.3);
      await faintAnim('enemy');
      renderPlates();
      await giveExp(B.eb.m);
      B.enemyIdx++;
      if (B.trainer && B.enemyIdx < B.enemyTeam.length) {
        B.eb = M().battler(B.enemyTeam[B.enemyIdx]);
        B.state.seen[B.eb.m.slug] = true;
        await log(`${B.trainer.name} sent out ${M().displayName(B.eb.m)}!`, 0.3);
        await sendOut('enemy', B.eb.m, false);
        B.participants = new Set([B.pb.m.uid]);
      } else {
        if (B.trainer) {
          TX.audio.play('victory');
          await log(`You defeated ${B.trainer.name}!`);
          B.state.money += B.trainer.reward;
          await log(`You got ${B.trainer.reward} ₮ for winning!`);
        }
        return end('win');
      }
    }
    if (B.pb.m.hp <= 0 && B.p.rig) {
      await log(`${M().displayName(B.pb.m)} fainted!`, 0.3);
      await faintAnim('player');
      renderPlates();
      const alive = B.state.party.some((m) => m.hp > 0);
      if (!alive) {
        await log('You have no Tuxemon left that can fight...');
        await log('You blacked out!');
        return end('lose');
      }
      for (;;) {
        const i = await TX.ui.party(B.state, { mode: 'switch', title: 'Choose your next Tuxemon', allowCancel: false });
        if (i !== null && B.state.party[i].hp > 0) {
          B.pb = M().battler(B.state.party[i]);
          B.participants.add(B.pb.m.uid);
          await log(`Go, ${M().displayName(B.pb.m)}!`, 0.3);
          await sendOut('player', B.pb.m, false);
          break;
        }
      }
    }
    return B.done;
  }

  async function giveExp(enemy) {
    const gain = M().expGain(enemy, !!B.trainer);
    const team = B.state.party.filter((m) => B.participants.has(m.uid) && m.hp > 0);
    for (const m of team) {
      const share = Math.max(1, Math.floor(gain / team.length));
      await log(`${M().displayName(m)} gained ${share} EXP!`, 0.3);
      const events = M().addExp(m, share);
      renderPlates();
      for (const ev of events) {
        if (ev.type === 'level') {
          TX.audio.sfx('levelup');
          if (m === B.pb.m && B.p.rig) burst('normal', B.p.rig.root.position.clone().add(new THREE.Vector3(0, 1, 0)), 40, 0.6);
          renderPlates();
          await log(`${M().displayName(m)} grew to level ${ev.level}!`);
        } else if (ev.type === 'learn') {
          await log(`${M().displayName(m)} learned ${M().techName(ev.slug)}!`);
        } else if (ev.type === 'forget') {
          await log(`${M().displayName(m)} forgot ${M().techName(ev.slug)} to make room...`, 0.3);
        } else if (ev.type === 'evolve') {
          if (!B.evolutions.some((e) => e.m === m)) B.evolutions.push({ m, to: ev.to });
        }
      }
    }
  }

  async function catchAttempt(ballMod) {
    const target = B.e.rig;
    const tgtPos = target.root.position.clone();
    await log(`You threw a Tuxeball!`, 0.2);
    camTo(new THREE.Vector3(POS.enemy.x - 2.6, 2.0, POS.enemy.z + 4.5), POS.enemy.clone().add(new THREE.Vector3(0, 0.6, 0)), 0.6);
    const ball = await throwBall(POS.trainerP.clone().add(new THREE.Vector3(0, 1.4, 0)), tgtPos.clone().add(new THREE.Vector3(0, target.height * 0.6, 0)));
    // absorb
    TX.engine.flash(0xff8a80, 0.3, 0.4);
    burst('heroic', ball.position, 40, 0.6);
    await U.tween(0.35, (k) => target.root.scale.setScalar(1 - k));
    target.root.visible = false;
    const groundY = 0.2;
    const y0 = ball.position.y;
    await U.tween(0.35, (k) => (ball.position.y = U.lerp(y0, groundY, k)), (t) => t * t);
    const p = M().catchChance(B.eb.m, ballMod);
    const caught = Math.random() < p;
    const wobbles = caught ? 3 : Math.floor(Math.random() * 3);
    for (let i = 0; i < wobbles; i++) {
      await U.wait(0.45);
      TX.audio.sfx('wobble');
      await U.tween(0.4, (k) => (ball.rotation.z = Math.sin(k * Math.PI * 2) * 0.5));
    }
    await U.wait(0.4);
    if (caught) {
      TX.audio.sfx('caught');
      burst('cosmic', ball.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 60, 0.7);
      await log(`Gotcha! ${M().displayName(B.eb.m)} was caught!`);
      S.scene.remove(ball);
      const m = B.eb.m;
      m.status = null;
      for (const mv of m.moves) mv.cd = 0;
      B.state.caught[m.slug] = true;
      await giveExp(m);
      if (B.state.party.length < 6) {
        B.state.party.push(m);
        await log(`${M().displayName(m)} joined your party!`);
      } else {
        B.state.box.push(m);
        await log(`${M().displayName(m)} was sent to your storage box.`);
      }
      end('caught');
      return true;
    }
    TX.audio.sfx('breakout');
    burst('normal', ball.position, 40, 0.8);
    S.scene.remove(ball);
    target.root.visible = true;
    await U.tween(0.3, (k) => target.root.scale.setScalar(k), U.easeOutBack);
    await log(['Oh no! It broke free!', 'Argh! Almost had it!', 'Aww! It appeared to be caught!'][wobbles]);
    camBase(0.6);
    return false;
  }

  function end(result) {
    B.done = true;
    B.result = result;
    return true;
  }

  // ---- evolution cutscene (rendered in the battle scene) ------------------------------------------------
  async function evolveScene(state, m, to) {
    if (!S) buildScene();
    for (const g of Object.values(S.envs)) g.visible = false;
    S.envs['Route 1'].visible = true;
    S.holder.clear();
    B = B || {};
    B.p = { rig: null }; B.e = { rig: null }; B.state = state;
    $('battle').hidden = false;
    $('plate-player').hidden = $('plate-enemy').hidden = true;
    $('battle-menu').hidden = true;
    const center = new THREE.Vector3(0, 0, 0);
    cam.pos.set(0, 1.6, 6);
    cam.look.set(0, 1.0, 0);
    const show = (slug) => {
      const rig = TX.creatures.build(slug);
      rig.root.position.copy(center);
      S.holder.add(rig.root);
      return rig;
    };
    let rig = show(m.slug);
    B.p.rig = rig; B.p.home = center.clone();
    TX.audio.play('title');
    await TX.ui.fade(0, 0.4);
    await log(`What? ${M().displayName(m)} is evolving!`);
    TX.audio.sfx('evolve');
    const next = show(to);
    next.root.visible = false;
    for (let i = 0; i < 10; i++) {
      const speed = 0.35 - i * 0.025;
      const a = i % 2 === 0 ? rig : next;
      const b = i % 2 === 0 ? next : rig;
      await U.tween(speed, (k) => a.root.scale.setScalar(1 - k * 0.9));
      a.root.visible = false;
      b.root.visible = true;
      b.root.scale.setScalar(0.1);
      burst('cosmic', new THREE.Vector3(0, 1, 0), 15, 0.4);
      await U.tween(speed, (k) => b.root.scale.setScalar(0.1 + k * 0.9));
    }
    S.holder.remove(rig.root);
    next.root.visible = true;
    next.root.scale.setScalar(1);
    TX.engine.flash(0xffffff, 0.8, 1);
    burst('normal', new THREE.Vector3(0, 1.2, 0), 120, 1.2);
    TX.audio.sfx('caught');
    const oldName = M().displayName(m);
    M().evolve(m, to);
    state.seen[to] = state.caught[to] = true;
    B.p.rig = next;
    await log(`Congratulations! ${oldName} evolved into ${M().name(to)}!`, 1.5);
    await TX.ui.fade(1, 0.4);
    $('battle').hidden = true;
  }

  function update(dt, time) {
    if (!S) return;
    updateCamera(dt);
    for (const s of [B && B.p, B && B.e]) if (s && s.rig) TX.creatures.animate(s.rig, time, 'idle');

    S.fxAdd.update(dt);
    S.fxNorm.update(dt);
  }

  function render() {
    TX.engine.render(S.scene, S.camera, { tilt: 0.35 });
  }

  return { start, update, render, evolveScene, get active() { return !!(B && !B.done); } };
})();
