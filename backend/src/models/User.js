const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  reputation: { type: String, enum: ['new', 'normal', 'trusted', 'restricted'], default: 'new' },
  trustWeight: { type: Number, default: 0.3 },
  verifiedAt: Date,
  refreshTokens: [String],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  savedLocations: [{
    name: String,
    lat: Number,
    lng: Number
  }],
  reportCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
