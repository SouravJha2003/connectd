# Connect-D

A local two to four player dots-and-boxes game built with React and Vite. Choose a 10 × 10 or 15 × 15 dot grid, or set custom rows and columns from 9 to 20. Edit player names and choose a unique color for each player, then tap or click a gap between neighboring dots to place a line. Completing a box claims it and gives you another turn.

Starting a game navigates to `/game` with the player names, colors, and grid size in the URL. A game link opens directly or after a refresh with the same setup. Browser Back and Forward navigate between setup and game. When deploying the production build, configure the host to serve `index.html` for `/game` requests.

## Run on your device

Install [Node.js](https://nodejs.org/) (version 20.19 or newer), then run:

```sh
cd connect-d
npm install
npm run dev
```

Open the local address Vite prints, usually `http://localhost:5173`.

To play from a phone or tablet on the same Wi-Fi network, open `http://YOUR_COMPUTER_IP:5173` on that device while the dev server is running. Your computer's firewall may ask you to allow the connection.

## Check or build

```sh
npm test
npm run build
```

The production files are written to `dist/`.

## Project structure

- `src/game.js` contains the game rules and immutable move updates.
- `src/navigation.js` validates and builds game URLs.
- `src/components/SetupScreen.jsx` handles players and grid setup.
- `src/components/GameScreen.jsx` handles turns, scores, undo, and end-of-game controls.
- `src/components/Board.jsx` renders the interactive SVG board.
- `src/constants.js` holds shared player colors and setup values.
- `src/style.css` is the stylesheet entry point imported by `src/main.jsx`.

### Stylesheets

Styles live in `src/styles/` and are loaded in this order:

| File | Purpose |
| --- | --- |
| `base.css` | Fonts, document defaults, and focus styles. |
| `shell.css` | Shared page shell, header, footer, panels, and primary buttons. |
| `setup-intro.css` | Welcome layout and board preview. |
| `setup-form.css` | Player settings, grid options, and form controls. |
| `game.css` | Game layout, scores, actions, box explorer, and confetti. |
| `board.css` | Interactive SVG board, edges, dots, and line animation. |
| `responsive.css` | Tablet, phone, and reduced-motion overrides. |

Add styles to the file for the screen or component they affect. Keep responsive overrides in `responsive.css`, which loads last so they can override the default layouts.

## Controls

- **Undo last move** restores the previous board, score, and turn.
- **Highlight last line** briefly flashes the most recently drawn line.
- At the end, select a player below the board to highlight their boxes. **Reset setup** returns to the welcome screen; **Restart game** keeps the same players and grid.
