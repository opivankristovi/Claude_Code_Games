// DOM user interface: dialog, menus, panels and HUD. Keyboard + mouse.
'use strict';

TX.ui = (() => {
  const U = TX.util;
  const { $, el } = U;
  const stack = []; // input handlers, top gets input

  function push(handler) { stack.push(handler); }
  function pop(handler) {
    const i = stack.lastIndexOf(handler);
    if (i >= 0) stack.splice(i, 1);
  }
  const busy = () => stack.length > 0;

  function update(dt) {
    for (const h of stack) if (h.tick) h.tick(dt);
    const top = stack[stack.length - 1];
    if (!top) return;
    let a;
    while ((a = TX.input.next())) {
      if (a === 'mute') { toast(TX.audio.toggleMute() ? 'Sound off' : 'Sound on'); continue; }
      top.onInput(a);
      if (stack[stack.length - 1] !== top) break;
    }
  }

  // ---- dialog ---------------------------------------------------------------------
  function say(lines, speaker = '') {
    if (typeof lines === 'string') lines = [lines];
    TX.input.clear(); // drop stale key presses
    return new Promise((resolve) => {
      const box = $('dialog'), txt = $('dialog-text'), nm = $('dialog-name');
      box.hidden = false;
      nm.textContent = speaker;
      nm.hidden = !speaker;
      let li = 0, shown = 0, acc = 0;
      const h = {
        tick(dt) {
          const line = lines[li];
          if (shown < line.length) {
            acc += dt * 55;
            const n = Math.floor(acc);
            if (n > 0) {
              acc -= n;
              shown = Math.min(line.length, shown + n);
              txt.textContent = line.slice(0, shown);
              if (shown % 3 === 0) TX.audio.sfx('talk');
            }
          }
          box.classList.toggle('done', shown >= line.length);
        },
        onInput(a) {
          if (a !== 'ok' && a !== 'back') return;
          if (shown < lines[li].length) {
            shown = lines[li].length;
            txt.textContent = lines[li];
            return;
          }
          li++;
          if (li >= lines.length) {
            pop(h);
            box.hidden = true;
            resolve();
          } else {
            shown = 0;
            acc = 0;
            txt.textContent = '';
          }
        },
      };
      txt.textContent = '';
      box.onclick = () => h.onInput('ok');
      push(h);
    });
  }

  // ---- menus ----------------------------------------------------------------------
  // options: [{label, value, disabled, sub, right, html, cls}]
  function choose(options, { container = $('choices'), title = '', cancel = true, columns = 1, cls = '', onFocus, keepOpen = false, start = 0 } = {}) {
    TX.input.clear(); // drop stale key presses
    return new Promise((resolve) => {
      container.innerHTML = '';
      container.hidden = false;
      container.className = container.dataset.base || (container.dataset.base = container.className);
      if (cls) container.classList.add(cls);
      if (title) container.appendChild(el('div', 'menu-title', title));
      const list = el('div', 'menu-list');
      list.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      container.appendChild(list);
      let sel = Math.min(start, options.length - 1);
      const btns = options.map((o, i) => {
        const b = el('button', 'menu-item ' + (o.cls || ''), o.html || `<span class="mi-label">${o.label}</span>${o.right ? `<span class="mi-right">${o.right}</span>` : ''}${o.sub ? `<span class="mi-sub">${o.sub}</span>` : ''}`);
        b.type = 'button';
        if (o.disabled) b.classList.add('disabled');
        b.onmouseenter = () => { sel = i; render(); };
        b.onclick = () => { sel = i; h.onInput('ok'); };
        list.appendChild(b);
        return b;
      });
      const render = () => {
        btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
        if (onFocus) onFocus(options[sel], sel);
      };
      const close = (v) => {
        pop(h);
        if (!keepOpen) { container.hidden = true; container.innerHTML = ''; }
        resolve(v);
      };
      const h = {
        onInput(a) {
          const n = options.length;
          if (a === 'up') sel = (sel - columns + n) % n;
          else if (a === 'down') sel = (sel + columns) % n;
          else if (a === 'left' && columns > 1) sel = (sel - 1 + n) % n;
          else if (a === 'right' && columns > 1) sel = (sel + 1) % n;
          else if (a === 'ok') {
            if (options[sel].disabled) { TX.audio.sfx('bump'); return; }
            TX.audio.sfx('select');
            close(options[sel].value);
            return;
          } else if ((a === 'back' || a === 'menu') && cancel) {
            TX.audio.sfx('back');
            close(null);
            return;
          } else return;
          TX.audio.sfx('move');
          render();
        },
      };
      push(h);
      render();
    });
  }

  function toast(text) {
    const t = el('div', 'toast', text);
    $('toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2700);
  }

  let bannerTimer = null;
  function banner(text) {
    const b = $('banner');
    b.textContent = text;
    b.hidden = false;
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => (b.hidden = true), 3200);
  }

  function fade(to, duration = 0.4) {
    const f = $('fade');
    const from = parseFloat(f.style.opacity || 0);
    return U.tween(duration, (k) => (f.style.opacity = U.lerp(from, to, k)));
  }

  // ---- reusable bits ----------------------------------------------------------------------
  function typeChips(types) {
    return types.map((t) => `<span class="chip" style="--c:${U.ELEMENT[t].color}">${U.ELEMENT[t].label}</span>`).join('');
  }
  function hpBar(m, cls = '') {
    const mh = TX.mon.maxHp(m);
    const k = m.hp / mh;
    const col = k > 0.5 ? 'var(--hp-good)' : k > 0.2 ? 'var(--hp-mid)' : 'var(--hp-low)';
    return `<div class="hpbar ${cls}"><div class="hpfill" style="width:${(k * 100).toFixed(1)}%;background:${col}"></div></div>`;
  }
  function statusChip(m) {
    if (!m.status) return '';
    const s = TX.mon.STATUS[m.status.id];
    return s ? `<span class="status" style="--c:${s.color}">${s.label.toUpperCase()}</span>` : '';
  }
  function monCard(m, extra = '') {
    const D = window.TX_DATA;
    const fainted = m.hp <= 0 ? ' fainted' : '';
    return `<div class="mon-card${fainted}">
      <img class="portrait" src="${TX.creatures.portrait(m.slug)}" alt="">
      <div class="mc-body">
        <div class="mc-top"><b>${TX.mon.displayName(m)}</b><span class="lv">Lv ${m.level}</span></div>
        <div class="mc-types">${typeChips(D.species[m.slug].types)} ${statusChip(m)}</div>
        ${hpBar(m)}
        <div class="mc-hp">${m.hp} / ${TX.mon.maxHp(m)} HP</div>
        ${extra}
      </div>
    </div>`;
  }

  function openPanel(html, cls = '') {
    const p = $('panel');
    p.className = 'panel ' + cls;
    p.innerHTML = html;
    p.hidden = false;
    return p;
  }
  function closePanel() {
    const p = $('panel');
    p.hidden = true;
    p.innerHTML = '';
  }

  // ---- party ------------------------------------------------------------------------------------
  // mode: 'view' | 'switch' (battle) | 'item' (pick target). Returns chosen index or null.
  async function party(state, { mode = 'view', title = 'Party', allowCancel = true } = {}) {
    const p = openPanel(`<div class="panel-head"><h2>${title}</h2><span class="hint">Arrows to choose &middot; E select &middot; Esc back</span></div><div class="party-grid" id="party-grid"></div>`, 'party');
    const grid = p.querySelector('#party-grid');
    let result = null;
    for (;;) {
      grid.innerHTML = '';
      const opts = state.party.map((m, i) => ({ html: monCard(m), value: i, cls: 'mon-btn' }));
      const i = await choose(opts, { container: grid, cancel: allowCancel, columns: 2, keepOpen: true });
      if (i === null) break;
      if (mode === 'switch' || mode === 'item') { result = i; break; }
      const act = await choose([
        { label: 'Summary', value: 'sum' },
        { label: 'Move to front', value: 'lead', disabled: i === 0 },
        { label: 'Back', value: null },
      ], { title: TX.mon.displayName(state.party[i]) });
      if (act === 'sum') await summary(state.party[i]);
      if (act === 'lead') {
        const [m] = state.party.splice(i, 1);
        state.party.unshift(m);
        TX.audio.sfx('select');
      }
    }
    closePanel();
    return result;
  }

  function summary(m) {
    const D = window.TX_DATA;
    const sp = D.species[m.slug];
    const stats = ['melee', 'armour', 'ranged', 'dodge', 'speed'];
    const next = TX.mon.expFor(m.level + 1), cur = TX.mon.expFor(m.level);
    const moves = m.moves.map((mv) => {
      const t = TX.mon.tech(mv.slug);
      return `<div class="move-row"><span class="chip" style="--c:${U.ELEMENT[t.types[0]].color}">${U.ELEMENT[t.types[0]].label}</span>
        <b>${TX.mon.techName(mv.slug)}</b><span>Pow ${t.power || '–'}</span><span>Acc ${Math.round((t.acc ?? 1) * 100)}%</span><span>Rech ${t.recharge || 1}</span><span class="muted">${t.range}</span></div>`;
    }).join('');
    const p = openPanel(`
      <div class="summary">
        <div class="sum-left">
          <img class="portrait big" src="${TX.creatures.portrait(m.slug)}" alt="">
          <h2>${TX.mon.displayName(m)} <span class="lv">Lv ${m.level}</span></h2>
          <div>${typeChips(sp.types)} ${statusChip(m)}</div>
          <div class="muted">Body shape: ${U.prettify(sp.shape)}${sp.evo ? ` &middot; evolves into ${U.prettify(sp.evo.to)} at Lv ${sp.evo.level}` : ''}</div>
          ${hpBar(m)}<div class="mc-hp">${m.hp} / ${TX.mon.maxHp(m)} HP</div>
          <div class="xpbar"><div class="xpfill" style="width:${(((m.exp - cur) / (next - cur)) * 100).toFixed(1)}%"></div></div>
          <div class="muted">${Math.max(0, next - m.exp)} EXP to next level</div>
        </div>
        <div class="sum-right">
          <h3>Stats</h3>
          ${stats.map((s) => `<div class="stat-row"><span>${U.prettify(s)}</span><div class="statbar"><div style="width:${Math.min(100, TX.mon.stat(m, s) / 1.6)}%"></div></div><b>${TX.mon.stat(m, s)}</b></div>`).join('')}
          <h3>Techniques</h3>${moves}
        </div>
      </div>
      <div class="hint center">Press E or Esc to close</div>`, 'summary-panel');
    return new Promise((resolve) => {
      const h = { onInput(a) { if (a === 'ok' || a === 'back' || a === 'menu') { pop(h); resolve(); } } };
      p.onclick = () => h.onInput('ok');
      push(h);
    });
  }

  // ---- bag -----------------------------------------------------------------------------------------
  // returns {item, target} or null. inBattle filters what can be used.
  async function bag(state, { inBattle = false, wild = false } = {}) {
    const ITEMS = TX.mon.ITEMS;
    for (;;) {
      const ids = Object.keys(state.bag).filter((k) => state.bag[k] > 0);
      if (!ids.length) { await say('Your bag is empty.'); return null; }
      const p = openPanel(`<div class="panel-head"><h2>Bag</h2><span class="hint">Money: ${state.money} &#x20AE;</span></div><div id="bag-list" class="bag-list"></div><div id="bag-desc" class="bag-desc"></div>`, 'bag');
      const opts = ids.map((id) => ({
        label: ITEMS[id].name, right: '&times;' + state.bag[id], value: id,
        disabled: ITEMS[id].use === 'ball' && !(inBattle && wild),
      }));
      const id = await choose(opts, {
        container: p.querySelector('#bag-list'), keepOpen: true,
        onFocus: (o) => (p.querySelector('#bag-desc').textContent = ITEMS[o.value].desc),
      });
      if (id === null) { closePanel(); return null; }
      if (ITEMS[id].use === 'ball') { closePanel(); return { item: id }; }
      closePanel();
      const t = await party(state, { mode: 'item', title: `Use ${ITEMS[id].name} on...` });
      if (t === null) continue;
      const res = TX.mon.useItem(id, state.party[t]);
      if (res.ok) {
        state.bag[id]--;
        TX.audio.sfx('heal');
      }
      if (inBattle) return { item: id, target: t, res };
      await say(res.text);
    }
  }

  // ---- shop -----------------------------------------------------------------------------------------
  async function shop(state) {
    const ITEMS = TX.mon.ITEMS;
    const stock = ['potion', 'super_potion', 'full_heal', 'revive', 'tuxeball', 'hyperball'];
    let start = 0;
    for (;;) {
      const p = openPanel(`<div class="panel-head"><h2>Shop</h2><span class="hint">Money: <b id="shop-money">${state.money}</b> &#x20AE;</span></div><div id="shop-list" class="bag-list"></div><div id="shop-desc" class="bag-desc"></div>`, 'bag');
      const opts = stock.map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].price + ' &#x20AE; &middot; have ' + (state.bag[id] || 0), value: id, disabled: state.money < ITEMS[id].price }));
      const id = await choose(opts, { container: p.querySelector('#shop-list'), keepOpen: true, start, onFocus: (o) => (p.querySelector('#shop-desc').textContent = ITEMS[o.value].desc) });
      if (id === null) break;
      start = stock.indexOf(id);
      state.money -= ITEMS[id].price;
      state.bag[id] = (state.bag[id] || 0) + 1;
      TX.audio.sfx('heal');
      toast(`Bought a ${ITEMS[id].name}.`);
    }
    closePanel();
  }

  // ---- tuxepedia ----------------------------------------------------------------------------------
  function dex(state) {
    const D = window.TX_DATA;
    const all = Object.keys(D.species);
    const caught = all.filter((s) => state.caught[s]).length;
    const seen = all.filter((s) => state.seen[s]).length;
    const cells = all.map((s) => {
      if (!state.seen[s]) return `<div class="dex-cell unknown"><div class="q">?</div><span>???</span></div>`;
      return `<div class="dex-cell${state.caught[s] ? ' caught' : ''}"><img src="${TX.creatures.portrait(s)}" alt=""><span>${U.prettify(s)}</span><div class="dex-types">${typeChips(D.species[s].types)}</div></div>`;
    }).join('');
    const p = openPanel(`<div class="panel-head"><h2>Tuxepedia</h2><span class="hint">Seen ${seen} &middot; Caught ${caught} / ${all.length}</span></div><div class="dex-grid">${cells}</div><div class="hint center">Esc to close</div>`, 'dex');
    return new Promise((resolve) => {
      const h = { onInput(a) { if (a === 'ok' || a === 'back' || a === 'menu') { pop(h); closePanel(); resolve(); } } };
      push(h);
    });
  }

  // ---- settings ------------------------------------------------------------------------------------
  async function settings() {
    for (;;) {
      const q = TX.engine.quality;
      const v = await choose([
        { label: 'Graphics quality', right: q.toUpperCase(), value: 'q' },
        { label: 'Day length', right: TX.game.state.daySpeed === 0 ? 'FROZEN' : TX.game.state.daySpeed + ' min', value: 'day' },
        { label: 'Sound', right: 'M to toggle', value: 'snd' },
        { label: 'Back', value: null },
      ], { title: 'Settings' });
      if (v === null) return;
      if (v === 'q') {
        const order = ['low', 'medium', 'high', 'ultra'];
        TX.engine.setQuality(order[(order.indexOf(q) + 1) % order.length]);
      }
      if (v === 'day') {
        const order = [6, 12, 24, 0];
        const s = TX.game.state;
        s.daySpeed = order[(order.indexOf(s.daySpeed) + 1) % order.length];
      }
      if (v === 'snd') toast(TX.audio.toggleMute() ? 'Sound off' : 'Sound on');
    }
  }

  // ---- HUD -------------------------------------------------------------------------------------------
  function renderHud(state, areaName, clock) {
    $('hud-area-name').textContent = areaName;
    $('hud-clock').textContent = clock;
    const hp = $('hud-party');
    const sig = state.party.map((m) => m.slug + m.hp + m.level).join('|');
    if (hp.dataset.sig === sig) return;
    hp.dataset.sig = sig;
    hp.innerHTML = state.party.map((m) => `<div class="hud-mon${m.hp <= 0 ? ' fainted' : ''}" title="${TX.mon.displayName(m)}"><img src="${TX.creatures.portrait(m.slug)}" alt=""><span>${m.level}</span>${hpBar(m, 'mini')}</div>`).join('');
  }

  return { push, pop, busy, update, say, choose, toast, banner, fade, party, summary, bag, shop, dex, settings, renderHud, typeChips, hpBar, statusChip, monCard, openPanel, closePanel };
})();
