// Shared helpers: namespace, seeded random, math, tweens, naming, colors.
'use strict';
const TX = (window.TX = window.TX || {});

TX.util = (() => {
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rng(seed) {
    let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
    const next = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.range = (lo, hi) => lo + (hi - lo) * next();
    next.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * next());
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    next.chance = (p) => next() < p;
    return next;
  }

  // 2D value noise for terrain and textures
  function makeNoise(seed) {
    const r = rng(seed);
    const perm = new Uint8Array(512);
    const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const val = new Float32Array(256).map(() => r());
    const n2 = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const u = smooth(xf), v = smooth(yf);
      const h = (i, j) => val[perm[(perm[(xi + i) & 255] + yi + j) & 255]];
      return lerp(lerp(h(0, 0), h(1, 0), u), lerp(h(0, 1), h(1, 1), u), v);
    };
    n2.fbm = (x, y, oct = 4) => {
      let s = 0, a = 0.5, f = 1, t = 0;
      for (let i = 0; i < oct; i++) {
        s += a * n2(x * f, y * f);
        t += a;
        a *= 0.5;
        f *= 2;
      }
      return s / t;
    };
    return n2;
  }

  // Tiny tween manager driven by the game loop
  const tweens = [];
  function tween(duration, onUpdate, ease = easeInOut) {
    return new Promise((resolve) => {
      tweens.push({ t: 0, duration, onUpdate, ease, resolve });
    });
  }
  function wait(seconds) {
    return tween(seconds, () => {});
  }
  function updateTweens(dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.duration);
      tw.onUpdate(tw.ease(k), k);
      if (k >= 1) {
        tweens.splice(i, 1);
        tw.resolve();
      }
    }
  }

  const prettify = (slug) =>
    slug
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Element colors used for chips, VFX and creature palettes
  const ELEMENT = {
    normal: { color: '#c9b79c', glow: '#fff4dc', label: 'Normal' },
    fire: { color: '#ff6a2b', glow: '#ffb347', label: 'Fire' },
    water: { color: '#2f9bff', glow: '#8fd3ff', label: 'Water' },
    wood: { color: '#3fbf5a', glow: '#b6f27a', label: 'Wood' },
    earth: { color: '#b07a45', glow: '#e3b27a', label: 'Earth' },
    metal: { color: '#9aa7b8', glow: '#e8f1ff', label: 'Metal' },
    sky: { color: '#7fc8ff', glow: '#e0f5ff', label: 'Sky' },
    frost: { color: '#86e3f5', glow: '#e9fdff', label: 'Frost' },
    lightning: { color: '#ffd23f', glow: '#fff6a8', label: 'Lightning' },
    shadow: { color: '#6a4c93', glow: '#c39bff', label: 'Shadow' },
    cosmic: { color: '#c46bff', glow: '#ffb3f4', label: 'Cosmic' },
    venom: { color: '#9b59b6', glow: '#d8a3ff', label: 'Venom' },
    heroic: { color: '#ff4f6d', glow: '#ffc1cc', label: 'Heroic' },
  };

  const $ = (id) => document.getElementById(id);
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  return {
    clamp, lerp, smooth, easeOut, easeInOut, easeOutBack, hashString, rng, makeNoise,
    tween, wait, updateTweens, prettify, ELEMENT, $, el,
  };
})();
