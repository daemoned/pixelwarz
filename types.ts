import { type ServerWebSocket } from 'bun';

export type ClientInfo = {
  ws: ServerWebSocket<ClientInfo>;
  name: string;
  remoteIP: string;
  connectedAt: number;
  timeoutId: ReturnType<typeof setTimeout>;
};

export type ClientMessage =
  | { type: "chat"; name: string, text: string }
  | { type: "new"; name: string }