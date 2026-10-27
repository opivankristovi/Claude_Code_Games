// Finds the game folders: top-level directories that contain an index.html.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NOT_GAMES = new Set(['node_modules', 'scripts', 'tests']);

function gameFolders(root = ROOT) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !NOT_GAMES.has(d.name))
    .filter(d => fs.existsSync(path.join(root, d.name, 'index.html')))
    .map(d => d.name)
    .sort();
}

// The icon set every game folder (and the launcher itself) carries.
const ICON_FILES = ['icon.svg', 'icon-512.png', 'icon-192.png', 'apple-touch-icon.png'];

module.exports = { ROOT, gameFolders, ICON_FILES };
