// Procedural music and sound effects with the Web Audio API.
'use strict';

TX.audio = (() => {
  let ctx = null, master = null, musicBus = null, sfxBus = null;
  let muted = false;
  let track = null; // { name, timer, step }

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.32;
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.6;
    // soft room reverb on music
    const conv = ctx.createConvolver();
    conv.buffer = impulse(1.8);
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    musicBus.connect(master);
    musicBus.connect(conv);
    conv.connect(wet);
    wet.connect(master);
    sfxBus.connect(master);
    return ctx;
  }

  function impulse(seconds) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    return buf;
  }

  function resume() {
    if (ensure() && ctx.state === 'suspended') ctx.resume();
  }

  const freq = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function note(bus, midi, t, dur, type = 'triangle', vol = 0.2, attack = 0.01) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq(midi);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(bus, t, dur, vol = 0.2, filterFreq = 2000, type = 'bandpass') {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(bus);
    src.start(t);
  }

  // --- music -------------------------------------------------------------
  // Each song: tempo, chord progression (root midi + quality), melody pattern.
  const SONGS = {
    town: {
      bpm: 96,
      chords: [[60, 'maj'], [57, 'min'], [65, 'maj'], [67, 'maj']],
      melody: [76, 79, 81, 79, 76, 74, 72, 74, 76, 0, 79, 81, 84, 81, 79, 76],
      lead: 'triangle', bass: 'sine', pad: 0.05,
    },
    route: {
      bpm: 112,
      chords: [[62, 'maj'], [59, 'min'], [67, 'maj'], [69, 'maj']],
      melody: [74, 78, 81, 78, 83, 81, 78, 76, 74, 76, 78, 81, 78, 76, 74, 0],
      lead: 'square', bass: 'triangle', pad: 0.04,
    },
    woods: {
      bpm: 84,
      chords: [[57, 'min'], [53, 'maj'], [60, 'maj'], [55, 'maj']],
      melody: [69, 72, 76, 74, 72, 69, 67, 0, 69, 72, 76, 79, 77, 76, 72, 0],
      lead: 'sine', bass: 'sine', pad: 0.07,
    },
    battle: {
      bpm: 150,
      chords: [[57, 'min'], [53, 'maj'], [55, 'maj'], [52, 'maj']],
      melody: [81, 0, 81, 79, 81, 84, 81, 79, 77, 0, 77, 76, 77, 79, 76, 72],
      lead: 'sawtooth', bass: 'square', pad: 0.03, drums: true,
    },
    victory: {
      bpm: 132,
      chords: [[60, 'maj'], [65, 'maj'], [67, 'maj'], [60, 'maj']],
      melody: [72, 76, 79, 84, 79, 84, 88, 0, 86, 84, 83, 84, 79, 76, 72, 0],
      lead: 'square', bass: 'triangle', pad: 0.04,
    },
    title: {
      bpm: 88,
      chords: [[60, 'maj'], [64, 'min'], [65, 'maj'], [67, 'sus']],
      melody: [79, 0, 76, 79, 84, 0, 83, 79, 77, 0, 76, 77, 79, 0, 0, 0],
      lead: 'triangle', bass: 'sine', pad: 0.08,
    },
  };
  const QUAL = { maj: [0, 4, 7], min: [0, 3, 7], sus: [0, 5, 7] };

  function play(name) {
    if (!ensure()) return;
    if (track && track.name === name) return;
    stop();
    const song = SONGS[name];
    if (!song) return;
    const stepDur = 60 / song.bpm / 2; // eighth notes
    let step = 0;
    let nextTime = ctx.currentTime + 0.1;
    const t = { name, timer: null };
    const schedule = () => {
      while (nextTime < ctx.currentTime + 0.25) {
        const bar = Math.floor(step / 8) % song.chords.length;
        const [root, q] = song.chords[bar];
        const s = step % 8;
        if (s === 0) {
          // pad chord
          for (const iv of QUAL[q]) note(musicBus, root + iv, nextTime, stepDur * 8, 'sine', song.pad, 0.3);
          note(musicBus, root - 24, nextTime, stepDur * 3, song.bass, 0.22);
        }
        if (s === 4) note(musicBus, root - 24 + 7, nextTime, stepDur * 3, song.bass, 0.16);
        if (song.drums) {
          if (s % 4 === 0) noise(musicBus, nextTime, 0.12, 0.25, 120, 'lowpass');
          if (s % 4 === 2) noise(musicBus, nextTime, 0.08, 0.12, 4000, 'highpass');
        }
        const m = song.melody[step % song.melody.length];
        if (m) note(musicBus, m, nextTime, stepDur * 1.8, song.lead, song.lead === 'sawtooth' || song.lead === 'square' ? 0.05 : 0.11);
        // gentle arpeggio
        const arp = QUAL[q][s % 3] + root + 12;
        if (s % 2 === 1) note(musicBus, arp, nextTime, stepDur * 1.2, 'sine', 0.04);
        nextTime += stepDur;
        step++;
      }
    };
    t.timer = setInterval(schedule, 60);
    schedule();
    track = t;
  }

  function stop() {
    if (track) clearInterval(track.timer);
    track = null;
  }

  // --- sfx ------------------------------------------------------------------
  function sfx(name) {
    if (!ensure() || muted) return;
    const t = ctx.currentTime;
    switch (name) {
      case 'select': note(sfxBus, 84, t, 0.08, 'square', 0.06); break;
      case 'move': note(sfxBus, 76, t, 0.05, 'square', 0.04); break;
      case 'back': note(sfxBus, 72, t, 0.08, 'square', 0.05); break;
      case 'talk': note(sfxBus, 79 + Math.floor(Math.random() * 3), t, 0.03, 'square', 0.025); break;
      case 'bump': note(sfxBus, 40, t, 0.08, 'triangle', 0.15); break;
      case 'encounter':
        for (let i = 0; i < 6; i++) note(sfxBus, 72 + i * 3, t + i * 0.05, 0.12, 'square', 0.06);
        break;
      case 'hit':
        noise(sfxBus, t, 0.18, 0.5, 900);
        note(sfxBus, 45, t, 0.15, 'sawtooth', 0.15);
        break;
      case 'crit':
        noise(sfxBus, t, 0.3, 0.6, 1400);
        note(sfxBus, 40, t, 0.3, 'sawtooth', 0.2);
        break;
      case 'weak': note(sfxBus, 55, t, 0.12, 'triangle', 0.12); break;
      case 'miss': noise(sfxBus, t, 0.25, 0.15, 3000, 'highpass'); break;
      case 'faint':
        for (let i = 0; i < 5; i++) note(sfxBus, 64 - i * 4, t + i * 0.09, 0.2, 'triangle', 0.12);
        break;
      case 'heal':
        for (let i = 0; i < 5; i++) note(sfxBus, 72 + [0, 4, 7, 12, 16][i], t + i * 0.08, 0.3, 'sine', 0.12);
        break;
      case 'levelup':
        [72, 76, 79, 84, 79, 84].forEach((n, i) => note(sfxBus, n, t + i * 0.09, 0.25, 'square', 0.06));
        break;
      case 'throw': noise(sfxBus, t, 0.35, 0.2, 2500, 'bandpass'); break;
      case 'wobble': note(sfxBus, 60, t, 0.1, 'triangle', 0.15); note(sfxBus, 55, t + 0.1, 0.1, 'triangle', 0.12); break;
      case 'caught':
        [79, 83, 86, 91].forEach((n, i) => note(sfxBus, n, t + i * 0.12, 0.4, 'triangle', 0.12));
        break;
      case 'breakout': noise(sfxBus, t, 0.3, 0.4, 1800); break;
      case 'fire': noise(sfxBus, t, 0.6, 0.35, 700, 'lowpass'); break;
      case 'water': noise(sfxBus, t, 0.5, 0.3, 1600); note(sfxBus, 70, t, 0.2, 'sine', 0.1); break;
      case 'zap':
        for (let i = 0; i < 6; i++) note(sfxBus, 90 - i * 5, t + i * 0.025, 0.05, 'sawtooth', 0.06);
        break;
      case 'wind': noise(sfxBus, t, 0.7, 0.25, 900, 'bandpass'); break;
      case 'evolve':
        for (let i = 0; i < 12; i++) note(sfxBus, 60 + i * 2, t + i * 0.12, 0.3, 'sine', 0.1);
        break;
      default: note(sfxBus, 70, t, 0.08, 'square', 0.05);
    }
  }

  function toggleMute() {
    if (!ensure()) return false;
    muted = !muted;
    master.gain.value = muted ? 0 : 0.7;
    return muted;
  }

  return { resume, play, stop, sfx, toggleMute };
})();
