import React, { useEffect, useRef, useState } from 'react';
import { clamp, COLORS, NAME_POOL } from '../constants.js';
import { MAX_DOTS, MIN_DOTS } from '../game.js';
import { Logo } from './Brand.jsx';

const PLAYER_COUNTS = [2, 3, 4];
const GRID_PRESETS = [
  { id: '10', title: '10 × 10', subtitle: 'CLASSIC' },
  { id: '15', title: '15 × 15', subtitle: 'EXTENDED' },
  { id: 'custom', title: 'Custom', subtitle: 'YOUR CALL' },
];

function randomNames() {
  const names = [...NAME_POOL];
  for (let index = names.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [names[index], names[swapIndex]] = [names[swapIndex], names[index]];
  }
  return names.slice(0, 4);
}

function NumberStepper({ label, value, onChange }) {
  function update(raw) {
    const parsed = Number(raw);
    if (Number.isInteger(parsed)) onChange(clamp(parsed));
  }

  return (
    <label className="number-field">
      <span>{label}</span>
      <span className="number-controls">
        <button type="button" onClick={() => onChange(clamp(value - 1))}
          aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= MIN_DOTS}>−</button>
        <input type="number" min={MIN_DOTS} max={MAX_DOTS} value={value}
          onChange={(event) => update(event.target.value)}
          aria-label={`${label} of dots`} />
        <button type="button" onClick={() => onChange(clamp(value + 1))}
          aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= MAX_DOTS}>+</button>
      </span>
    </label>
  );
}

