require('dotenv').config();
const mongoose = require('mongoose');
const Network = require('../src/models/Network');
const HealthScore = require('../src/models/HealthScore');
const { GHANA_TOWNS_INTELLIGENCE } = require('../src/services/GhanaNetworkIntelligence');

const seedGhanaMapData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/networkradar');
    console.log('✅ Connected to MongoDB for seeding Ghana regional map data...');

    let mtnNet = await Network.findOne({ code: 'MTN' });
    let telecelNet = await Network.findOne({ code: 'TELECEL' });
    let atNet = await Network.findOne({ code: 'AT' });

    if (!mtnNet || !telecelNet || !atNet) {
      console.log('Seeding networks first...');
      await Network.deleteMany({});
      const seededNets = await Network.insertMany([
        { name: 'MTN Ghana', code: 'MTN', color: '#FFD700', textColor: '#000000', active: true },
        { name: 'Telecel Ghana', code: 'TELECEL', color: '#CC0000', textColor: '#FFFFFF', active: true },
        { name: 'AT Ghana', code: 'AT', color: '#0066CC', textColor: '#FFFFFF', active: true },
      ]);
      mtnNet = seededNets[0];
      telecelNet = seededNets[1];
      atNet = seededNets[2];
    }

    await HealthScore.deleteMany({});

    const scoresToInsert = [];

    for (const town of GHANA_TOWNS_INTELLIGENCE) {
      const gridCellId = `GH-${town.lat.toFixed(3)}-${town.lng.toFixed(3)}`;

      // MTN
      scoresToInsert.push({
        networkId: mtnNet._id,
        gridCellId,
        approximateLat: town.lat,
        approximateLng: town.lng,
        score: town.mtn.score,
        status: town.mtn.status,
        confidence: 'high',
        measurementCount: 142,
        reportCount: 1,
        avgDownloadSpeed: town.mtn.speed,
        avgUploadSpeed: parseFloat((town.mtn.speed * 0.35).toFixed(1)),
        avgLatency: town.mtn.ping,
        avgSignalStrength: -65,
        connectionSuccessRate: 0.98,
        activeOutage: false,
        calculatedAt: new Date()
      });

      // Telecel
      scoresToInsert.push({
        networkId: telecelNet._id,
        gridCellId,
        approximateLat: town.lat + 0.002,
        approximateLng: town.lng + 0.002,
        score: town.telecel.score,
        status: town.telecel.status,
        confidence: 'medium',
        measurementCount: 86,
        reportCount: 2,
        avgDownloadSpeed: town.telecel.speed,
        avgUploadSpeed: parseFloat((town.telecel.speed * 0.35).toFixed(1)),
        avgLatency: town.telecel.ping,
        avgSignalStrength: -78,
        connectionSuccessRate: 0.92,
        activeOutage: false,
        calculatedAt: new Date()
      });

      // AT
      scoresToInsert.push({
        networkId: atNet._id,
        gridCellId,
        approximateLat: town.lat - 0.002,
        approximateLng: town.lng - 0.002,
        score: town.at.score,
        status: town.at.status,
        confidence: 'medium',
        measurementCount: 64,
        reportCount: 0,
        avgDownloadSpeed: town.at.speed,
        avgUploadSpeed: parseFloat((town.at.speed * 0.35).toFixed(1)),
        avgLatency: town.at.ping,
        avgSignalStrength: -85,
        connectionSuccessRate: 0.88,
        activeOutage: false,
        calculatedAt: new Date()
      });
    }

    await HealthScore.insertMany(scoresToInsert);
    console.log(`✅ Seeded ${scoresToInsert.length} location health scores across all 16 regions of Ghana!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedGhanaMapData();
