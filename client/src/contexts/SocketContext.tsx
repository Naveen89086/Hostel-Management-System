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
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    let newSocket: Socket | null = null;

    if (isAuthenticated && user) {
      // Extract backend domain from VITE_API_URL, fallback to window.location.origin
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const socketUrl = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : window.location.origin;

      newSocket = io(socketUrl, {
        path: '/socket.io/',
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('--- SOCKET CONNECTED --- ID:', newSocket?.id);
        setIsConnected(true);
        newSocket?.emit('authenticate', user._id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('--- SOCKET DISCONNECTED --- Reason:', reason);
        setIsConnected(false);
      });

      // Global event listeners for notifications
      newSocket.on('request:updated', (data) => {
        // Notifications are now handled locally in the components (e.g., 'Problem Solved.')
      });

      newSocket.on('request:created', (data) => {
        if (user.role === 'admin' || user.role === 'warden') {
          toast(`New request: ${data.title}`, { icon: 'ℹ️' });
        }
      });

      newSocket.on('notice:posted', (data) => {
        toast.success(`New Notice: ${data.title}`, { icon: '📢' });
      });

      newSocket.on('system:maintenance', (data) => {
        if (data.enabled && user.role !== 'admin') {
          logout();
          toast.error('The system is currently under maintenance. Please try again later.', { duration: 5000 });
        }
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
