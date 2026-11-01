const { performance } = require('perf_hooks');

function benchSplice(count) {
  let ripples = [];
  for (let i = 0; i < count; i++) {
    ripples.push({ t: Math.random() * 2 }); // some will be removed
  }
  const start = performance.now();
  for (let j = 0; j < 1000; j++) {
    let copy = [...ripples];
    for (let i = copy.length - 1; i >= 0; i--) {
      const r = copy[i];
      if (r.t >= 1) {
        copy.splice(i, 1);
      }
    }
  }
  return performance.now() - start;
}

function benchSwap(count) {
  let ripples = [];
  for (let i = 0; i < count; i++) {
    ripples.push({ t: Math.random() * 2 });
  }
  const start = performance.now();
  for (let j = 0; j < 1000; j++) {
    let copy = [...ripples];
    for (let i = copy.length - 1; i >= 0; i--) {
      const r = copy[i];
      if (r.t >= 1) {
        const last = copy.pop();
        if (i < copy.length) {
          copy[i] = last;
        }
      }
    }
  }
  return performance.now() - start;
}

const n = 10000;
console.log(`Array size: ${n}`);
console.log(`Splice time: ${benchSplice(n).toFixed(2)} ms`);
console.log(`Swap time:   ${benchSwap(n).toFixed(2)} ms`);
