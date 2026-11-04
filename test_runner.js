const { test, describe, it, before, after } = require('node:test');
const assert = require('assert');

// Simple mock for jest's `expect`
global.expect = function(actual) {
  return {
    toBeCloseTo: (expected, precision = 2) => {
      const pass = Math.abs(expected - actual) < Math.pow(10, -precision) / 2;
      assert.ok(pass, `Expected ${actual} to be close to ${expected}`);
    },
    toBe: (expected) => assert.strictEqual(actual, expected),
    toBeGreaterThanOrEqual: (expected) => assert.ok(actual >= expected),
    toBeLessThanOrEqual: (expected) => assert.ok(actual <= expected)
  };
};
global.test = it; // some tests might use `test` instead of `it`
global.describe = describe;
global.it = it;

require('./DaidoSim/terrain.test.js');
