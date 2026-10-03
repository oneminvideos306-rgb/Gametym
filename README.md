# GameTym (full server version)
Chess, Ludo, Snake & Ladder, Tic-Tac-Toe, Connect Four. Accounts, guests, friends, quick match,
private rooms, spectators, chat, leaderboards, XP, achievements, daily challenge, admin page.

## Run on your computer
    npm install
    ADMIN_KEY=mysecret npm start      # open http://localhost:3000

## Free hosting (GitHub + Render)
1. GitHub: create a repo, upload the CONTENTS of this folder (server.js, package.json, README.md and the public folder).
2. Render.com: New > Web Service > pick the repo. Build: npm install. Start: npm start. Instance type: Free.
3. Environment variables: ADMIN_KEY = a long secret password.
4. Open the onrender.com URL. Admin page: /admin?key=YOUR_ADMIN_KEY

## Keep accounts and leaderboard forever (free)
Render's free disk is wiped on restart. To keep data: create a free Upstash Redis database (upstash.com),
copy its REST URL and REST token, and add them in Render as UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
