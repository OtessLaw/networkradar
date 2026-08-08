import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function useSocket() {
  if (!socket && typeof window !== 'undefined') {
    try {
      socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5005', {
        autoConnect: true,
        reconnectionAttempts: 5,
        timeout: 5000,
      });
    } catch (err) {
      console.warn('Socket initialization fallback:', err);
    }
  }

  function on(event, handler) {
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => {
      if (socket) socket.off(event, handler);
    };
  }

  function emit(event, data) {
    if (socket) socket.emit(event, data);
  }

  return { on, emit };
}

export default useSocket;
