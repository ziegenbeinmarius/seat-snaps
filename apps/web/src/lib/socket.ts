"use client";

import { io, type Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3002";

export function getSocket(token: string, eventId: string): Socket {
  if (socketInstance?.connected) return socketInstance;

  socketInstance?.disconnect();

  socketInstance = io(WS_URL, {
    auth: { token, eventId },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socketInstance;
}

export function disconnectSocket() {
  socketInstance?.disconnect();
  socketInstance = null;
}
