import { io, Socket } from "socket.io-client";
import { getTokenFromDocument } from "./auth";

let socket: Socket | null = null;

export function getWsUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";
}

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token?: string | null): Socket | null {
  const authToken = token ?? getTokenFromDocument();
  if (!authToken) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token: authToken };
    socket.connect();
    return socket;
  }

  socket = io(getWsUrl(), {
    auth: { token: authToken },
    autoConnect: true,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
