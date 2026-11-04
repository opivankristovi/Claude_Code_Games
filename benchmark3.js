const { JSDOM } = require('jsdom');

const N = 10000;

function createDOM() {
  return new JSDOM(`
    <!DOCTYPE html>
    <body>
      <div id="langswitch">
        <button data-lang="en">EN</button>
        <button data-lang="es">ES</button>
        <button data-lang="fr">FR</button>
      </div>
    </body>
  `);
}

function runQSA() {
  const dom = createDOM();
  const document = dom.window.document;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    document.querySelectorAll('#langswitch button').forEach(b => {
        b.classList.toggle('on', true);
    });
  }
  return performance.now() - start;
}

function runChildren() {
  const dom = createDOM();
  const document = dom.window.document;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const sw = document.getElementById('langswitch');
    for (let j = 0; j < sw.children.length; j++) {
        const b = sw.children[j];
        if(b.tagName === 'BUTTON') {
            b.classList.toggle('on', true);
        }
    }
  }
  return performance.now() - start;
}

console.log(`QSA Update: ${runQSA().toFixed(2)} ms`);
console.log(`Children Update: ${runChildren().toFixed(2)} ms`);
