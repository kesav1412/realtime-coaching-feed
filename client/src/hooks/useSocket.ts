'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create socket once; Socket.IO handles reconnects automatically
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] connected', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket.IO] disconnected', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.IO] connect error', err.message);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, connected };
}
