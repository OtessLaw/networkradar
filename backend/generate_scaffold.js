const fs = require('fs');
const path = require('path');

const dirs = [
  'src/config',
  'src/models',
  'src/routes',
  'src/controllers',
  'src/middleware',
  'src/services',
  'src/workers',
  'src/validators',
  'src/utils',
  'scripts'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const files = {
  'server.js': `
const http = require('http');
const app = require('./app');
const { initSocket } = require('./src/config/socket');
const connectDB = require('./src/config/db');
require('dotenv').config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
});
`,
  'src/middleware/errorHandler.js': `
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};
`,
  'src/config/db.js': `
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
`,
  'src/config/socket.js': `
const socketIo = require('socket.io');
let io;
exports.initSocket = (server) => {
  io = socketIo(server, { cors: { origin: process.env.FRONTEND_URL } });
  io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
  });
  return io;
};
exports.getIo = () => io;
`
};

Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(path.join(__dirname, filePath), content.trim() + '\\n');
});

console.log('Scaffolding complete.');
