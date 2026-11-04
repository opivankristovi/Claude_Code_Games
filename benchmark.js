const { performance } = require('perf_hooks');

function benchmarkSplice(n) {
  let puddles = Array.from({length: n}, (_, i) => ({ id: i }));
  const start = performance.now();
  for (let i = puddles.length - 1; i >= 0; i--) {
    puddles.splice(i, 1);
  }
  const end = performance.now();
  return end - start;
}

function benchmarkSwapPop(n) {
  let puddles = Array.from({length: n}, (_, i) => ({ id: i }));
  const start = performance.now();
  for (let i = puddles.length - 1; i >= 0; i--) {
    if (i !== puddles.length - 1) {
      puddles[i] = puddles[puddles.length - 1];
    }
    puddles.pop();
  }
  const end = performance.now();
  return end - start;
}

const n = 100000;
const spliceTime = benchmarkSplice(n);
const swapPopTime = benchmarkSwapPop(n);

console.log(`Splice time: ${spliceTime.toFixed(4)} ms`);
console.log(`Swap & Pop time: ${swapPopTime.toFixed(4)} ms`);
console.log(`Improvement: ${((spliceTime - swapPopTime) / spliceTime * 100).toFixed(2)}%`);
