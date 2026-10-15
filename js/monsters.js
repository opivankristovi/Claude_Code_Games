// Monster instances and the battle rules (stats, damage, statuses, catching, items).
'use strict';

TX.mon = (() => {
  const U = TX.util;
  const D = window.TX_DATA;

  const STRUGGLE = { types: ['normal'], power: 1, acc: 1, recharge: 1, range: 'melee', potency: 0, effects: [['damage']], stats: {}, tags: [] };
  const tech = (slug) => (slug === 'struggle' ? STRUGGLE : D.techniques[slug]);
  const techName = (slug) => U.prettify(slug);
  const name = (slug) => U.prettify(slug);

  let uidSeq = Date.now() % 100000;

  function movesAt(slug, level) {
    const sp = D.species[slug];
    const learned = sp.moves.filter(([l]) => l <= level).map(([, t]) => t);
    const uniq = [...new Set(learned)];
    const pick = uniq.slice(-4);
    if (!pick.length) pick.push('struggle');
    return pick.map((t) => ({ slug: t, cd: 0 }));
  }

  function create(slug, level, opts = {}) {
    const m = {
      uid: ++uidSeq,
      slug,
      level,
      exp: Math.pow(level, 3),
      moves: movesAt(slug, level),
      status: null,
      nick: opts.nick || null,
    };
    m.hp = maxHp(m);
    return m;
  }

  const attrs = (m) => D.shapes[D.species[m.slug].shape] || D.shapes.blob;
  function maxHp(m) {
    return Math.floor(attrs(m).hp * (m.level + 7) * 1.1) + 12;
  }
  function stat(m, key) {
    return Math.floor(attrs(m)[key] * (m.level + 6) * 0.9) + 5;
  }
  const expFor = (level) => Math.pow(level, 3);

  // ---- battle-only state ---------------------------------------------------------
  function battler(m) {
    return {
      m,
      stages: { melee: 0, armour: 0, ranged: 0, dodge: 0, speed: 0, acc: 0 },
      charged: false,
      flinch: false,
      sleep: 0,
    };
  }
  const stageMul = (s) => (s >= 0 ? 1 + 0.25 * s : 1 / (1 - 0.25 * s));
  function eff(b, key) {
    let v = stat(b.m, key) * stageMul(b.stages[key] || 0);
    if (key === 'speed' && b.m.status && b.m.status.id === 'slow') v *= 0.5;
    return v;
  }

  function typeMult(moveTypes, targetSlug) {
    const defTypes = D.species[targetSlug].types;
    let k = 1;
    const at = moveTypes[0] || 'normal';
    for (const dt of defTypes) {
      const row = D.elements[at];
      if (row && row[dt] !== undefined) k *= row[dt];
    }
    return k;
  }

  function attackStats(range) {
    switch (range) {
      case 'ranged': return [['ranged'], ['dodge']];
      case 'reach': return [['melee', 'ranged'], ['armour', 'dodge']];
      case 'special': return [['melee', 'ranged'], ['armour', 'dodge']];
      default: return [['melee'], ['armour']];
    }
  }

  function estimate(user, target, slug) {
    const t = tech(slug);
    if (!t.effects.some((e) => e[0] === 'damage' || e[0] === 'multiattack')) return 0;
    const [a, d] = attackStats(t.range);
    const atk = a.reduce((s, k) => s + eff(user, k), 0) / a.length;
    const def = d.reduce((s, k) => s + eff(target, k), 0) / d.length;
    const stab = D.species[user.m.slug].types.includes(t.types[0]) ? 1.25 : 1;
    return t.power * (user.m.level + 6) * 1.15 * (atk / def) * typeMult(t.types, target.m.slug) * stab;
  }

  const STATUS = {
    burn: { label: 'burned', color: '#ff6a2b', dot: 0.1, turns: 4 },
    poison: { label: 'poisoned', color: '#9b59b6', dot: 0.1, turns: 5 },
    festering: { label: 'festering', color: '#7cb342', dot: 0.08, turns: 5 },
    noddingoff: { label: 'drowsy', color: '#90caf9', sleep: 0.6, turns: 3 },
    confused: { label: 'confused', color: '#f48fb1', confuse: 0.33, turns: 3 },
    slow: { label: 'slowed', color: '#80deea', turns: 4 },
    blinded: { label: 'blinded', color: '#616161', acc: 0.6, turns: 3 },
  };
  const BUFFS = {
    enraged: { melee: 2 }, hardshell: { armour: 2 }, elementalshield: { dodge: 1, armour: 1 }, focused: { acc: 2 },
    diehard: { armour: 1 }, revenge: { melee: 1 }, sniping: { ranged: 2 }, wild: { melee: 1, speed: 1 },
  };

  // Executes a technique and returns a list of events for the presentation layer.
  // events: {type:'text'|'damage'|'heal'|'miss'|'status'|'stat'|'faint'|'effective', ...}
  function useTechnique(user, target, slug, rand = Math.random) {
    const t = tech(slug);
    const ev = [];
    const who = (b) => displayName(b.m);
    ev.push({ type: 'text', text: `${who(user)} used ${techName(slug)}!`, fx: { slug, types: t.types, range: t.range, user, target } });

    // statuses that can stop the action
    if (user.m.status && user.m.status.id === 'noddingoff' && rand() < STATUS.noddingoff.sleep) {
      ev.splice(0, 1, { type: 'text', text: `${who(user)} is too drowsy to move...` });
      return ev;
    }
    if (user.flinch) {
      user.flinch = false;
      ev.splice(0, 1, { type: 'text', text: `${who(user)} flinched!` });
      return ev;
    }
    if (user.m.status && user.m.status.id === 'confused' && rand() < STATUS.confused.confuse) {
      ev.splice(0, 1, { type: 'text', text: `${who(user)} is confused and hurt itself!` });
      const dmg = Math.max(1, Math.floor(maxHp(user.m) * 0.08));
      ev.push(applyDamage(user, dmg, 1));
      return ev;
    }
    const mv = user.m.moves.find((x) => x.slug === slug);
    if (mv) mv.cd = Math.max(0, (t.recharge || 1) - 1);

    let accuracy = (t.acc ?? 1) * stageMul(user.stages.acc);
    if (user.m.status && user.m.status.id === 'blinded') accuracy *= STATUS.blinded.acc;
    accuracy /= 1 + Math.max(0, target.stages.dodge) * 0.08;

    let hits = 1;
    for (const e of t.effects) if (e[0] === 'multiattack') hits = U.rng(Math.floor(rand() * 1e9)).int(1, Number(e[1]) || 2);
    let dealt = 0;
    const damaging = t.effects.some((e) => e[0] === 'damage' || e[0] === 'multiattack');

    if (damaging) {
      let landed = 0;
      for (let h = 0; h < hits; h++) {
        if (target.m.hp <= 0) break;
        if (rand() > accuracy) {
          if (landed === 0) ev.push({ type: 'miss', text: `${who(user)}'s attack missed!` });
          break;
        }
        const crit = rand() < 0.0625;
        let dmg = estimate(user, target, slug) * U.lerp(0.85, 1, rand()) * (crit ? 1.5 : 1);
        if (user.charged) { dmg *= 1.5; user.charged = false; }
        dmg = Math.max(1, Math.round(dmg));
        const mult = typeMult(t.types, target.m.slug);
        const e = applyDamage(target, dmg, mult);
        e.crit = crit;
        ev.push(e);
        dealt += e.amount;
        landed++;
      }
      if (landed > 1) ev.push({ type: 'text', text: `Hit ${landed} times!` });
      if (landed > 0) {
        const mult = typeMult(t.types, target.m.slug);
        if (mult > 1) ev.push({ type: 'effective', text: "It's super effective!" });
        else if (mult < 1 && mult > 0) ev.push({ type: 'effective', text: "It's not very effective..." });
        if (ev.some((x) => x.crit)) ev.push({ type: 'text', text: 'A critical hit!' });
      } else {
        return ev;
      }
    }

    // secondary effects
    for (const e of t.effects) {
      const [kind, p1, p2] = e;
      if (kind === 'give') {
        const onSelf = p2 === 'own_monster';
        const tgt = onSelf ? user : target;
        if (tgt.m.hp <= 0) continue;
        const chance = damaging ? (t.potency || 0.3) : 1;
        if (rand() > chance) continue;
        if (STATUS[p1]) {
          if (!tgt.m.status) {
            tgt.m.status = { id: p1, turns: STATUS[p1].turns };
            ev.push({ type: 'status', target: tgt, id: p1, text: `${who(tgt)} is ${STATUS[p1].label}!` });
          }
        } else if (BUFFS[p1]) {
          for (const [k, v] of Object.entries(BUFFS[p1])) tgt.stages[k] = U.clamp(tgt.stages[k] + v, -4, 4);
          ev.push({ type: 'stat', target: tgt, up: true, text: `${who(tgt)} is ${U.prettify(p1).toLowerCase()}!` });
        } else if (p1 === 'chargedup') {
          tgt.charged = true;
          ev.push({ type: 'stat', target: tgt, up: true, text: `${who(tgt)} is charging up!` });
        } else if (p1 === 'recover') {
          ev.push(applyHeal(tgt, Math.floor(maxHp(tgt.m) * 0.25)));
        } else if (p1 === 'lifeleech' && dealt > 0) {
          ev.push(applyHeal(user, Math.floor(dealt * 0.4)));
        } else if (p1 === 'flinching') {
          tgt.flinch = true;
        } else if (p1 === 'grabbed') {
          if (!tgt.m.status) { tgt.m.status = { id: 'slow', turns: 3 }; ev.push({ type: 'status', target: tgt, id: 'slow', text: `${who(tgt)} is held tight!` }); }
        }
      } else if (kind === 'statchange') {
        const tgt = p1 === 'enemy_monster' ? target : user;
        const stats = t.stats || {};
        let up = null;
        for (const [k, v] of Object.entries(stats)) {
          const key = k === 'hp' ? 'armour' : k;
          if (!(key in tgt.stages)) continue;
          const step = v.step ?? (v.value > 1 ? 1 : v.value < 1 ? -1 : 0);
          tgt.stages[key] = U.clamp(tgt.stages[key] + step, -4, 4);
          up = step > 0;
          ev.push({ type: 'stat', target: tgt, up, text: `${who(tgt)}'s ${key === 'acc' ? 'accuracy' : key} ${step > 0 ? 'rose' : 'fell'}!` });
        }
      } else if (kind === 'healing') {
        ev.push(applyHeal(user, Math.floor(maxHp(user.m) * 0.2 * Math.max(1, t.power || 1))));
      } else if (kind === 'prop_healing') {
        ev.push(applyHeal(user, Math.floor(maxHp(user.m) * (t.potency || 0.3))));
      } else if (kind === 'prop_damage' && p1 === 'enemy_monster' && !damaging) {
        if (rand() <= accuracy) ev.push(applyDamage(target, Math.max(1, Math.floor(target.m.hp * (t.potency || 0.25))), 1));
        else ev.push({ type: 'miss', text: `${who(user)}'s attack missed!` });
      }
    }
    return ev;
  }

  function applyDamage(b, amount, mult) {
    amount = Math.min(amount, b.m.hp);
    b.m.hp -= amount;
    return { type: 'damage', target: b, amount, mult };
  }
  function applyHeal(b, amount) {
    const mh = maxHp(b.m);
    amount = Math.min(amount, mh - b.m.hp);
    b.m.hp += amount;
    return { type: 'heal', target: b, amount, text: amount > 0 ? `${displayName(b.m)} recovered ${amount} HP.` : `${displayName(b.m)}'s HP is full.` };
  }

  // end-of-turn status ticks
  function endTurn(b) {
    const ev = [];
    for (const mv of b.m.moves) if (mv.cd > 0) mv.cd--;
    const s = b.m.status;
    if (!s || b.m.hp <= 0) return ev;
    const def = STATUS[s.id];
    if (def && def.dot) {
      const dmg = Math.max(1, Math.floor(maxHp(b.m) * def.dot));
      const e = applyDamage(b, dmg, 1);
      e.text = `${displayName(b.m)} is hurt by its ${def.label === 'burned' ? 'burn' : def.label} status.`;
      e.dot = s.id;
      ev.push(e);
    }
    s.turns--;
    if (s.turns <= 0) {
      ev.push({ type: 'text', text: `${displayName(b.m)} is no longer ${def ? def.label : s.id}.` });
      b.m.status = null;
    }
    return ev;
  }

  function usableMoves(m) {
    const ok = m.moves.filter((x) => x.cd === 0);
    return ok.length ? ok : [{ slug: 'struggle', cd: 0 }];
  }

  function chooseAI(user, target, smart) {
    const moves = usableMoves(user.m);
    if (!smart && Math.random() < 0.3) return U.rng(Math.random() * 1e9).pick(moves).slug;
    let best = moves[0].slug, bestV = -1;
    for (const mv of moves) {
      let v = estimate(user, target, mv.slug);
      const t = tech(mv.slug);
      if (v === 0) v = t.effects.some((e) => e[0] === 'give' || e[0] === 'statchange') ? (smart ? 8 : 14) * Math.random() : 1;
      if (v > bestV) { bestV = v; best = mv.slug; }
    }
    return best;
  }

  function displayName(m) {
    return m.nick || name(m.slug);
  }

  // ---- experience & evolution ---------------------------------------------------------
  function expGain(enemy, trainer) {
    return Math.floor((enemy.level * enemy.level * 3 + 20) * (trainer ? 1.5 : 1));
  }
  // returns list of events: {type:'level', level} {type:'learn', slug} {type:'evolve', to}
  function addExp(m, amount) {
    const ev = [];
    if (m.level >= 60) return ev;
    m.exp += amount;
    while (m.level < 60 && m.exp >= expFor(m.level + 1)) {
      const oldMax = maxHp(m);
      m.level++;
      m.hp += maxHp(m) - oldMax;
      ev.push({ type: 'level', level: m.level });
      const sp = D.species[m.slug];
      for (const [l, t] of sp.moves) {
        if (l === m.level && !m.moves.some((x) => x.slug === t)) {
          if (m.moves.length >= 4) {
            const old = m.moves.shift();
            ev.push({ type: 'forget', slug: old.slug });
          }
          m.moves.push({ slug: t, cd: 0 });
          ev.push({ type: 'learn', slug: t });
        }
      }
    }
    const sp = D.species[m.slug];
    if (sp.evo && m.level >= sp.evo.level) ev.push({ type: 'evolve', to: sp.evo.to });
    return ev;
  }
  function evolve(m, to) {
    const frac = m.hp / maxHp(m);
    m.slug = to;
    m.hp = Math.max(1, Math.round(maxHp(m) * frac));
    const extra = D.species[to].moves.filter(([l]) => l <= m.level).map(([, t]) => t);
    for (const t of extra.slice(-1)) if (!m.moves.some((x) => x.slug === t)) {
      if (m.moves.length >= 4) m.moves.shift();
      m.moves.push({ slug: t, cd: 0 });
    }
  }

  // ---- catching & items ----------------------------------------------------------------------
  const ITEMS = {
    potion: { name: 'Potion', desc: 'Restores 35 HP.', price: 100, heal: 35, use: 'heal' },
    super_potion: { name: 'Super Potion', desc: 'Restores 90 HP.', price: 300, heal: 90, use: 'heal' },
    revive: { name: 'Revive', desc: 'Revives a fainted Tuxemon to half HP.', price: 600, use: 'revive' },
    full_heal: { name: 'Antidote', desc: 'Cures any status condition.', price: 150, use: 'cure' },
    tuxeball: { name: 'Tuxeball', desc: 'A device for catching wild Tuxemon.', price: 150, ball: 1, use: 'ball' },
    hyperball: { name: 'Hyperball', desc: 'A high-performance Tuxeball.', price: 450, ball: 1.8, use: 'ball' },
  };

  function catchChance(m, ballMod) {
    const sp = D.species[m.slug];
    const rate = U.clamp((sp.catch || 100) / 255, 0.08, 1);
    const hpFrac = m.hp / maxHp(m);
    const statusBonus = m.status ? 1.4 : 1;
    return U.clamp(rate * (1.6 - hpFrac * 1.2) * statusBonus * ballMod * 0.9, 0.04, 0.97);
  }

  function useItem(id, m) {
    const it = ITEMS[id];
    if (it.use === 'heal') {
      if (m.hp <= 0) return { ok: false, text: `${displayName(m)} has fainted. Use a Revive.` };
      const before = m.hp;
      m.hp = Math.min(maxHp(m), m.hp + it.heal);
      if (m.hp === before) return { ok: false, text: `${displayName(m)}'s HP is already full.` };
      return { ok: true, text: `${displayName(m)} recovered ${m.hp - before} HP.`, heal: m.hp - before };
    }
    if (it.use === 'revive') {
      if (m.hp > 0) return { ok: false, text: `${displayName(m)} hasn't fainted.` };
      m.hp = Math.floor(maxHp(m) / 2);
      return { ok: true, text: `${displayName(m)} was revived!`, heal: m.hp };
    }
    if (it.use === 'cure') {
      if (!m.status) return { ok: false, text: `${displayName(m)} is perfectly healthy.` };
      m.status = null;
      return { ok: true, text: `${displayName(m)} feels great again.` };
    }
    return { ok: false, text: 'That can\'t be used here.' };
  }

  function healAll(party) {
    for (const m of party) {
      m.hp = maxHp(m);
      m.status = null;
      for (const mv of m.moves) mv.cd = 0;
    }
  }

  return {
    tech, techName, name, displayName, create, maxHp, stat, expFor, battler, eff, typeMult, estimate,
    useTechnique, endTurn, usableMoves, chooseAI, expGain, addExp, evolve, ITEMS, catchChance, useItem,
    healAll, STATUS, movesAt,
  };
})();
