import { COLORS } from './constants.js';
import { MAX_DOTS, MIN_DOTS } from './game.js';

export function configFromSearch(search) {
  const params = new URLSearchParams(search);
  const playerCount = Number(params.get('players'));
  const rows = Number(params.get('rows'));
  const cols = Number(params.get('cols'));
  const names = params.getAll('name');
  const colorIds = params.getAll('color');
  const colors = colorIds.map((id) => COLORS.findIndex((color) => color.label.toLowerCase() === id));

  if (![2, 3, 4].includes(playerCount)
    || !Number.isInteger(rows) || rows < MIN_DOTS || rows > MAX_DOTS
    || !Number.isInteger(cols) || cols < MIN_DOTS || cols > MAX_DOTS
    || names.length !== playerCount || colorIds.length !== playerCount
    || names.some((name) => !name.trim() || name.length > 18)
    || new Set(names.map((name) => name.trim().toLocaleLowerCase())).size !== playerCount
    || colors.some((color) => color < 0) || new Set(colors).size !== playerCount) return null;

  return { playerCount, rows, cols, names: names.map((name) => name.trim()), colors };
}

export function configToSearch(config) {
  const params = new URLSearchParams();
  params.set('players', String(config.playerCount));
  params.set('rows', String(config.rows));
  params.set('cols', String(config.cols));
  config.names.forEach((name) => params.append('name', name));
  config.colors.forEach((index) => params.append('color', COLORS[index].label.toLowerCase()));
  return params.toString();
}
