import { randomUUIDv7, type ServerWebSocket } from 'bun';
import type { ClientInfo, ClientMessage, Player } from '../types';
import { server } from '../main';
import { gameLoop, getColor, releaseColor } from './game';

export const clients: ClientInfo[] = [];
export const players: Player[] = [];
const WS_TIMEOUT = 300_000; // 5 min timeout
const MAX_PLAYERS = 4;

function addClient(ws: ServerWebSocket<ClientInfo>) {
  const timeoutId = setTimeout(() => {
    ws.close(4000, "Timeout");
  }, WS_TIMEOUT);

  ws.subscribe("clients");
  const client: ClientInfo = { ws, name: "Anonymous", remoteIP: ws.data.remoteIP, connectedAt: Date.now(), timeoutId };
  console.log("New client.");
  clients.push(client);
}

function removeClient(ws: ServerWebSocket<ClientInfo>) {
  const idx = clients.findIndex((c) => c.ws === ws);
  if (idx !== -1) {
    clearTimeout(clients[idx]?.timeoutId);
    clients.splice(idx, 1);
    console.log("Removed client.");
  }
}

function refreshTimeout(ws: ServerWebSocket<ClientInfo>) {
  const client = clients.find((c) => c.ws === ws);
  if (client) {
    clearTimeout(client.timeoutId);
    client.timeoutId = setTimeout(() => {
      ws.close(4000, "Timeout");
      console.log("Client timeout.");
    }, WS_TIMEOUT);
  }
}

export function open(ws: ServerWebSocket<ClientInfo>) {
  addClient(ws);
  //ws.send("WebSocket connection established!");
}

export function message(ws: ServerWebSocket<ClientInfo>, message: any) {
  const client = clients.find((c) => c.ws === ws);
  let parsed: ClientMessage;

  try {
    parsed = JSON.parse(message);
  } catch {
    ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON." } as ClientMessage));
    return;
  }

  refreshTimeout(ws);

  switch (parsed.type) {
    case "CHAT":
      // Broadcast to all clients
      chatMessage(client!.name, parsed.message);
      console.log(`CHAT - ${client!.name}: ${parsed.message}`)
      //ws.publish("chat", JSON.stringify({ type: "chat", name: ""}));
      break;
    case "NEW":
      if (client) {
        client.name = parsed.name;
        newClient();
      }
      break;
    case "REQUEST_PLAY":
      if (players.length < MAX_PLAYERS) {
        // request a color
        const color = getColor();
        ws.subscribe("players");
        players.push({
          clientInfo: client!,
          color: color!,
          key: null,
          position: { x: 0, y: 0 }
        });
        ws.send(JSON.stringify({
          type: "PLAYING",
          color: color
        } as ClientMessage));

      } else {
        // return message with color as null
        ws.send(JSON.stringify({
          type: "PLAYING",
          color: null
        } as ClientMessage));
      }
      break;
    case "STOP_PLAY":
      removePlayer(ws);
      break;
    case "MOVE":
      move(ws, parsed.key);
      break;



  }
  //console.log(`WebSocket message: ${message}`);
  //ws.send(`Echo: ${message}`);
}

export function close(ws: ServerWebSocket<ClientInfo>) {
  removePlayer(ws);
  removeClient(ws);
  newClient();
}

function move(ws: ServerWebSocket<ClientInfo>, key: string | null) {
  const player = players.find((p) => p.clientInfo.ws === ws);
  if (player) {
    player!.key = key;
  } else {
    return;
  }
  //console.log(`${player?.clientInfo.name}:move:${key} position:${player?.position}`);
}

function removePlayer(ws: ServerWebSocket<ClientInfo>) {
  ws.unsubscribe("players");
  const index = players.findIndex((p) => p.clientInfo.ws === ws);
  releaseColor(players[index]?.color!);
  players.splice(index, 1);
}

function newClient() {
  const list = clients.map(client => client.name);
  server.publish("clients", JSON.stringify({
    type: "CLIENTS",
    list: list
  } as ClientMessage))
}

/*
function newPlayer(clientID: string, name: string) {
  players.push({
    clientID: clientID,
    name: name
  } as Player)
  console.log(players);
}*/

function chatMessage(name: string, message: string) {
  server.publish("clients", JSON.stringify({
    type: "CHAT",
    name,
    message,
  } as ClientMessage))
}