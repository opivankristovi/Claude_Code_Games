// Renders icon.svg to the PNG icon set for the launcher and every game folder.
// Usage: node scripts/render-icons.js [folder ...]   (default: launcher + all games)
// Needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { ROOT, gameFolders } = require('./games');

const folders = process.argv.length > 2 ? process.argv.slice(2) : ['.', ...gameFolders()];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const shot = async (svg, size, out) => {
    await page.setViewportSize({ width: size, height: size });
    const src = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
    await page.setContent(`<html><body style="margin:0;background:transparent"><img id="i" src="${src}" width="${size}" height="${size}" style="display:block"></body></html>`);
    await page.waitForFunction(() => document.getElementById('i').complete);
    await page.screenshot({ path: out, omitBackground: true });
  };
  for (const f of folders) {
    const dir = path.resolve(ROOT, f);
    const svg = fs.readFileSync(path.join(dir, 'icon.svg'), 'utf8');
    await shot(svg, 512, path.join(dir, 'icon-512.png'));
    await shot(svg, 192, path.join(dir, 'icon-192.png'));
    // iOS masks home-screen icons itself and fills transparent corners with black, so render full-bleed.
    await shot(svg.replace('rx="112"', 'rx="0"'), 180, path.join(dir, 'apple-touch-icon.png'));
    console.log('rendered', path.relative(ROOT, dir) || '(launcher)');
  }
  await browser.close();
})();
