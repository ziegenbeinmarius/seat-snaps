"use client";

import { io, type Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function getSocket(token: string, eventId: string): Socket {
  if (socketInstance?.connected) return socketInstance;

  socketInstance?.disconnect();

  socketInstance = io(API_URL, {
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
