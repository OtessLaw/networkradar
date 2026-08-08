const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  networkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Network', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gridCellId: String,
  approximateLat: Number,
  approximateLng: Number,
  signalStrength: Number,
  networkType: String,
  mcc: String,
  mnc: String,
  downloadSpeed: Number,
  uploadSpeed: Number,
  latency: Number,
  packetLoss: Number,
  connectionSuccess: Boolean,
  source: { type: String, enum: ['web', 'android', 'api'], default: 'web' },
  ipHash: String,
  timestamp: { type: Date, default: Date.now }
});

measurementSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
measurementSchema.index({ gridCellId: 1, networkId: 1 });
measurementSchema.index({ approximateLat: 1, approximateLng: 1 }, { type: '2dsphere' });

module.exports = mongoose.model('Measurement', measurementSchema);
