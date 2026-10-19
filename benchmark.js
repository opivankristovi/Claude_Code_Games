const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
  <!DOCTYPE html>
  <body>
    <ol id="tasklist">
      <li class="done"><span class="td"></span></li>
      <li class="done"><span class="td"></span></li>
      <li class="cur"><span class="td"></span></li>
      <li class="todo"><span class="td"></span></li>
    </ol>
  </body>
`);
const document = dom.window.document;

const N = 100000;

let start = performance.now();
for (let i = 0; i < N; i++) {
  const cur = document.querySelector('#tasklist li.cur .td');
  if (cur) cur.textContent = 'test';
}
let time1 = performance.now() - start;

start = performance.now();
const curCached = document.querySelector('#tasklist li.cur .td');
for (let i = 0; i < N; i++) {
  if (curCached) curCached.textContent = 'test';
}
let time2 = performance.now() - start;

console.log(`Baseline (document.querySelector): ${time1.toFixed(2)} ms`);
console.log(`Optimized (cached): ${time2.toFixed(2)} ms`);
