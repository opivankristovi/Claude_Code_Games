const { JSDOM } = require('jsdom');

const N = 1000;

function createDOM() {
  return new JSDOM(`
    <!DOCTYPE html>
    <body>
      <div id="langswitch">
        <button data-lang="en">EN</button>
        <button data-lang="es">ES</button>
        <button data-lang="fr">FR</button>
      </div>
      <div id="chars">
        <button data-d="1">Dog 1</button>
        <button data-d="2">Dog 2</button>
        <button data-d="3">Dog 3</button>
      </div>
      <div id="actions">
        <button data-a="bark">Bark</button>
        <button data-a="sit">Sit</button>
        <button data-a="jump">Jump</button>
      </div>
    </body>
  `);
}

function runBaseline() {
  const dom = createDOM();
  const document = dom.window.document;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    document.querySelectorAll('#langswitch button').forEach(b => b.addEventListener('click', () => {}));
    document.querySelectorAll('#chars button[data-d]').forEach(b => b.addEventListener('click', () => {}));
    document.querySelectorAll('#actions button').forEach(b => b.addEventListener('click', () => {}));
  }
  return performance.now() - start;
}

function runOptimized() {
  const dom = createDOM();
  const document = dom.window.document;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    document.getElementById('langswitch').addEventListener('click', () => {});
    document.getElementById('chars').addEventListener('click', () => {});
    document.getElementById('actions').addEventListener('click', () => {});
  }
  return performance.now() - start;
}

console.log(`Baseline: ${runBaseline().toFixed(2)} ms`);
console.log(`Optimized: ${runOptimized().toFixed(2)} ms`);
