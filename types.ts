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