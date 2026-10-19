const fs = require('fs');
const path = require('path');

// Extract the functions from index.html
const indexPath = path.join(__dirname, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Use regex to find the constants and functions
const POND_match = indexHtml.match(/const POND=\{[^}]+\};/);
const SHED_match = indexHtml.match(/const SHED=\{[^}]+\};/);
const hills_match = indexHtml.match(/function hills\([^\)]+\)\{[^}]+\}/);
const pondE_match = indexHtml.match(/function pondE\([^\)]+\)\{[^}]+\}/);

if (!POND_match || !SHED_match || !hills_match || !pondE_match) {
  throw new Error("Failed to extract necessary code from index.html");
}

// Evaluate the extracted code so we can test it
// Using global object to export evaluated functions/vars
eval("global.POND = " + POND_match[0].substring(11)); // "const POND=" is 11 chars
eval("global.SHED = " + SHED_match[0].substring(11));
eval("global.hills = " + hills_match[0]);
eval("global.pondE = " + pondE_match[0]);

describe('DaidoSim Terrain Height Function (hills)', () => {
  test('hills(0, 0) should return expected value', () => {
    // 0.9*sin(0)*cos(0) + 0.45*sin(1.3)*sin(0.7) + 0.15*sin(0)
    // = 0 + 0.45 * sin(1.3) * sin(0.7) + 0
    const expected = 0.45 * Math.sin(1.3) * Math.sin(0.7);
    expect(hills(0, 0)).toBeCloseTo(expected, 5);
  });

  test('hills function should be deterministic', () => {
    const val1 = hills(15.5, -20.2);
    const val2 = hills(15.5, -20.2);
    expect(val1).toBe(val2);
  });

  test('hills function should stay within mathematical bounds [-1.5, 1.5]', () => {
    // Maximum possible value based on the formula is 0.9 + 0.45 + 0.15 = 1.5
    // Minimum is -1.5
    for (let x = -100; x <= 100; x += 10) {
      for (let z = -100; z <= 100; z += 10) {
        const height = hills(x, z);
        expect(height).toBeLessThanOrEqual(1.5);
        expect(height).toBeGreaterThanOrEqual(-1.5);
      }
    }
  });

  test('pondE function should calculate correct normalized distance', () => {
    // Distance from center of POND
    const distCenter = pondE(POND.x, POND.z);
    expect(distCenter).toBe(0);

    // Distance at POND rx, rz edge
    const distEdgeX = pondE(POND.x + POND.rx, POND.z);
    expect(distEdgeX).toBeCloseTo(1, 5);

    const distEdgeZ = pondE(POND.x, POND.z + POND.rz);
    expect(distEdgeZ).toBeCloseTo(1, 5);

    // Outside pond
    const distOutside = pondE(POND.x + POND.rx * 2, POND.z + POND.rz * 2);
    // sqrt( (2rx/rx)^2 + (2rz/rz)^2 ) = sqrt(4 + 4) = sqrt(8)
    expect(distOutside).toBeCloseTo(Math.sqrt(8), 5);
  });
});
