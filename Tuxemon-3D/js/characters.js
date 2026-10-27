// Stylised chibi humans for the player, townsfolk and trainers.
'use strict';

TX.characters = (() => {
  const mats = new Map();
  function toon(c) {
    if (!mats.has(c)) mats.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: TX.engine.toonMap() }));
    return mats.get(c);
  }
  function part(parent, geo, color, pos, rot = [0, 0, 0], outline = 0.02) {
    const m = new THREE.Mesh(geo, toon(color));
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.castShadow = true;
    if (outline) TX.engine.addOutline(m, outline);
    parent.add(m);
    return m;
  }
  const sph = (x, y, z, s = 18) => new THREE.SphereGeometry(1, s, Math.round(s * 0.7)).scale(x, y, z);

  // style: { skin, hair, shirt, pants, cap?, hairStyle: 'short'|'long'|'bun'|'spiky', bag? }
  function build(style) {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);

    const torso = part(body, new THREE.CapsuleGeometry(0.2, 0.28, 4, 12), style.shirt, [0, 0.72, 0]);
    torso.scale.set(1, 1, 0.8);
    // legs
    const legs = [];
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(s * 0.1, 0.48, 0);
      body.add(g);
      part(g, new THREE.CapsuleGeometry(0.075, 0.22, 4, 10), style.pants, [0, -0.2, 0]);
      part(g, sph(0.09, 0.06, 0.13), style.shoes || '#3b3b4f', [0, -0.42, 0.03]);
      legs.push(g);
    }
    // arms
    const arms = [];
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(s * 0.26, 0.88, 0);
      g.rotation.z = s * 0.12;
      body.add(g);
      part(g, new THREE.CapsuleGeometry(0.06, 0.24, 4, 10), style.shirt, [0, -0.15, 0]);
      part(g, sph(0.065, 0.065, 0.065, 10), style.skin, [0, -0.33, 0], [0, 0, 0], 0.012);
      arms.push(g);
    }
    // head
    const head = new THREE.Group();
    head.position.set(0, 1.22, 0);
    body.add(head);
    part(head, sph(0.3, 0.29, 0.28), style.skin, [0, 0, 0]);
    for (const s of [-1, 1]) {
      part(head, sph(0.045, 0.06, 0.03, 10), '#2a2238', [s * 0.11, -0.01, 0.26], [0, 0, 0], 0);
      part(head, sph(0.04, 0.02, 0.02, 8), '#ff9aa8', [s * 0.17, -0.09, 0.24], [0, 0, 0], 0);
    }
    // hair
    const hs = style.hairStyle || 'short';
    part(head, sph(0.31, 0.22, 0.3), style.hair, [0, 0.09, -0.03]);
    if (hs === 'long') part(head, sph(0.29, 0.34, 0.12), style.hair, [0, -0.12, -0.18]);
    if (hs === 'bun') part(head, sph(0.12, 0.12, 0.12), style.hair, [0, 0.3, -0.12]);
    if (hs === 'spiky') {
      for (let i = 0; i < 5; i++) part(head, new THREE.ConeGeometry(0.07, 0.2, 6), style.hair, [-0.2 + i * 0.1, 0.27, -0.05], [-0.3, 0, (i - 2) * -0.25], 0.012);
    }
    if (style.cap) {
      part(head, sph(0.32, 0.16, 0.31), style.cap, [0, 0.15, -0.01]);
      part(head, new THREE.CylinderGeometry(0.2, 0.2, 0.025, 16).scale(1, 1, 1.1), style.cap, [0, 0.11, 0.25], [0.15, 0, 0], 0.012);
    }
    if (style.bag) part(body, new THREE.BoxGeometry(0.3, 0.32, 0.14), style.bag, [0, 0.76, -0.22]);

    // soft contact shadow blob
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    return { root, body, head, legs, arms, walk: 0 };
  }

  function animate(c, dt, moving, running) {
    if (moving) c.walk += dt * (running ? 16 : 10);
    else c.walk = c.walk * 0.85;
    const s = Math.sin(c.walk);
    const amp = moving ? (running ? 0.85 : 0.6) : 0;
    c.legs[0].rotation.x = s * amp;
    c.legs[1].rotation.x = -s * amp;
    c.arms[0].rotation.x = -s * amp * 0.8;
    c.arms[1].rotation.x = s * amp * 0.8;
    c.body.position.y = moving ? Math.abs(Math.cos(c.walk)) * 0.05 : 0;
    c.body.rotation.x = running && moving ? 0.12 : 0;
    if (!moving) {
      const t = performance.now() / 1000;
      c.head.rotation.z = Math.sin(t * 1.3 + c.root.id) * 0.03;
      c.body.scale.y = 1 + Math.sin(t * 2 + c.root.id) * 0.01;
    }
  }

  const STYLES = {
    player: { skin: '#ffd7b5', hair: '#3b2a20', shirt: '#e53950', pants: '#2d3a6b', cap: '#e53950', bag: '#f2c14e', hairStyle: 'short' },
    mom: { skin: '#f6cfa8', hair: '#a0522d', shirt: '#7cb87f', pants: '#5d4e7a', hairStyle: 'bun' },
    nurse: { skin: '#ffe0c2', hair: '#ff8fb1', shirt: '#ffffff', pants: '#ff8fb1', hairStyle: 'long' },
    clerk: { skin: '#e8b48f', hair: '#1f1f2e', shirt: '#3a7bd5', pants: '#2b2b3b', cap: '#3a7bd5' },
    kid: { skin: '#ffd2b0', hair: '#f4c542', shirt: '#ff9f43', pants: '#4b6cb7', hairStyle: 'spiky' },
    elder: { skin: '#e9c5a5', hair: '#d9d9d9', shirt: '#8e7cc3', pants: '#5b5b5b' },
    hiker: { skin: '#d9a47c', hair: '#5a3a1e', shirt: '#6b8e23', pants: '#7a5c3a', cap: '#8b5a2b', bag: '#8b5a2b' },
    lass: { skin: '#ffe1c8', hair: '#c0392b', shirt: '#f78fb3', pants: '#ffffff', hairStyle: 'long' },
    ranger: { skin: '#cfa07a', hair: '#2e2e2e', shirt: '#2e7d32', pants: '#3e2723', cap: '#2e7d32', bag: '#5d4037' },
    rival: { skin: '#ffd7b5', hair: '#6a5acd', shirt: '#1e88e5', pants: '#263238', hairStyle: 'spiky' },
    warden: { skin: '#e6b995', hair: '#eeeeee', shirt: '#4527a0', pants: '#1a1a2e', hairStyle: 'long', cap: '#ffd54f' },
    fisher: { skin: '#e0ac69', hair: '#4a4a4a', shirt: '#00838f', pants: '#37474f', cap: '#f9a825' },
  };

  return { build, animate, STYLES };
})();
