export const MIN_DOTS = 9;
export const MAX_DOTS = 20;

export function edgeKey(direction, row, col) {
  return `${direction}-${row}-${col}`;
}

export function newGame(playerCount = 2, rows = 10, cols = 10) {
  if (![2, 3, 4].includes(playerCount) || !Number.isInteger(rows) || !Number.isInteger(cols)
    || rows < MIN_DOTS || rows > MAX_DOTS || cols < MIN_DOTS || cols > MAX_DOTS) {
    throw new RangeError('Choose 2–4 players and 9–20 dots in each direction.');
  }
  return {
    playerCount,
    rows,
    cols,
    totalEdges: rows * (cols - 1) + (rows - 1) * cols,
    totalBoxes: (rows - 1) * (cols - 1),
    currentPlayer: 0,
    edges: {},
    boxes: {},
    scores: Array(playerCount).fill(0),
    moves: 0,
    lastClaimed: 0,
    lastMove: null,
  };
}

export function playEdge(game, direction, row, col) {
  if (!Number.isInteger(row) || !Number.isInteger(col) || game.moves === game.totalEdges) return game;
  const valid = direction === 'h'
    ? row >= 0 && row < game.rows && col >= 0 && col < game.cols - 1
    : direction === 'v' && row >= 0 && row < game.rows - 1 && col >= 0 && col < game.cols;
  if (!valid) return game;

  const key = edgeKey(direction, row, col);
  if (game.edges[key] !== undefined) return game;

  const edges = { ...game.edges, [key]: game.currentPlayer };
  const boxes = { ...game.boxes };
  const scores = [...game.scores];
  const candidates = direction === 'h'
    ? [[row - 1, col], [row, col]]
    : [[row, col - 1], [row, col]];
  let claimed = 0;

  for (const [boxRow, boxCol] of candidates) {
    if (boxRow < 0 || boxRow >= game.rows - 1 || boxCol < 0 || boxCol >= game.cols - 1) continue;
    const sides = [
      edgeKey('h', boxRow, boxCol),
      edgeKey('h', boxRow + 1, boxCol),
      edgeKey('v', boxRow, boxCol),
      edgeKey('v', boxRow, boxCol + 1),
    ];
    if (sides.every((side) => edges[side] !== undefined)) {
      boxes[`${boxRow}-${boxCol}`] = game.currentPlayer;
      claimed += 1;
    }
  }

  scores[game.currentPlayer] += claimed;
  return {
    ...game,
    edges,
    boxes,
    scores,
    moves: game.moves + 1,
    lastClaimed: claimed,
    lastMove: { direction, row, col },
    currentPlayer: claimed ? game.currentPlayer : (game.currentPlayer + 1) % game.playerCount,
  };
}

export function getWinners(game) {
  if (game.moves !== game.totalEdges) return [];
  const highScore = Math.max(...game.scores);
  return game.scores.flatMap((score, index) => score === highScore ? [index] : []);
}
