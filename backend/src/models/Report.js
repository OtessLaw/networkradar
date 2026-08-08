const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  networkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Network', required: true },
  type: { 
    type: String, 
    enum: ['no_service','internet_down','internet_slow','calls_dropping','cannot_call','cannot_receive_calls','sms_problem','momo_problem','weak_signal','other'] 
  },
  description: String,
  gridCellId: String,
  approximateLat: Number,
  approximateLng: Number,
  status: { type: String, enum: ['pending','verified','rejected','expired'], default: 'pending' },
  confidence: { type: String, enum: ['very_low','low','medium','high'], default: 'very_low' },
  weight: Number,
  ipHash: String,
  adminNote: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
