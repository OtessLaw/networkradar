const mongoose = require('mongoose');

const healthScoreSchema = new mongoose.Schema({
  networkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Network', required: true },
  gridCellId: { type: String, required: true },
  approximateLat: Number,
  approximateLng: Number,
  score: Number,
  status: { type: String, enum: ['excellent','good','fair','poor','critical','insufficient_data'] },
  confidence: { type: String, enum: ['insufficient','low','medium','high','very_high'] },
  measurementCount: Number,
  reportCount: Number,
  avgDownloadSpeed: Number,
  avgUploadSpeed: Number,
  avgLatency: Number,
  avgSignalStrength: Number,
  connectionSuccessRate: Number,
  activeOutage: Boolean,
  calculatedAt: { type: Date, default: Date.now }
});

healthScoreSchema.index({ networkId: 1, gridCellId: 1 }, { unique: true });
healthScoreSchema.index({ calculatedAt: 1 });

module.exports = mongoose.model('HealthScore', healthScoreSchema);
