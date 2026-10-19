const assert = require('assert');
const { test, describe, it } = require('node:test');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Read the index.html file
const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Extract the hills function using a regular expression
const match = indexHtml.match(/(function hills\([^)]*\)\{[^}]*\})/);
if (!match) {
  throw new Error("Could not find 'hills' function in index.html");
}
const hillsSource = match[1];

// Evaluate the function in a sandbox so we can test it
const sandbox = { Math }; // Providing Math since the function depends on it
vm.createContext(sandbox);
vm.runInContext(hillsSource, sandbox);

// Reference the actual function for tests
const hills = sandbox.hills;

describe('hills terrain height function (from index.html)', () => {
  it('should return predictable height at origin (0, 0)', () => {
    // 0.9*sin(0)*cos(0) + 0.45*sin(1.3)*sin(0.7) + 0.15*sin(0)
    // = 0 + 0.45 * 0.9635581854 * 0.6442176872 + 0
    // = 0.279334...
    const result = hills(0, 0);
    assert(Math.abs(result - 0.279) < 0.001);
  });

  it('should remain within bounded limits across a wide coordinate range', () => {
    // max amplitude is theoretical sum of coefficients: 0.9 + 0.45 + 0.15 = 1.5
    // so results should always be in range [-1.5, 1.5]
    for (let x = -100; x <= 100; x += 10) {
      for (let z = -100; z <= 100; z += 10) {
        const height = hills(x, z);
        assert(height >= -1.5, `Height at ${x},${z} went below -1.5`);
        assert(height <= 1.5, `Height at ${x},${z} went above 1.5`);
      }
    }
  });

  it('should calculate correct specific values for map coordinates', () => {
    // Testing a few specific coordinates to ensure deterministic output
    const val1 = hills(10, 10);
    // x=10, z=10
    // 0.9*sin(0.45)*cos(0.4) + 0.45*sin(2.3)*sin(1.55) + 0.15*sin(2.1+1.7)
    // 0.9*0.43496*0.92106 + 0.45*0.7457*0.99978 + 0.15*sin(3.8)
    // 0.3605 + 0.3355 - 0.0917 = 0.604
    assert(Math.abs(val1 - 0.604) < 0.01);

    const val2 = hills(-50, 30);
    assert(typeof val2 === 'number');
    assert(!isNaN(val2));
  });

  it('should be symmetric or continuous as expected for a terrain heightmap', () => {
    // Small changes in x or z should result in small changes in height (continuous)
    const h1 = hills(0, 0);
    const h2 = hills(0.1, 0);
    const h3 = hills(0, 0.1);

    assert(Math.abs(h1 - h2) < 0.1, 'Terrain height changed too drastically over small x change');
    assert(Math.abs(h1 - h3) < 0.1, 'Terrain height changed too drastically over small z change');
  });
});