function PlayerFields({ count, names, colors, onNameChange, onColorChange }) {
  const [openColor, setOpenColor] = useState(null);
  const badgeRefs = useRef([]);

  useEffect(() => {
    if (openColor === null) return undefined;
    function closeOnOutsideClick(event) {
      if (!event.target.closest(`[data-color-picker="${openColor}"]`)) setOpenColor(null);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setOpenColor(null);
        badgeRefs.current[openColor]?.focus();
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openColor]);

  return (
    <div className="player-fields">
      {names.slice(0, count).map((name, index) => (
        <div className="player-field" key={index} style={{ '--player-color': COLORS[colors[index]].hex }}>
          <div className="color-picker" data-color-picker={index}>
            <button ref={(element) => { badgeRefs.current[index] = element; }}
              className="player-badge" type="button"
              aria-label={`Change player ${index + 1} color, currently ${COLORS[colors[index]].label}`}
              aria-expanded={openColor === index}
              onClick={() => setOpenColor(openColor === index ? null : index)}>
              {index + 1}
            </button>
            {openColor === index && (
              <div className="color-popover" role="group" aria-label={`Player ${index + 1} color choices`}>
                {COLORS.map((color, colorIndex) => {
                  const owner = colors.slice(0, count).indexOf(colorIndex);
                  return (
                    <button key={color.label} type="button" className="color-choice"
                      aria-label={`${color.label}${owner !== -1 && owner !== index ? `, swap with player ${owner + 1}` : ''}`}
                      aria-pressed={colors[index] === colorIndex}
                      onClick={() => {
                        onColorChange(index, colorIndex);
                        setOpenColor(null);
                        badgeRefs.current[index]?.focus();
                      }}>
                      <span className="color-choice-swatch" style={{ background: color.hex }} />
                      <span>{color.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <label className="player-label">
            <input maxLength="18" value={name}
              onChange={(event) => onNameChange(index, event.target.value)}
              aria-label={`Player ${index + 1} name`} />
          </label>
          <span className="edit-symbol" aria-hidden="true">✎</span>
        </div>
      ))}
    </div>
  );
}

export function SetupScreen({ onStart, initialConfig }) {
  const [playerCount, setPlayerCount] = useState(initialConfig?.playerCount ?? 2);
  const [names, setNames] = useState(() => initialConfig
    ? [...initialConfig.names, ...randomNames()].slice(0, 4) : randomNames());
  const [colors, setColors] = useState(() => initialConfig
    ? [...initialConfig.colors, ...COLORS.map((_, index) => index).filter((index) => !initialConfig.colors.includes(index))]
    : [0, 1, 2, 3]);
  const [preset, setPreset] = useState(() => initialConfig
    ? initialConfig.rows === initialConfig.cols && [10, 15].includes(initialConfig.rows)
      ? String(initialConfig.rows) : 'custom'
    : '10');
  const [rows, setRows] = useState(initialConfig?.rows ?? 10);
  const [cols, setCols] = useState(initialConfig?.cols ?? 10);
  const [error, setError] = useState('');

  function choosePreset(value) {
    setPreset(value);
    if (value !== 'custom') {
      setRows(Number(value));
      setCols(Number(value));
    }
  }

  function updateName(index, value) {
    setNames((previous) => previous.map((name, position) => position === index ? value : name));
    setError('');
  }

  function updateColor(index, color) {
    setColors((previous) => {
      const next = [...previous];
      const other = next.indexOf(color);
      next[index] = color;
      if (other !== -1 && other !== index) next[other] = previous[index];
      return next;
    });
  }

  function start(event) {
    event.preventDefault();
    const chosen = names.slice(0, playerCount).map((name) => name.trim());
    if (chosen.some((name) => !name)) {
      setError('Give every player a name before starting.');
      return;
    }
    if (new Set(chosen.map((name) => name.toLocaleLowerCase())).size !== playerCount) {
      setError('Choose a different name for each player.');
      return;
    }
    setError('');
    onStart({ playerCount, names: chosen, colors: colors.slice(0, playerCount), rows, cols });
  }

  return (
    <div className="site-shell welcome-shell">
      <header className="site-header">
        <Logo />
        <span className="header-note">A GAME OF LINES & LITTLE VICTORIES</span>
      </header>
      <main className="welcome-layout">
        <section className="welcome-intro">
          <span className="kicker"><span /> THE CLASSIC REIMAGINED</span>
          <h1>Connect the dots.<br /><em>Own the board.</em></h1>
          <p>A quick game of clever lines and colorful boxes. Gather your people, pick a grid, and make every move count.</p>
          <div className="preview-art" aria-hidden="true">
            <div className="preview-grid">
              {COLORS.map((color) => <span key={color.label} className={`preview-square ${color.label.toLowerCase()}`} />)}
            </div>
          </div>
        </section>
        <form className="setup-card" onSubmit={start}>
          <h2>Set up your game</h2>
          <p>Make it yours before the first line is drawn.</p>
          <div className="form-section">
            <div className="segmented" role="group" aria-label="Player count">
              {PLAYER_COUNTS.map((count) => (
                <button key={count} type="button" className={playerCount === count ? 'selected' : ''}
                  aria-pressed={playerCount === count} onClick={() => setPlayerCount(count)}>
                  {count} players
                </button>
              ))}
            </div>
            <PlayerFields count={playerCount} names={names} colors={colors}
              onNameChange={updateName} onColorChange={updateColor} />
            <button type="button" className="reroll" onClick={() => { setNames(randomNames()); setError(''); }}>
              Surprise me with names
            </button>
          </div>
          <div className="form-section grid-section">
            <div className="grid-presets" role="group" aria-label="Grid size">
              {GRID_PRESETS.map(({ id, title, subtitle }) => (
                <button key={id} type="button" className={preset === id ? 'selected' : ''}
                  aria-pressed={preset === id} onClick={() => choosePreset(id)}>
                  <strong>{title}</strong><small>{subtitle}</small>
                </button>
              ))}
            </div>
            {preset === 'custom' && (
              <div className="custom-fields">
                <NumberStepper label="Rows" value={rows} onChange={setRows} />
                <NumberStepper label="Columns" value={cols} onChange={setCols} />
              </div>
            )}
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="start-button" type="submit">Start playing</button>
          <span className="setup-footnote">Pass and play together on one device</span>
        </form>
      </main>
      <footer className="site-footer">CONNECT-D <span>·</span> THINK AHEAD. DRAW THE LINE.</footer>
    </div>
  );
}
