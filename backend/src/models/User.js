const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  reputation: { type: String, enum: ['new', 'normal', 'trusted', 'restricted'], default: 'new' },
  trustWeight: { type: Number, default: 0.3 },
  isActive: { type: Boolean, default: true },
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

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Helper to refresh trust weight based on reputation
userSchema.methods.refreshTrust = function () {
  switch (this.reputation) {
    case 'trusted':
      this.trustWeight = 1.0;
      break;
    case 'normal':
      this.trustWeight = 0.7;
      break;
    case 'restricted':
      this.trustWeight = 0.1;
      break;
    default:
      this.trustWeight = 0.3;
  }
};

module.exports = mongoose.model('User', userSchema);
