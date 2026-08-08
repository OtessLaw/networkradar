const Measurement = require('../models/Measurement');
const Report = require('../models/Report');
const Outage = require('../models/Outage');
const ScoringConfig = require('../models/ScoringConfig');
const Network = require('../models/Network');
const logger = require('../utils/logger');

let io;
const setIO = (socketIO) => { io = socketIO; };

async function getConfig() {
  let config = await ScoringConfig.findOne();
  if (!config) config = await ScoringConfig.create({});
  return config;
}

async function detectForCell(networkId, gridCellId, network, config) {
  const windowMs = config.outageThresholds.windowMinutes * 60 * 1000;
  const since = new Date(Date.now() - windowMs);

  // Current failure rate in the window
  const currentAgg = await Measurement.aggregate([
    { $match: { networkId, gridCellId, timestamp: { $gte: since } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        failed: { $sum: { $cond: [{ $eq: ['$connectionSuccess', false] }, 1, 0] } },
      },
    },
  ]);
  const current = currentAgg[0];
  if (!current || current.total < 3) return; // Not enough data

  const currentFailRate = current.failed / current.total;

  // Baseline: same hour, last 7 days
  const now = new Date();
  const baselineSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const baselineAgg = await Measurement.aggregate([
    {
      $match: {
        networkId,
        gridCellId,
        timestamp: {
          $gte: baselineSince,
          $lt: new Date(Date.now() - windowMs),
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        failed: { $sum: { $cond: [{ $eq: ['$connectionSuccess', false] }, 1, 0] } },
      },
    },
  ]);
  const baseline = baselineAgg[0];
  const baselineFailRate = baseline ? baseline.failed / baseline.total : 0.05; // assume 5% baseline

  // Count recent reports
  const reportCount = await Report.countDocuments({
    networkId,
    gridCellId,
    status: { $in: ['pending', 'verified'] },
    createdAt: { $gte: since },
  });

  const failureRateDrop = config.outageThresholds.failureRateDrop;
  const significantDrop = currentFailRate > baselineFailRate + failureRateDrop;
  const reportSpike = reportCount >= config.outageThresholds.possibleReports;

  if (!significantDrop && !reportSpike) {
    // Check if existing outage should be resolved
    const existingOutage = await Outage.findOne({
      networkId, gridCellId, status: { $in: ['possible', 'confirmed_community'] }
    });
    if (existingOutage) {
      // Recovery check: success rate back to >85% of baseline
      const currentSuccessRate = 1 - currentFailRate;
      const baselineSuccessRate = 1 - baselineFailRate;
      if (currentSuccessRate >= baselineSuccessRate * 0.85 && reportCount < 2) {
        existingOutage.status = 'resolved';
        existingOutage.resolvedAt = new Date();
        existingOutage.lastUpdatedAt = new Date();
        await existingOutage.save();
        logger.info(`✅ Outage resolved: ${network.code} @ ${gridCellId}`);
        if (io) {
          io.to(`network:${network.code}`).emit('outage:resolved', {
            outageId: existingOutage._id,
            networkCode: network.code,
            area: existingOutage.area,
            resolvedAt: existingOutage.resolvedAt,
          });
        }
      }
    }
    return;
  }

  // Determine status
  const isConfirmed = reportCount >= config.outageThresholds.confirmedReports && currentFailRate > 0.3;
  const newStatus = isConfirmed ? 'confirmed_community' : 'possible';
  const confidence = reportCount >= 10 ? 'high' : reportCount >= 5 ? 'medium' : 'low';

  // Find first measurement in cell for approximate location
  const sampleMeasurement = await Measurement.findOne({ networkId, gridCellId });

  const existingOutage = await Outage.findOne({
    networkId, gridCellId, status: { $in: ['possible', 'confirmed_community'] }
  });

  let outage;
  if (existingOutage) {
    existingOutage.status = newStatus;
    existingOutage.confidence = confidence;
    existingOutage.reportCount = reportCount;
    existingOutage.failedMeasurementCount = current.failed;
    existingOutage.lastUpdatedAt = new Date();
    outage = await existingOutage.save();
    if (io) io.to(`network:${network.code}`).emit('outage:updated', { outage: outage.toObject() });
  } else {
    outage = await Outage.create({
      networkId,
      gridCellId,
      area: gridCellId,
      approximateLat: sampleMeasurement?.approximateLat,
      approximateLng: sampleMeasurement?.approximateLng,
      status: newStatus,
      confidence,
      reportCount,
      failedMeasurementCount: current.failed,
      autoDetected: true,
    });
    logger.info(`⚠️  New outage detected: ${network.code} @ ${gridCellId} (${newStatus})`);
    if (io) io.to(`network:${network.code}`).emit('outage:detected', { outage: outage.toObject() });
  }
}

async function detectAll() {
  try {
    const config = await getConfig();
    const networks = await Network.find({ active: true });

    const windowMs = config.outageThresholds.windowMinutes * 60 * 1000;
    const since = new Date(Date.now() - windowMs);

    const activeCells = await Measurement.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: { networkId: '$networkId', gridCellId: '$gridCellId' } } },
    ]);

    for (const cell of activeCells) {
      const network = networks.find(n => n._id.toString() === cell._id.networkId.toString());
      if (network) {
        await detectForCell(cell._id.networkId, cell._id.gridCellId, network, config);
      }
    }
  } catch (err) {
    logger.error(`OutageDetector.detectAll error: ${err.message}`);
  }
}

// Trigger detection for a specific cell after new reports
async function detectForCellNow(networkId, gridCellId) {
  try {
    const config = await getConfig();
    const network = await Network.findById(networkId);
    if (network) await detectForCell(networkId, gridCellId, network, config);
  } catch (err) {
    logger.error(`OutageDetector.detectForCellNow error: ${err.message}`);
  }
}

module.exports = { detectAll, detectForCellNow, setIO };
