# GameTym

Upload ALL of these files to the ROOT of your GitHub repo (no folders):
`server.js`, `package.json`, `index.html`, `app.js`, `games.js`

Render settings: Build `npm install`, Start `npm start`, env var `ADMIN_KEY`.
Optional free persistence: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

After Render finishes deploying: open `/health` (should print `ok`), then hard-refresh the site (Ctrl+Shift+R).

## Games
Chess (2), Ludo (2-4), Snake & Ladder (2-4), Tic-Tac-Toe (2), Connect Four (2), Checkers (2), Battleship (2), Memory Match (2-4).

## Notes
- Quick match always creates a 2-player room that starts automatically. For 3-4 players use "Private room"; the host presses Start once everyone has joined.
- Chess: the server validates every move; pawns auto-promote to a queen. Draws by repetition, the 50-move rule and insufficient material are not detected.
- Ludo: with 2 players you are Red vs Green (opposite corners); the board caption shows your colour.
