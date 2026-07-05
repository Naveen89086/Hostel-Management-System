import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/env';

let io: Server;

export const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Listen for authentication event to join user-specific room
    socket.on('authenticate', (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper function to emit events to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};

// Helper function to emit events to all users
export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};

// Helper function to emit events to a specific role
export const emitToRole = (role: string, event: string, data: any) => {
  if (io) {
    // For now, emit to all since role rooms are not explicitly joined in connection handler
    io.emit(event, data);
  }
};
