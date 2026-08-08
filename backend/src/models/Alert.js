const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  networkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Network' },
  area: String,
  gridCellId: String,
  alertType: { type: String, enum: ['outage','recovery','score_drop'], default: 'outage' },
  active: { type: Boolean, default: true },
  lastNotifiedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
