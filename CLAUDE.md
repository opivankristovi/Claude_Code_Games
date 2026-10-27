# Claude Code Games

Browser games, each in its own top-level folder with an `index.html` (a single self-contained file, except Tuxemon 3D, which loads its own `css/` and `js/`), plus a launcher page (`index.html` at the root) that links to every game. GitHub Pages serves the repo from `main`: <https://opivankristovi.github.io/Claude_Code_Games/>.

## Adding a game (required every time)

A new game is not finished until all of these are done. `npm run test:launcher` (also run in CI) fails if any are missing.

1. **Folder**: `<GameFolder>/index.html` (the game) and `<GameFolder>/README.md` (description, live link, how to run, controls). Follow the existing games' READMEs.
2. **Logo**: draw `<GameFolder>/icon.svg`, a 512×512 square icon.
   - Use the same frame as the other icons: `<clipPath id="frame"><rect width="512" height="512" rx="112"/></clipPath>` wrapping all content. Keep the `rx="112"` text exactly; the render script swaps it for a full-bleed touch icon.
   - Draw the game's own hero, vehicle or key object in the game's colour palette. No text or web fonts (SVG used as an image cannot load them).
   - Check that it reads at 32 px as well as 512 px.
3. **PNG exports**: run `node scripts/render-icons.js "<GameFolder>"` (needs Playwright + Chromium). It writes `icon-512.png`, `icon-192.png` and `apple-touch-icon.png` (180×180, square corners).
4. **Favicon links** in the game's `<head>`, right after `<title>`:
   ```html
   <link rel="icon" href="icon-192.png" type="image/png" sizes="192x192">
   <link rel="icon" href="icon.svg" type="image/svg+xml">
   <link rel="apple-touch-icon" href="apple-touch-icon.png">
   ```
5. **Launcher button**: add an `<li>` to the `.grid` list in the root `index.html`, copying an existing one. Set `href` and the icon `src` to the URL-encoded folder (`Katana%20Creed/`), an `--accent` colour taken from the logo, the next `--i` value, the title, a short genre and the input chips (Keyboard, Mouse, Gamepad, Touch).
6. **Root README**: add a row to the games table, a section with the game's controls, the live link under "How to play", and the folder in "Repository layout".

## Checks

- `npm run test:launcher`: every game folder has its icon set, favicon links and a launcher button, and the launcher has no buttons for missing folders. Needs no `npm install`.
- `npm test`: the full suite (needs `npm install`).
