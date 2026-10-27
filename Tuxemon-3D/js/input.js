// Keyboard input: held directions plus one-shot action presses.
'use strict';

TX.input = (() => {
  const held = new Set();
  const queue = [];
  const MAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    Enter: 'ok', Space: 'ok', KeyE: 'ok', KeyZ: 'ok',
    Escape: 'menu', Backspace: 'back', KeyX: 'back', KeyQ: 'back',
    ShiftLeft: 'run', ShiftRight: 'run',
    KeyM: 'mute',
  };

  window.addEventListener('keydown', (e) => {
    const a = MAP[e.code];
    if (!a) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    TX.audio.resume();
    if (!e.repeat) queue.push(a);
    held.add(a);
  });
  window.addEventListener('keyup', (e) => {
    const a = MAP[e.code];
    if (a) held.delete(a);
  });
  window.addEventListener('blur', () => held.clear());
  window.addEventListener('pointerdown', () => TX.audio.resume());

  // Directions also repeat while held (for menus)
  function take(action) {
    const i = queue.indexOf(action);
    if (i >= 0) {
      queue.splice(i, 1);
      return true;
    }
    return false;
  }
  function next() {
    return queue.shift();
  }
  function clear() {
    queue.length = 0;
  }
  function direction() {
    for (const d of ['up', 'down', 'left', 'right']) if (held.has(d)) return d;
    return null;
  }
  // allow on-screen buttons / clicks to inject actions
  function push(a) {
    queue.push(a);
  }

  return { held, take, next, clear, direction, push };
})();
