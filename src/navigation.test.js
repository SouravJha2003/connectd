import test from 'node:test';
import assert from 'node:assert/strict';
import { configFromSearch, configToSearch } from './navigation.js';

test('game links preserve names, colors, and custom grid dimensions', () => {
  const config = {
    playerCount: 3,
    names: ['A & B', 'Casey', 'Drew'],
    colors: [2, 0, 3],
    rows: 9,
    cols: 20,
  };
  assert.deepEqual(configFromSearch(`?${configToSearch(config)}`), config);
});

test('invalid or repeated player colors cannot enter a game', () => {
  const valid = configToSearch({
    playerCount: 2, names: ['Alex', 'Blake'], colors: [0, 1], rows: 10, cols: 10,
  });
  assert.equal(configFromSearch(`?${valid.replace('color=blue', 'color=red')}`), null);
  assert.equal(configFromSearch(`?${valid.replace('color=blue', 'color=purple')}`), null);
  assert.equal(configFromSearch(`?${valid.replace('rows=10', 'rows=50')}`), null);
});
