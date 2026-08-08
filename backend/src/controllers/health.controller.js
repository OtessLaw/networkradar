const mongoose = require('mongoose');

exports.ping = (req, res) => {
  res.json({ pong: true, timestamp: Date.now() });
};

exports.speedTest = (req, res) => {
  // Generate 5MB payload of dummy data for speed testing
  const size = 5 * 1024 * 1024;
  const buffer = Buffer.alloc(size, 'x');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', size);
  res.setHeader('Cache-Control', 'no-store');
  res.send(buffer);
};

exports.status = (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'online',
    platform: 'NetworkRadar Ghana',
    database: dbState,
    timestamp: new Date().toISOString(),
  });
};
