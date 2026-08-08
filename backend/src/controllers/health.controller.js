const mongoose = require('mongoose');

exports.ping = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ pong: true, timestamp: Date.now() });
};

exports.speedTest = (req, res) => {
  // Configurable size (default 2MB for fast, reliable mobile speed measurement)
  const size = Math.min(10 * 1024 * 1024, Math.max(256 * 1024, parseInt(req.query.size) || 2 * 1024 * 1024));
  const buffer = Buffer.alloc(size, 'x');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', size);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
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
