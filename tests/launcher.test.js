// Every game folder must have its icon set and a button in the root launcher (index.html).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { ROOT, gameFolders, ICON_FILES } = require('../scripts/games');

const launcher = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const games = gameFolders();

test('the repo has games', () => {
  assert.ok(games.length > 0);
});

for (const g of games) {
  const url = encodeURI(g) + '/';

  test(`${g}: has the icon set`, () => {
    for (const f of ICON_FILES) assert.ok(fs.existsSync(path.join(ROOT, g, f)), `${g}/${f} is missing`);
  });

  test(`${g}: page links its icons`, () => {
    const html = fs.readFileSync(path.join(ROOT, g, 'index.html'), 'utf8');
    assert.match(html, /<link rel="icon" href="icon\.svg"/);
    assert.match(html, /<link rel="apple-touch-icon" href="apple-touch-icon\.png"/);
  });

  test(`${g}: has a launcher button`, () => {
    assert.ok(launcher.includes(`href="${url}"`), `index.html has no button linking to ${url}`);
    assert.ok(launcher.includes(`src="${url}icon.svg"`), `index.html button for ${g} does not use ${url}icon.svg`);
  });
}

test('launcher has no buttons for missing games', () => {
  const hrefs = [...launcher.matchAll(/<a class="game[^"]*" href="([^"]+)"/g)].map(m => decodeURI(m[1]).replace(/\/$/, ''));
  assert.deepStrictEqual([...hrefs].sort(), games);
});

test('launcher has its own icon set', () => {
  for (const f of ICON_FILES) assert.ok(fs.existsSync(path.join(ROOT, f)), `${f} is missing`);
});
