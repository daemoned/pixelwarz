# Pixelwarz — Agent Reference

## Project Overview

Pixelwarz is a real-time multiplayer browser game built as a learning project for JavaScript and TypeScript. Up to 4 players move colored pixels around a 64×64 grid using WASD keys. The server is authoritative; all game state is computed server-side and broadcast to clients over WebSocket.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Backend | TypeScript |
| Frontend | Vanilla JavaScript + HTML5 Canvas |
| Styling | TailwindCSS v4 |
| Transport | WebSocket (Bun native) |

No external runtime dependencies — only dev deps (TypeScript, Bun types, TailwindCSS).

## Repository Layout

```
pixelwarz/
├── main.ts              # HTTP server entry point; serves static files, upgrades /ws to WebSocket
├── types.ts             # Shared TypeScript types (ClientInfo, ClientMessage, Player, Position)
├── server/
│   ├── server.ts        # WebSocket connection manager; client lifecycle, message routing
│   └── game.ts          # Game loop (20 Hz), player physics, color assignment, state broadcast
├── client/
│   ├── index.html       # Page layout: canvas, chat panel, player/spectator lists
│   ├── app.js           # Main game loop and canvas rendering
│   ├── client.js        # WebSocket client; state machine (DISCONNECTED→CONNECTED→PLAYING→ERROR)
│   ├── gui.js           # UI helpers: buttons, chat, status updates
│   ├── inputHandler.js  # Keyboard input (WASD), only emits on state change
│   ├── input.css        # Tailwind source CSS
│   └── assets/
│       ├── output.css   # Generated CSS (gitignored, must be built)
│       └── fsex300.woff2 # Fixedsys Excelsior retro font
├── package.json
├── tsconfig.json
└── bun.lock
```

## Running the Project

```bash
# Start the server (with hot reload)
bun run dev:server

# In a separate terminal — watch and rebuild Tailwind CSS
bun run dev:client

# Or build CSS once
bun run build:tailwind
```

Open `http://localhost:<port>` in a browser. The server serves the `client/` directory as static files and exposes the WebSocket endpoint at `/ws`.

## WebSocket Protocol

### Client → Server

| Message | Fields | Description |
|---------|--------|-------------|
| `NEW` | `name: string` | Set display name |
| `CHAT` | `message: string` | Broadcast a chat message |
| `REQUEST_PLAY` | — | Join the active game (max 4 players) |
| `STOP_PLAY` | — | Return to spectator mode |
| `MOVE` | `key: string \| null` | Current WASD key held (null = no input) |

### Server → Client

| Message | Fields | Description |
|---------|--------|-------------|
| `CLIENTS` | `list: string[]` | All connected client names |
| `PLAYERS` | `list: {name, color}[]` | Active in-game players |
| `PLAYING` | `color: string \| null` | Confirms join; null means game is full |
| `GAME` | `data: {color, position}[]` | Full game state, sent every tick |
| `CHAT` | `name, message` | Chat message from a client |
| `ERROR` | `message: string` | Server-side error |

## Game Rules

- **Grid**: 64×64 pixels
- **Max players**: 4
- **Tick rate**: 20 Hz (server-side loop)
- **Player colors**: `#ff0000`, `#ffff00`, `#008000`, `#0000ff` (auto-assigned, released on disconnect)
- **Input**: WASD moves the player one pixel per tick in the held direction
- **Idle timeout**: Clients are disconnected after 5 minutes of inactivity

## Server Debug Console

While the server is running, press keys in the terminal:
- `c` — print all connected clients
- `p` — print active players

## Key Design Decisions

- **Authoritative server**: Clients send input only; the server owns all positions and physics. This prevents cheating and keeps clients thin.
- **Input deduplication**: `inputHandler.js` only sends a `MOVE` message when the held key changes, reducing WebSocket traffic.
- **Pub/sub channels**: Bun's built-in pub/sub is used for broadcasting. Channels: `"clients"` and `"players"`.
- **No bundler**: The client is plain JavaScript served as static files — no build step beyond TailwindCSS.

## Known Issues / TODO

- Game state is broadcast every tick even when nothing has changed (noted in README).
- Code quality is intentionally rough in places — this is a learning project.
