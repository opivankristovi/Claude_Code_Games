// Game state machine: title, starter choice, overworld, battles, saving.
'use strict';

TX.game = (() => {
  const U = TX.util;
  const { $ } = U;
  const SAVE_KEY = 'tx3d.save.v1';
  const STARTERS = ['agnite', 'axolightl', 'anoleaf'];
  const COUNTER = { agnite: 'axolightl', axolightl: 'anoleaf', anoleaf: 'agnite' };
  const START_POS = [13, 56];

  const G = {
    mode: 'loading',
    state: null,
    scene: null,
    rig: null,
    camera: null,
    world: null,
    player: null,
    time: 0,
    lastArea: null,
  };

  function newState() {
    return {
      party: [], box: [],
      bag: { potion: 5, tuxeball: 6 },
      money: 600,
      seen: {}, caught: {},
      flags: { defeated: {} },
      pos: START_POS.slice(), face: 'down',
      time: 0.33, daySpeed: 12, playtime: 0,
    };
  }

  // ---- boot ------------------------------------------------------------------------
  async function boot() {
    TX.engine.init($('view'));
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xc4dcf0, 28, 75);
    G.scene = scene;
    G.rig = TX.engine.lightingRig(scene, { shadowSize: 2048, shadowExtent: 22 });
    G.world = TX.world.build(scene);
    G.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 600);
    const pc = TX.characters.build(TX.characters.STYLES.player);
    scene.add(pc.root);
    G.player = { c: pc, x: START_POS[0], z: START_POS[1], face: 'down', moving: false, from: null, to: null, t: 0, turnDelay: 0, steps: 0 };
    G.state = newState();
    placePlayer();
    // warm up shaders so the first frames don't hitch
    TX.engine.renderer.compile(scene, G.camera);
    $('loading').hidden = true;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frame(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    await title();
  }

  // ---- frame -------------------------------------------------------------------------
  let clock = 0;
  function frame(dt) {
    clock += dt;
    TX.engine.uniforms.uTime.value = clock;
    U.updateTweens(dt);
    TX.ui.update(dt);
    if (G.mode === 'battle' || G.mode === 'evolve') {
      TX.battle.update(dt, clock);
      TX.battle.render();
      return;
    }
    const s = G.state;
    if (G.mode === 'world') {
      if (s.daySpeed > 0) s.time = (s.time + dt / (s.daySpeed * 60)) % 1;
      s.playtime += dt;
      updatePlayer(dt);
    }
    const center = new THREE.Vector3(G.player.c.root.position.x, 0, G.player.c.root.position.z);
    const day = TX.engine.applyDay(G.rig, G.mode === 'title' ? 0.62 : s.time, center);
    G.world.setSun(G.rig.sun.position.clone().sub(center).normalize());
    G.scene.fog.near = 28; G.scene.fog.far = 75;
    TX.engine.uniforms.uPlayer.value.copy(G.player.c.root.position);
    G.world.update(dt, clock, [G.player.x, G.player.z], G.mode !== 'world');
    updateCamera(dt);
    if (G.starterRigs) G.starterRigs.forEach((r, i) => TX.creatures.animate(r, clock, i === G.starterSel ? 'happy' : 'idle'));
    if (G.mode === 'world') {
      const area = G.world.area(G.player.x, G.player.z).name;
      const h = Math.floor(s.time * 24), m = Math.floor((s.time * 24 - h) * 60);
      TX.ui.renderHud(s, area, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${day.night > 0.6 ? '☾' : '☀'}`);
    }
    TX.engine.render(G.scene, G.camera, { tilt: G.mode === 'title' ? 0.9 : 0.65 });
  }

  // ---- camera -------------------------------------------------------------------------
  let camPos, camLook;
  let camInit = false;
  function updateCamera(dt) {
    let pos, look;
    if (G.mode === 'title') {
      const a = clock * 0.05;
      look = new THREE.Vector3(27.5, 0.5, 60);
      pos = new THREE.Vector3(27.5 + Math.cos(a) * 18, 11, 60 + Math.sin(a) * 18);
    } else if (G.camOverride) {
      pos = G.camOverride.pos;
      look = G.camOverride.look;
    } else {
      const p = G.player.c.root.position;
      look = new THREE.Vector3(p.x, p.y + 0.6, p.z - 0.6);
      pos = new THREE.Vector3(p.x, p.y + 8.2, p.z + 8.6);
    }
    if (!camPos) { camPos = new THREE.Vector3(); camLook = new THREE.Vector3(); }
    if (!camInit) { camPos.copy(pos); camLook.copy(look); camInit = true; }
    const k = 1 - Math.exp(-dt * (G.mode === 'title' ? 2 : 6));
    camPos.lerp(pos, k);
    camLook.lerp(look, k);
    G.camera.position.copy(camPos);
    G.camera.lookAt(camLook);
  }

  // ---- player ---------------------------------------------------------------------------
  const DIRS = TX.world.DIRS;
  function placePlayer() {
    const p = G.player;
    const px = p.moving ? U.lerp(p.from[0], p.to[0], p.t) : p.x;
    const pz = p.moving ? U.lerp(p.from[1], p.to[1], p.t) : p.z;
    p.c.root.position.set(px + 0.5, G.world.standHeight(px + 0.5, pz + 0.5), pz + 0.5);
    const target = TX.world.FACE_ANGLE[p.face];
    let d = target - p.c.root.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    p.c.root.rotation.y += d * 0.35;
  }

  function updatePlayer(dt) {
    const p = G.player;
    const running = TX.input.held.has('run');
    const busy = TX.ui.busy() || G.cutscene;
    if (p.moving) {
      p.t += dt * (running ? 7 : 4.2);
      if (p.t >= 1) {
        p.moving = false;
        p.x = p.to[0];
        p.z = p.to[1];
        p.t = 0;
        onStep();
      }
    }
    if (!p.moving && !busy) {
      const d = TX.input.direction();
      if (d) {
        if (d !== p.face && !p.walking) {
          // tap to turn in place, hold to walk
          p.face = d;
          p.turnDelay = 0.1;
        } else if (p.turnDelay > 0) {
          p.turnDelay -= dt;
        } else {
          p.face = d;
          const [dx, dz] = DIRS[d];
          const nx = p.x + dx, nz = p.z + dz;
          if (G.world.walkable(nx, nz)) {
            p.moving = true;
            p.walking = true;
            p.from = [p.x, p.z];
            p.to = [nx, nz];
            p.t = 0;
          } else if (!p.bumped) {
            TX.audio.sfx('bump');
            p.bumped = true;
          }
        }
      } else {
        p.turnDelay = 0;
        p.bumped = false;
        p.walking = false;
      }
    }
    if (!busy) {
      let a;
      while ((a = TX.input.next())) {
        if (a === 'mute') TX.ui.toast(TX.audio.toggleMute() ? 'Sound off' : 'Sound on');
        if (p.moving) continue;
        if (a === 'ok') { interact(); break; }
        if (a === 'menu') { pauseMenu(); break; }
      }
    }
    placePlayer();
    TX.characters.animate(p.c, dt, p.moving, running);
  }

  async function onStep() {
    const p = G.player, s = G.state;
    s.pos = [p.x, p.z];
    s.face = p.face;
    // area banner + music
    const area = G.world.area(p.x, p.z);
    if (area.name !== G.lastArea) {
      G.lastArea = area.name;
      TX.ui.banner(area.name);
      TX.audio.play(area.music);
    }
    if (await checkTrainers()) return;
    if (G.world.isTall(p.x, p.z)) {
      // grass rustle
      if (Math.random() < 0.12) {
        const table = G.world.encounterTable(p.x, p.z);
        if (table) startWild(table);
      }
    }
  }

  // ---- interactions -------------------------------------------------------------------------
  async function interact() {
    const p = G.player;
    const [dx, dz] = DIRS[p.face];
    const tx = p.x + dx, tz = p.z + dz;
    const npc = G.world.npcAt(tx, tz) || G.world.npcAt(tx + dx, tz + dz);
    if (npc && (npc.x === tx && npc.z === tz || G.world.get(tx, tz) === TX.world.T.PROP)) return talk(npc);
    const sign = G.world.signAt(tx, tz);
    if (sign) return TX.ui.say(sign.text);
    const door = G.world.doorAt(tx, tz);
    if (door) return enterDoor(door);
  }

  async function talk(npc) {
    G.cutscene = true;
    const p = G.player;
    npc.busy = true;
    npc.face = { up: 'down', down: 'up', left: 'right', right: 'left' }[p.face];
    const def = npc.def;
    const name = def.trainer ? def.trainer.name : U.prettify(def.style === 'elder' ? 'Professor Spruce' : def.style);
    try {
      if (def.trainer) {
        if (G.state.flags.defeated[def.id]) await TX.ui.say(def.after, name);
        else await trainerBattle(npc);
      } else if (def.service === 'center') {
        await nurseHeal();
      } else if (def.service === 'shop') {
        await TX.ui.say(def.lines, 'Clerk');
        await TX.ui.shop(G.state);
        await TX.ui.say('Come again!', 'Clerk');
      } else {
        const line = def.lines[(npc.talks = (npc.talks || 0) + 1) % def.lines.length];
        await TX.ui.say(line, name === 'Mom' ? 'Mom' : name);
      }
    } finally {
      npc.busy = false;
      G.cutscene = false;
    }
  }

  async function nurseHeal() {
    await TX.ui.say(['Welcome to the Tuxemon Center!', 'Let me restore your Tuxemon to full health.'], 'Nurse Joy');
    await TX.ui.fade(0.85, 0.3);
    TX.audio.sfx('heal');
    TX.mon.healAll(G.state.party);
    await U.wait(0.9);
    await TX.ui.fade(0, 0.3);
    save(true);
    await TX.ui.say('Your Tuxemon are fighting fit! We hope to see you again.', 'Nurse Joy');
  }

  async function enterDoor(b) {
    if (b.id === 'center') return nurseHeal();
    if (b.id === 'home') {
      const v = await TX.ui.choose([{ label: 'Rest until morning', value: 'rest' }, { label: 'Leave', value: null }], { title: 'Your house' });
      if (v === 'rest') {
        await TX.ui.fade(1, 0.6);
        TX.mon.healAll(G.state.party);
        G.state.time = 0.3;
        TX.audio.sfx('heal');
        await U.wait(0.8);
        await TX.ui.fade(0, 0.6);
        save(true);
        await TX.ui.say('You feel refreshed! Your Tuxemon are fully healed.');
      }
      return;
    }
    if (b.id === 'lab') return TX.ui.say('A note on the door: "Out researching at the shrine. — Prof. Spruce"');
    return TX.ui.say('Nobody seems to be home.');
  }

  // ---- menu -----------------------------------------------------------------------------------
  async function pauseMenu() {
    G.cutscene = true;
    TX.audio.sfx('select');
    for (;;) {
      const v = await TX.ui.choose([
        { label: 'Tuxemon', value: 'party' },
        { label: 'Bag', value: 'bag' },
        { label: 'Tuxepedia', value: 'dex' },
        { label: 'Save', value: 'save' },
        { label: 'Settings', value: 'settings' },
        { label: 'Close', value: null },
      ], { title: `Tamer &middot; ${G.state.money} &#x20AE;`, cls: 'pause' });
      if (v === null) break;
      if (v === 'party') await TX.ui.party(G.state);
      if (v === 'bag') await TX.ui.bag(G.state);
      if (v === 'dex') await TX.ui.dex(G.state);
      if (v === 'save') { save(); await TX.ui.say('Your progress was saved.'); }
      if (v === 'settings') await TX.ui.settings();
    }
    G.cutscene = false;
  }

  // ---- encounters & trainers ---------------------------------------------------------------------
  function pickWeighted(table, r) {
    const night = TX.engine.night > 0.5;
    const rows = table.map(([s, w]) => [s, w * (night && (s === 'noctula' || s === 'eskipup') ? 2.5 : 1)]);
    const total = rows.reduce((a, [, w]) => a + w, 0);
    let x = r() * total;
    for (const [s, w] of rows) if ((x -= w) <= 0) return s;
    return rows[0][0];
  }

  async function startWild(table) {
    const r = U.rng(Math.floor(Math.random() * 1e9));
    const slug = pickWeighted(table.table, r);
    const lvl = r.int(table.levels[0], table.levels[1]);
    await runBattle({ wild: TX.mon.create(slug, lvl) });
  }

  async function checkTrainers() {
    const p = G.player;
    for (const n of G.world.npcs) {
      const t = n.def.trainer;
      if (!t || G.state.flags.defeated[n.def.id] || !n.def.sight) continue;
      const [dx, dz] = DIRS[n.face];
      for (let i = 1; i <= n.def.sight; i++) {
        const x = n.x + dx * i, z = n.z + dz * i;
        if (x === p.x && z === p.z) {
          await spotted(n, i);
          return true;
        }
        if (!G.world.walkable(x, z, n) && !(x === p.x && z === p.z)) break;
      }
    }
    return false;
  }

  async function spotted(npc, dist) {
    G.cutscene = true;
    npc.busy = true;
    TX.audio.sfx('encounter');
    const bubble = exclaim(npc);
    await U.wait(0.7);
    G.scene.remove(bubble);
    // walk up to the player
    const [dx, dz] = DIRS[npc.face];
    for (let i = 1; i < dist; i++) {
      npc.moving = true; npc.t = 0; npc.from = [npc.x, npc.z]; npc.to = [npc.x + dx, npc.z + dz];
      await U.wait(0.32);
      npc.moving = false; npc.x = npc.to[0]; npc.z = npc.to[1];
    }
    G.player.face = { up: 'down', down: 'up', left: 'right', right: 'left' }[npc.face];
    await trainerBattle(npc);
    npc.busy = false;
    G.cutscene = false;
  }

  function exclaim(npc) {
    const tex = TX.engine.canvasTexture(128, 128, (g) => {
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(64, 64, 56, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#1d1730'; g.lineWidth = 8; g.stroke();
      g.fillStyle = '#e53950'; g.font = 'bold 90px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('!', 64, 70);
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
    s.scale.set(0.8, 0.8, 0.8);
    s.position.copy(npc.c.root.position).add(new THREE.Vector3(0, 2.1, 0));
    s.renderOrder = 10;
    G.scene.add(s);
    return s;
  }

  async function trainerBattle(npc) {
    const def = npc.def, t = def.trainer;
    const name = t.name;
    await TX.ui.say(def.lines, name);
    const team = t.team.map(([slug, lvl]) => TX.mon.create(slug === 'rival_starter' ? COUNTER[G.state.flags.starter] || 'agnite' : slug, lvl));
    const res = await runBattle({ trainer: { name, team, reward: t.reward, style: def.style, boss: t.boss } });
    if (res === 'win') {
      G.state.flags.defeated[def.id] = true;
      await TX.ui.say(def.after, name);
      if (t.boss) await champion();
      save(true);
    }
  }

  async function champion() {
    G.state.flags.champion = true;
    TX.audio.play('victory');
    TX.ui.banner('Tuxemon Champion!');
    await TX.ui.say([
      'Warden Mara bows deeply.',
      'Congratulations, Champion! You have conquered the Warden\'s Shrine.',
      'Thank you for playing Tuxemon 3D. Keep exploring and fill your Tuxepedia!',
    ]);
  }

  // ---- battle handoff -------------------------------------------------------------------------------
  async function runBattle(opts) {
    if (!G.state.party.some((m) => m.hp > 0)) {
      await TX.ui.say('Your Tuxemon are too tired to fight! Heal them first.');
      return 'none';
    }
    G.cutscene = true;
    TX.audio.sfx('encounter');
    TX.input.clear();
    // swirl-in transition
    await TX.engine.flash(0xffffff, 0.18, 0.9);
    await TX.engine.flash(0xffffff, 0.18, 0.9);
    await TX.ui.fade(1, 0.35);
    $('hud').hidden = true;
    G.mode = 'battle';
    const area = G.world.area(G.player.x, G.player.z).name;
    const out = await TX.battle.start({ state: G.state, ...opts, env: area, time: G.state.time });
    await TX.ui.fade(1, 0.4);
    for (const ev of out.evolutions) {
      G.mode = 'evolve';
      await TX.battle.evolveScene(G.state, ev.m, ev.to);
    }
    G.mode = 'world';
    if (out.result === 'lose') {
      G.state.money = Math.floor(G.state.money / 2);
      TX.mon.healAll(G.state.party);
      teleport(36, 57, 'up');
    }
    $('hud').hidden = false;
    TX.audio.play(G.world.area(G.player.x, G.player.z).music);
    await TX.ui.fade(0, 0.5);
    if (out.result === 'lose') await TX.ui.say(['You hurried back to the Tuxemon Center...', 'Your Tuxemon have been healed. You dropped half your money.'], 'Nurse Joy');
    save(true);
    G.cutscene = false;
    return out.result;
  }

  function teleport(x, z, face) {
    const p = G.player;
    p.x = x; p.z = z; p.face = face; p.moving = false;
    p.c.root.rotation.y = TX.world.FACE_ANGLE[face];
    placePlayer();
    camInit = false;
  }

  // ---- title & new game ----------------------------------------------------------------------------------
  async function title() {
    G.mode = 'title';
    $('title').hidden = false;
    TX.audio.play('title');
    const has = !!localStorage.getItem(SAVE_KEY);
    const opts = [];
    if (has) opts.push({ label: 'Continue', value: 'continue' });
    opts.push({ label: 'New Game', value: 'new' }, { label: 'Settings', value: 'settings' });
    for (;;) {
      const v = await TX.ui.choose(opts, { container: $('title-menu'), cancel: false, keepOpen: true });
      if (v === 'settings') { await TX.ui.settings(); continue; }
      $('title').hidden = true;
      $('title-menu').innerHTML = '';
      if (v === 'continue' && load()) return enterWorld();
      return newGame();
    }
  }

  async function newGame() {
    G.state = newState();
    await TX.ui.fade(1, 0.5);
    G.mode = 'starter';
    teleport(27, 72, 'up');
    G.player.c.root.visible = false;
    camInit = false;
    spawnStarters();
    await TX.ui.fade(0, 0.6);
    await TX.ui.say([
      'Hello there! Welcome to the world of Tuxemon!',
      'I\'m Professor Spruce. People call me the Tuxemon Prof.',
      'This world is inhabited by creatures called Tuxemon. Some people battle with them, others live alongside them.',
      'Your journey starts today! Pick a partner to take with you.',
    ], 'Professor Spruce');
    const choice = await chooseStarter();
    const starter = TX.mon.create(choice, 5);
    G.state.party.push(starter);
    G.state.flags.starter = choice;
    G.state.seen[choice] = G.state.caught[choice] = true;
    await TX.ui.say([`${TX.mon.name(choice)} is a great choice! Take good care of it.`,
      'Wild Tuxemon live in tall grass. Weaken them in battle, then throw a Tuxeball to catch them.',
      'When you\'re ready, head north through Route 1. The Warden waits at the shrine beyond the Whispering Woods.'], 'Professor Spruce');
    await TX.ui.say([`Hah! I'm taking ${TX.mon.name(COUNTER[choice])}. It's got the type advantage!`, 'See you at the shrine, slowpoke!'], 'Rival Kai');
    await TX.ui.fade(1, 0.5);
    G.starterRigs.forEach((r) => G.scene.remove(r.root));
    G.starterRigs = null;
    G.camOverride = null;
    G.player.c.root.visible = true;
    teleport(START_POS[0], START_POS[1], 'down');
    await enterWorld();
    TX.ui.toast('Tip: WASD to move, Shift to run, E to talk, Esc for the menu.');
  }

  function spawnStarters() {
    const base = new THREE.Vector3(28, 0.05, 66.5);
    G.starterRigs = STARTERS.map((s, i) => {
      const rig = TX.creatures.build(s);
      rig.root.position.set(base.x - 2.4 + i * 2.4, G.world.standHeight(base.x, base.z) + 0.02, base.z);
      rig.root.rotation.y = 0;
      G.scene.add(rig.root);
      return rig;
    });
    G.starterSel = 1;
    G.camOverride = { pos: new THREE.Vector3(base.x, 3.2, base.z + 7.5), look: new THREE.Vector3(base.x, 0.9, base.z) };
  }

  function chooseStarter() {
    const focus = (i) => {
      const r = G.starterRigs[i].root.position;
      G.camOverride = { pos: new THREE.Vector3(r.x, 2.3, r.z + 5.2), look: new THREE.Vector3(r.x, 0.9, r.z) };
    };
    focus(1);
    const D = window.TX_DATA;
    return (async () => {
      for (;;) {
        const v = await TX.ui.choose(STARTERS.map((s) => ({
          html: `<img class="portrait" src="${TX.creatures.portrait(s)}" alt=""><span class="mi-label">${TX.mon.name(s)}</span><span class="mi-sub">${TX.ui.typeChips(D.species[s].types)}</span>`, value: s, cls: 'starter',
        })), { title: 'Choose your first Tuxemon', cancel: false, columns: 3, cls: 'starters', start: G.starterSel,
          onFocus: (o, i) => { G.starterSel = i; focus(i); } });
        const ok = await TX.ui.choose([{ label: `Yes, ${TX.mon.name(v)}!`, value: true }, { label: 'Let me think...', value: false }], { title: `Choose ${TX.mon.name(v)}?` });
        if (ok) { TX.audio.sfx('caught'); return v; }
      }
    })();
  }

  async function enterWorld() {
    G.mode = 'world';
    G.camOverride = null;
    camInit = false;
    teleport(G.state.pos[0], G.state.pos[1], G.state.face);
    $('hud').hidden = false;
    G.lastArea = null;
    const area = G.world.area(G.player.x, G.player.z);
    G.lastArea = area.name;
    TX.audio.play(area.music);
    TX.ui.banner(area.name);
    await TX.ui.fade(0, 0.6);
  }

  // ---- save / load -------------------------------------------------------------------------------------------
  function save(silent) {
    const s = G.state;
    s.pos = [G.player.x, G.player.z];
    s.face = G.player.face;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
      if (!silent) TX.audio.sfx('heal');
    } catch (e) {
      console.warn('save failed', e);
    }
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!s || !s.party || !s.party.length) return false;
      G.state = Object.assign(newState(), s);
      return true;
    } catch (e) {
      return false;
    }
  }

  // test hook: advance the simulation without requestAnimationFrame
  function step(n = 1, dt = 1 / 30) {
    for (let i = 0; i < n; i++) frame(dt);
  }

  return Object.assign(G, { boot, save, step });
})();
