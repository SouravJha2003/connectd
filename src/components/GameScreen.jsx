import React, { useEffect, useRef, useState } from 'react';
import { COLORS, numberRange } from '../constants.js';
import { getWinners, newGame, playEdge } from '../game.js';
import { Board } from './Board.jsx';
import { Logo } from './Brand.jsx';

function Confetti({ winners, colors }) {
  return (
    <div className="confetti" aria-hidden="true">
      {numberRange(44).map((index) => (
        <i key={index} style={{
          '--left': `${(index * 47.29) % 100}%`,
          '--delay': `${(index * 0.31) % 4}s`,
          '--duration': `${3.5 + (index % 6) * 0.45}s`,
          '--color': COLORS[colors[winners[index % winners.length]]].hex,
          '--rotate': `${index * 37}deg`,
        }} />
      ))}
    </div>
  );
}

function GameHeading({ game, config, winners }) {
  const finished = winners.length > 0;
  const winner = winners[0];
  const title = finished
    ? winners.length === 1 ? `${config.names[winner]} wins!` : 'It’s a tie!'
    : 'The board is yours.';
  const description = finished
    ? 'What a game. Explore the boxes below or play another round.'
    : game.lastClaimed
      ? `${config.names[game.currentPlayer]} claimed ${game.lastClaimed} ${game.lastClaimed === 1 ? 'box' : 'boxes'} and plays again!`
      : 'Connect neighboring dots. Close a box to claim it and play again.';

  return (
    <div className="game-heading">
      <div>
        <span className="kicker"><span /> {finished ? 'GAME COMPLETE' : 'GAME IN PROGRESS'}</span>
        <h1>
          {finished && winners.length === 1 && (
            <span className="winner-heading-crown" style={{ color: COLORS[config.colors[winner]].hex }} aria-label="Winner">♛</span>
          )}
          {title}
        </h1>
        <p>{description}</p>
      </div>
      <span className="game-counter">
        {Object.keys(game.boxes).length}<small> / {game.totalBoxes} BOXES CLAIMED</small>
      </span>
    </div>
  );
}

function ScoreStrip({ config, game }) {
  return (
    <div className={`score-strip players-${config.playerCount}`} aria-label="Player scores">
      {config.names.map((name, index) => (
        <div key={index} className={`score-card ${game.currentPlayer === index ? 'active' : ''}`}
          style={{ '--player-color': COLORS[config.colors[index]].hex, '--player-rgb': COLORS[config.colors[index]].rgb }}>
          <span className="score-color-box" aria-hidden="true" />
          <div className="score-card-name">{name}</div>
          <div className="score-number" aria-label={`${game.scores[index]} boxes`}>{game.scores[index]}</div>
        </div>
      ))}
    </div>
  );
}

function BoardPanel({ game, colors, selectedOwner, flash, onEdge }) {
  return (
    <section className="game-panel">
      <div className="board-topline">
        <span className="board-label"><span className="board-label-icon">▦</span> THE BOARD</span>
        <span>{game.moves} / {game.totalEdges} LINES</span>
      </div>
      <Board game={game} colors={colors} featuredOwners={selectedOwner === null ? null : [selectedOwner]}
        flash={flash} onEdge={onEdge} />
      <div className="board-bottomline">
        <span>✦ Tap the space between two dots to draw a line</span>
        {game.cols > 10 && <span>Scroll sideways to view the board ↔</span>}
      </div>
    </section>
  );
}

function EndControls({ config, game, winners, selectedOwner, onSelectOwner, onReset, onRestart }) {
  const ranking = game.scores.map((_, index) => index)
    .sort((a, b) => game.scores[b] - game.scores[a] || a - b);

  return (
    <div className="end-controls">
      <div className="box-explorer">
        <div className="explorer-title">
          <strong>Explore claimed boxes</strong>
          <span>Select a player to show their boxes. Select again to show all.</span>
        </div>
        <div className="explorer-buttons">
          {ranking.map((index) => (
            <button key={index} style={{ '--player-color': COLORS[config.colors[index]].hex }}
              className={selectedOwner === index ? 'selected' : ''}
              aria-pressed={selectedOwner === index}
              onClick={() => onSelectOwner(selectedOwner === index ? null : index)}>
              <span className="explorer-name">
                {config.names[index]}
                {winners.includes(index) && <span className="explorer-crown" aria-label="Winner">♛</span>}
              </span>
              <strong>{game.scores[index]}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="end-actions">
        <button className="secondary-action" onClick={onReset}>Reset setup</button>
        <button className="primary-action" onClick={onRestart}>Restart game</button>
      </div>
    </div>
  );
}

export function GameScreen({ config, onReset }) {
  const [session, setSession] = useState(() => ({
    game: newGame(config.playerCount, config.rows, config.cols),
    history: [],
  }));
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [flash, setFlash] = useState(null);
  const flashTimer = useRef(null);
  const game = session.game;
  const winners = getWinners(game);
  const finished = winners.length > 0;
  const active = COLORS[config.colors[finished ? winners[0] : game.currentPlayer]];

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  function mark(direction, row, col) {
    setFlash(null);
    setSession((previous) => {
      const next = playEdge(previous.game, direction, row, col);
      return next === previous.game
        ? previous
        : { game: next, history: [...previous.history, previous.game] };
    });
  }

  function undo() {
    setFlash(null);
    setSelectedOwner(null);
    setSession((previous) => previous.history.length
      ? { game: previous.history.at(-1), history: previous.history.slice(0, -1) }
      : previous);
  }

  function highlightLast() {
    if (!game.lastMove) return;
    clearTimeout(flashTimer.current);
    setFlash({ nonce: Date.now() + Math.random() });
    flashTimer.current = setTimeout(() => setFlash(null), 2200);
  }

  function restart() {
    clearTimeout(flashTimer.current);
    setSession({ game: newGame(config.playerCount, config.rows, config.cols), history: [] });
    setSelectedOwner(null);
    setFlash(null);
  }

  return (
    <div className="site-shell game-shell" style={{ '--active-rgb': active.rgb }}>
      <header className="site-header">
        <Logo />
        <div className="header-actions">
          <span className="header-note">
            {config.rows} × {config.cols} DOTS <span className="header-divider">·</span> {config.playerCount} PLAYERS
          </span>
          <button type="button" className="setup-link" onClick={onReset}>Back to setup</button>
        </div>
      </header>
      {finished && <Confetti winners={winners} colors={config.colors} />}
      <main className={`game-main${finished ? ' finished' : ''}`}>
        <GameHeading game={game} config={config} winners={winners} />
        {!finished && <ScoreStrip config={config} game={game} />}
        <BoardPanel game={game} colors={config.colors} selectedOwner={finished ? selectedOwner : null}
          flash={flash} onEdge={mark} />
        {finished ? (
          <EndControls config={config} game={game} winners={winners}
            selectedOwner={selectedOwner} onSelectOwner={setSelectedOwner}
            onReset={onReset} onRestart={restart} />
        ) : (
          <div className="game-actions">
            <button className="secondary-action" onClick={undo} disabled={!session.history.length}>Undo last move</button>
            <button className="primary-action" onClick={highlightLast} disabled={!game.lastMove}>Highlight last line</button>
          </div>
        )}
      </main>
      <footer className="site-footer">CONNECT-D <span>·</span> THINK AHEAD. DRAW THE LINE.</footer>
    </div>
  );
}
