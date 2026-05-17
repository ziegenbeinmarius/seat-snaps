"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { BroadcastResponse } from "@seat-snaps/shared";

interface SocketContextValue {
  connected: boolean;
  latestBroadcast: BroadcastResponse | null;
  broadcasts: BroadcastResponse[];
  dismissBanner: () => void;
  bannerVisible: boolean;
  seatingUpdateAt: number | null;
}

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  latestBroadcast: null,
  broadcasts: [],
  dismissBanner: () => {},
  bannerVisible: false,
  seatingUpdateAt: null,
});

interface Props {
  token: string;
  eventId: string;
  children: React.ReactNode;
}

export function SocketProvider({ token, eventId, children }: Props) {
  const [connected, setConnected] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastResponse[]>([]);
  const [latestBroadcast, setLatestBroadcast] = useState<BroadcastResponse | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [seatingUpdateAt, setSeatingUpdateAt] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const dismissBanner = useCallback(() => setBannerVisible(false), []);

  useEffect(() => {
    const socket = getSocket(token, eventId);
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onBroadcast = (payload: BroadcastResponse) => {
      setBroadcasts((prev) => [payload, ...prev]);
      setLatestBroadcast(payload);
      setBannerVisible(true);
      toast(payload.title, {
        description: payload.content,
        duration: 6000,
      });
    };
    const onSeatingUpdate = () => setSeatingUpdateAt(Date.now());

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("broadcast", onBroadcast);
    socket.on("seating_update", onSeatingUpdate);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("broadcast", onBroadcast);
      socket.off("seating_update", onSeatingUpdate);
    };
  }, [token, eventId]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ connected, latestBroadcast, broadcasts, dismissBanner, bannerVisible, seatingUpdateAt }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
