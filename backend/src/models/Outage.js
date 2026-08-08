const mongoose = require('mongoose');

const outageSchema = new mongoose.Schema({
  networkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Network', required: true },
  area: String,
  gridCellId: String,
  approximateLat: Number,
  approximateLng: Number,
  radiusKm: Number,
  status: { type: String, enum: ['possible','confirmed_community','resolved'], default: 'possible' },
  confidence: { type: String, enum: ['low','medium','high'], default: 'low' },
  reportCount: { type: Number, default: 0 },
  failedMeasurementCount: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  lastUpdatedAt: { type: Date, default: Date.now },
  autoDetected: { type: Boolean, default: true }
});

module.exports = mongoose.model('Outage', outageSchema);
