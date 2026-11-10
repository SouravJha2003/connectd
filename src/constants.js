import { MAX_DOTS, MIN_DOTS } from './game.js';

export const NAME_POOL = [
  'Alex', 'Avery', 'Blake', 'Casey', 'Charlie', 'Dakota', 'Drew',
  'Emery', 'Finley', 'Harper', 'Jamie', 'Jordan', 'Kai', 'Morgan',
  'Parker', 'Quinn', 'Reese', 'Riley', 'Rowan', 'Taylor',
];
export const COLORS = [
  { label: 'Red', hex: '#ff5d67', rgb: '255, 93, 103' },
  { label: 'Blue', hex: '#58a6ff', rgb: '88, 166, 255' },
  { label: 'Yellow', hex: '#ffd35a', rgb: '255, 211, 90' },
  { label: 'Green', hex: '#70dd9b', rgb: '112, 221, 155' },
];
export const numberRange = (length) => Array.from({ length }, (_, index) => index);
export const clamp = (value) => Math.min(MAX_DOTS, Math.max(MIN_DOTS, value));
