require('dotenv').config();
const mongoose = require('mongoose');
const Network = require('../src/models/Network');
const User = require('../src/models/User');
const ScoringConfig = require('../src/models/ScoringConfig');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/networkradar');
    console.log('✅ Connected to MongoDB for seeding');

    // 1. Seed Networks
    await Network.deleteMany({});
    const networks = await Network.insertMany([
      { name: 'MTN Ghana', code: 'MTN', color: '#FFD700', textColor: '#000000', active: true },
      { name: 'Telecel Ghana', code: 'TELECEL', color: '#CC0000', textColor: '#FFFFFF', active: true },
      { name: 'AT Ghana', code: 'AT', color: '#0066CC', textColor: '#FFFFFF', active: true },
    ]);
    console.log(`✅ Seeded ${networks.length} networks (MTN, Telecel, AT)`);

    // 2. Seed Admin User
    await User.deleteMany({ role: 'admin' });
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@123!';
    const admin = new User({
      name: 'NetworkRadar Admin',
      email: 'admin@networkradar.gh',
      password: adminPassword,
      role: 'admin',
      reputation: 'trusted',
      trustWeight: 1.0,
      verifiedAt: new Date(),
    });
    await admin.save();
    console.log(`✅ Seeded Admin User (email: admin@networkradar.gh, password: ${adminPassword})`);

    // 3. Seed Default Scoring Config
    await ScoringConfig.deleteMany({});
    await ScoringConfig.create({
      weights: { signal: 0.20, speed: 0.25, latency: 0.15, reliability: 0.25, outage: 0.15 },
      confidenceThresholds: { insufficient: 5, low: 20, medium: 50, high: 100 },
      outageThresholds: { possibleReports: 3, confirmedReports: 10, failureRateDrop: 0.4, windowMinutes: 30 },
      reportRateLimit: { perHour: 3, cooldownMinutes: 15 },
      dataRetentionDays: 90,
    });
    console.log('✅ Seeded default ScoringConfig');

    console.log('\n======================================================');
    console.log('⚠️  DEMO CONFIG SEEDED');
    console.log('NOTE: No fake network measurements or reports were generated.');
    console.log('All network scores will be calculated from real measurements.');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
