const socketIO = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = socketIO(httpServer, {
    cors: {
      origin: true, // Allow any frontend port (5173, 5175, etc.)
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins geographic area room
    socket.on('join:area', (gridCellId) => {
      socket.join(`area:${gridCellId}`);
    });

    // Client joins network room
    socket.on('join:network', (networkCode) => {
      socket.join(`network:${networkCode}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getIO };
