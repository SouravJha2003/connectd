import React from 'react';
import { COLORS, numberRange } from '../constants.js';
import { edgeKey } from '../game.js';

const STEP = 38;
const INSET = 26;

function edgeCoordinates(direction, row, col) {
  const x = INSET + col * STEP;
  const y = INSET + row * STEP;
  return direction === 'h'
    ? { x1: x, y1: y, x2: x + STEP, y2: y }
    : { x1: x, y1: y, x2: x, y2: y + STEP };
}

function Edge({ direction, row, col, owner, activeColor, onEdge }) {
  const available = owner === undefined;
  const coordinates = edgeCoordinates(direction, row, col);
  const label = direction === 'h'
    ? `Connect row ${row + 1}, dots ${col + 1} and ${col + 2}`
    : `Connect column ${col + 1}, dots ${row + 1} and ${row + 2}`;

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEdge(direction, row, col);
    }
  }

  return (
    <g className={`edge ${available ? 'open' : 'taken'}`} style={{ '--edge-color': activeColor }}>
      <line className="edge-visible" {...coordinates} />
      {available && (
        <line className="edge-hit" {...coordinates} role="button" tabIndex="0"
          aria-label={label} onClick={() => onEdge(direction, row, col)}
          onKeyDown={handleKeyDown} />
      )}
    </g>
  );
}

export function Board({ game, colors, featuredOwners, flash, onEdge }) {
  const width = INSET * 2 + (game.cols - 1) * STEP;
  const height = INSET * 2 + (game.rows - 1) * STEP;
  const activeColor = COLORS[colors[game.currentPlayer]].hex;
  const last = game.lastMove;
  const horizontalEdges = numberRange(game.rows).flatMap((row) =>
    numberRange(game.cols - 1).map((col) => ({ direction: 'h', row, col })));
  const verticalEdges = numberRange(game.rows - 1).flatMap((row) =>
    numberRange(game.cols).map((col) => ({ direction: 'v', row, col })));

  return (
    <div className="board-viewport">
      <svg className="board" viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: game.cols > 10 ? width : undefined }}
        role="group" aria-label={`${game.rows} by ${game.cols} dots and boxes game board`}>
        <rect className="board-surface" x="0" y="0" width={width} height={height} rx="18" />
        {numberRange(game.rows - 1).flatMap((row) => numberRange(game.cols - 1).map((col) => {
          const owner = game.boxes[`${row}-${col}`];
          if (owner === undefined) return null;
          const visible = !featuredOwners || featuredOwners.includes(owner);
          return (
            <rect key={`box-${row}-${col}`} className="box-fill"
              x={INSET + col * STEP + 4} y={INSET + row * STEP + 4}
              width={STEP - 8} height={STEP - 8} rx="7"
              fill={visible ? COLORS[colors[owner]].hex : 'transparent'} />
          );
        }))}
        {[...horizontalEdges, ...verticalEdges].map(({ direction, row, col }) => {
          const key = edgeKey(direction, row, col);
          return <Edge key={key} direction={direction} row={row} col={col}
            owner={game.edges[key]} activeColor={activeColor} onEdge={onEdge} />;
        })}
        {flash && last && (
          <line key={flash.nonce} className="last-line-glow"
            {...edgeCoordinates(last.direction, last.row, last.col)}
            stroke={COLORS[colors[game.edges[edgeKey(last.direction, last.row, last.col)]]].hex} />
        )}
        {numberRange(game.rows).flatMap((row) => numberRange(game.cols).map((col) => (
          <circle key={`dot-${row}-${col}`} className="dot"
            cx={INSET + col * STEP} cy={INSET + row * STEP} r="4.6" />
        )))}
      </svg>
    </div>
  );
}
