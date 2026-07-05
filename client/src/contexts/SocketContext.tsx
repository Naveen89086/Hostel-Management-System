import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let newSocket: Socket | null = null;

    if (isAuthenticated && user) {
      newSocket = io(window.location.origin, {
        path: '/socket.io/',
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket?.emit('authenticate', user._id);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Global event listeners for notifications
      newSocket.on('request:updated', (data) => {
        toast.success(`Request "${data.title}" updated to ${data.status}`);
      });

      newSocket.on('request:created', (data) => {
        if (user.role === 'admin' || user.role === 'warden') {
          toast(`New request: ${data.title}`, { icon: 'ℹ️' });
        }
      });

      newSocket.on('notice:posted', (data) => {
        toast.success(`New Notice: ${data.title}`, { icon: '📢' });
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
