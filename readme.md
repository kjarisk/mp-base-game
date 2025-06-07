Base for a multiplayer game

## Usage

Install dependencies and start the backend server:

```bash
npm install
npm start
```

Visit `http://localhost:3000` and log in or choose a guest name. After that you can create or join games in real time and each game runs in its own Socket.IO room.

## Tests

Run the automated tests with:

```bash
npm test
```

## Deployment Notes

Player data is stored in `players.json`, which the server updates at runtime. The
file is generated automatically and is no longer tracked in git. Deployment
workflows reset local changes before pulling from `main` so that modified files
like `package-lock.json` do not cause merge conflicts.
