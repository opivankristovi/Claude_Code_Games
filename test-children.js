const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
    <body>
    <div id="chars">
      <div id="langswitch">...</div>
      <button id="menubtn">Menu</button>
      <button data-d="0">Daido</button>
      <button data-d="1">Fluffy</button>
    </div>
    </body>
`);
const document = dom.window.document;
const chars = document.getElementById('chars');
for (const b of chars.children) {
  if (b.dataset.d != null) {
     console.log('Dog button:', b.textContent);
  } else {
     console.log('Not dog button:', b.tagName, b.id);
  }
}
