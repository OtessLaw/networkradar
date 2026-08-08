require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const OutageDetector = require('./src/services/OutageDetector');
const User = require('./src/models/User');
const Network = require('./src/models/Network');

const healthWorker = require('./src/workers/healthWorker');
const outageWorker = require('./src/workers/outageWorker');
const alertWorker = require('./src/workers/alertWorker');
const cleanupWorker = require('./src/workers/cleanupWorker');
const startKeepAliveWorker = require('./src/workers/keepAliveWorker');

let currentPort = Number(process.env.PORT) || 5005;

const ensureAdminUser = async () => {
  try {
    // 1. Ensure Networks
    const networkCount = await Network.countDocuments({});
    if (networkCount === 0) {
      await Network.insertMany([
        { name: 'MTN Ghana', code: 'MTN', color: '#FFD700', textColor: '#000000', active: true },
        { name: 'Telecel Ghana', code: 'TELECEL', color: '#CC0000', textColor: '#FFFFFF', active: true },
        { name: 'AT Ghana', code: 'AT', color: '#0066CC', textColor: '#FFFFFF', active: true },
      ]);
      console.log('✅ Seeded default networks (MTN, Telecel, AT)');
    }

    // 2. Ensure Admin User with stable password hashing
    const adminEmail = 'admin@networkradar.gh';
    const plainPassword = 'Admin@123!';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'NetworkRadar Admin',
        email: adminEmail,
        password: plainPassword,
        role: 'admin',
        reputation: 'trusted',
        trustWeight: 1.0,
        isActive: true,
        verifiedAt: new Date(),
      });
      await admin.save();
      console.log('✅ Admin user created: admin@networkradar.gh / Admin@123!');
    } else {
      const isMatch = await admin.comparePassword(plainPassword);
      if (!isMatch) {
        admin.password = plainPassword;
        admin.role = 'admin';
        admin.isActive = true;
        await admin.save();
        console.log('✅ Admin user password updated to: Admin@123!');
      } else {
        console.log('✅ Admin user verified: admin@networkradar.gh');
      }
    }
  } catch (err) {
    console.warn('Admin initialization note:', err.message);
  }
};

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Ensure Admin User and Default Networks
  await ensureAdminUser();

  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = initSocket(server);
  OutageDetector.setIO(io);

  // Start background cron workers
  healthWorker.start();
  outageWorker.start();
  alertWorker.start();
  cleanupWorker.start();
  startKeepAliveWorker();

  // Handle port conflicts gracefully by trying next port
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const prevPort = currentPort;
      currentPort += 1;
      console.warn(`⚠️  Port ${prevPort} is in use. Trying port ${currentPort}...`);
      setTimeout(() => {
        server.listen(currentPort);
      }, 200);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(currentPort, () => {
    console.log(`🚀 NetworkRadar Ghana Server running on port ${currentPort}`);
    console.log(`📡 Socket.IO server active`);
  });
};

startServer();
