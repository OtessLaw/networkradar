const mongoose = require('mongoose');

const scoringConfigSchema = new mongoose.Schema({
  weights: {
    signal: { type: Number, default: 0.20 },
    speed: { type: Number, default: 0.25 },
    latency: { type: Number, default: 0.15 },
    reliability: { type: Number, default: 0.25 },
    outage: { type: Number, default: 0.15 }
  },
  confidenceThresholds: {
    insufficient: { type: Number, default: 5 },
    low: { type: Number, default: 20 },
    medium: { type: Number, default: 50 },
    high: { type: Number, default: 100 }
  },
  outageThresholds: {
    possibleReports: { type: Number, default: 3 },
    confirmedReports: { type: Number, default: 10 },
    failureRateDrop: { type: Number, default: 0.4 },
    windowMinutes: { type: Number, default: 30 }
  },
  reportRateLimit: {
    perHour: { type: Number, default: 3 },
    cooldownMinutes: { type: Number, default: 15 }
  },
  dataRetentionDays: { type: Number, default: 90 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScoringConfig', scoringConfigSchema);
