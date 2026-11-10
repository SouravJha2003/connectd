import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, playEdge, getWinners } from './game.js';

test('grid dimensions set the correct line and box counts', () => {
  assert.deepEqual([newGame(2, 10, 10).totalEdges, newGame(2, 10, 10).totalBoxes], [180, 81]);
  assert.deepEqual([newGame(3, 15, 15).totalEdges, newGame(3, 15, 15).totalBoxes], [420, 196]);
  assert.deepEqual([newGame(2, 9, 20).totalEdges, newGame(2, 9, 20).totalBoxes], [331, 152]);
  assert.throws(() => newGame(2, 8, 10), RangeError);
});

test('players alternate and a taken or out-of-bounds edge cannot be played', () => {
  const first = playEdge(newGame(3, 9, 20), 'h', 0, 0);
  assert.equal(first.currentPlayer, 1);
  assert.equal(playEdge(first, 'h', 0, 0), first);
  assert.equal(playEdge(first, 'h', 0, 19), first);
  assert.equal(playEdge(first, 'v', 8, 0), first);
  assert.equal(playEdge(first, 'v', 0, 0).currentPlayer, 2);
});

test('four players rotate through turns and receive separate scores', () => {
  let game = newGame(4);
  assert.deepEqual(game.scores, [0, 0, 0, 0]);
  for (let col = 0; col < 4; col += 1) game = playEdge(game, 'h', 0, col);
  assert.equal(game.currentPlayer, 0);
  assert.equal(game.moves, 4);
});

test('closing a box awards it and grants another turn', () => {
  let game = newGame();
  for (const move of [['h', 0, 0], ['v', 0, 0], ['h', 1, 0], ['v', 0, 1]]) game = playEdge(game, ...move);
  assert.equal(game.boxes['0-0'], 1);
  assert.deepEqual(game.scores, [0, 1]);
  assert.equal(game.currentPlayer, 1);
  assert.equal(game.lastClaimed, 1);
  assert.deepEqual(game.lastMove, { direction: 'v', row: 0, col: 1 });
});

test('one edge can close two boxes', () => {
  let game = newGame();
  for (const move of [['h', 0, 0], ['h', 1, 0], ['v', 0, 0], ['h', 0, 1], ['h', 1, 1], ['v', 0, 2]]) game = playEdge(game, ...move);
  game = playEdge(game, 'v', 0, 1);
  assert.equal(game.lastClaimed, 2);
  assert.equal(Object.keys(game.boxes).length, 2);
  assert.equal(game.scores.reduce((a, b) => a + b), 2);
});

test('a completed game names all players tied for the lead', () => {
  const game = { ...newGame(3), moves: 180, scores: [27, 27, 27] };
  assert.deepEqual(getWinners(game), [0, 1, 2]);
});

test('a custom board finishes with every box assigned exactly once', () => {
  let game = newGame(3, 9, 20);
  for (let row = 0; row < game.rows; row += 1) {
    for (let col = 0; col < game.cols - 1; col += 1) game = playEdge(game, 'h', row, col);
  }
  for (let row = 0; row < game.rows - 1; row += 1) {
    for (let col = 0; col < game.cols; col += 1) game = playEdge(game, 'v', row, col);
  }
  assert.equal(game.moves, game.totalEdges);
  assert.equal(Object.keys(game.boxes).length, game.totalBoxes);
  assert.equal(game.scores.reduce((sum, score) => sum + score, 0), game.totalBoxes);
  assert.ok(getWinners(game).length >= 1);
});
