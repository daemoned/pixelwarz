import { type ServerWebSocket } from 'bun';

export type ClientInfo = {
  ws: ServerWebSocket<ClientInfo>;
  name: string;
  remoteIP: string;
  connectedAt: number;
  timeoutId: ReturnType<typeof setTimeout>;
};

export type ClientMessage =
  | { type: "CHAT"; name: string, message: string }
  | { type: "NEW"; name: string }
  | { type: "ERROR"; message: string }
  | { type: "CLIENTS"; list: Array<string> }
  | { type: "REQUEST_PLAY"; }
  | { type: "STOP_PLAY"; }
  | { type: "PLAYING"; color: string | null }
  | { type: "MOVE"; key: string | null }

export type Player = {
  clientInfo: ClientInfo;
  color: string;
  key: string | null;
  position: Position;
}

export type Position = {
  x: number;
  y: number;
}