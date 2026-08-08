require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const OutageDetector = require('./src/services/OutageDetector');

const healthWorker = require('./src/workers/healthWorker');
const outageWorker = require('./src/workers/outageWorker');
const alertWorker = require('./src/workers/alertWorker');
const cleanupWorker = require('./src/workers/cleanupWorker');

let currentPort = Number(process.env.PORT) || 5005;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = initSocket(server);
  OutageDetector.setIO(io);

  // Start background cron workers
  healthWorker.start();
  outageWorker.start();
  alertWorker.start();
  cleanupWorker.start();

  // Handle port conflicts gracefully by trying next port
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const prevPort = currentPort;
      currentPort += 1;
      console.warn(`⚠️  Port ${prevPort} is in use. Trying port ${currentPort}...`);
      setTimeout(() => {
        server.listen(currentPort);
      }, 200);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(currentPort, () => {
    console.log(`🚀 NetworkRadar Ghana Server running on port ${currentPort}`);
    console.log(`📡 Socket.IO server active`);
  });
};

startServer();
