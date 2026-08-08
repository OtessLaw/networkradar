const Measurement = require('../models/Measurement');
const Report = require('../models/Report');
const Outage = require('../models/Outage');
const HealthScore = require('../models/HealthScore');
const ScoringConfig = require('../models/ScoringConfig');
const Network = require('../models/Network');
const logger = require('../utils/logger');

let cachedConfig = null;
let configCachedAt = null;
const CONFIG_CACHE_MS = 5 * 60 * 1000; // cache for 5 minutes

async function getConfig() {
  if (cachedConfig && configCachedAt && Date.now() - configCachedAt < CONFIG_CACHE_MS) {
    return cachedConfig;
  }
  let config = await ScoringConfig.findOne();
  if (!config) {
    config = await ScoringConfig.create({});
  }
  cachedConfig = config;
  configCachedAt = Date.now();
  return config;
}

function invalidateConfigCache() {
  cachedConfig = null;
  configCachedAt = null;
}

// --- Score component functions ---

function scoreSignal(avgDbm) {
  if (avgDbm === null || avgDbm === undefined) return null;
  // -50 dBm = excellent (100), -120 dBm = terrible (0)
  return Math.max(0, Math.min(100, ((avgDbm + 120) / 70) * 100));
}

function scoreSpeed(avgMbps) {
  if (avgMbps === null || avgMbps === undefined) return null;
  // 0 Mbps = 0, 50+ Mbps = 100
  return Math.max(0, Math.min(100, (avgMbps / 50) * 100));
}

function scoreLatency(avgMs) {
  if (avgMs === null || avgMs === undefined) return null;
  // <20ms = 100, >500ms = 0
  return Math.max(0, Math.min(100, ((500 - avgMs) / 480) * 100));
}

function scoreReliability(successRate) {
  if (successRate === null || successRate === undefined) return null;
  return successRate * 100; // 0-1 → 0-100
}

function scoreOutagePenalty(hasActiveOutage, reportCount) {
  if (!hasActiveOutage) return 100;
  // Graduated penalty: more reports = lower score
  const penalty = Math.min(40, reportCount * 2);
  return Math.max(0, 100 - penalty);
}

function getConfidenceLevel(measurementCount, thresholds) {
  if (measurementCount < thresholds.insufficient) return 'insufficient';
  if (measurementCount < thresholds.low) return 'low';
  if (measurementCount < thresholds.medium) return 'medium';
  if (measurementCount < thresholds.high) return 'high';
  return 'very_high';
}

function getStatusFromScore(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'critical';
}

// --- Main engine ---

async function calculateForCell(networkId, gridCellId, config) {
  const windowMs = 24 * 60 * 60 * 1000; // 24-hour window
  const since = new Date(Date.now() - windowMs);

  // Aggregate measurements for this cell+network in the last 24h
  const agg = await Measurement.aggregate([
    {
      $match: {
        networkId,
        gridCellId,
        timestamp: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgDownload: { $avg: '$downloadSpeed' },
        avgUpload: { $avg: '$uploadSpeed' },
        avgLatency: { $avg: '$latency' },
        avgSignal: { $avg: '$signalStrength' },
        successCount: {
          $sum: { $cond: ['$connectionSuccess', 1, 0] },
        },
        totalCoords: {
          $first: { approximateLat: '$approximateLat', approximateLng: '$approximateLng' },
        },
        approximateLat: { $first: '$approximateLat' },
        approximateLng: { $first: '$approximateLng' },
      },
    },
  ]);

  const data = agg[0] || null;
  const measurementCount = data?.count || 0;
  const confidence = getConfidenceLevel(measurementCount, config.confidenceThresholds);

  // Count recent reports (last 2h for weight)
  const recentReports = await Report.countDocuments({
    networkId,
    gridCellId,
    status: { $in: ['pending', 'verified'] },
    createdAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  });

  // Check active outage
  const activeOutage = await Outage.findOne({
    networkId,
    gridCellId,
    status: { $in: ['possible', 'confirmed_community'] },
  });

  // If insufficient data, store null score
  if (confidence === 'insufficient') {
    await HealthScore.findOneAndUpdate(
      { networkId, gridCellId },
      {
        networkId,
        gridCellId,
        approximateLat: data?.approximateLat || 0,
        approximateLng: data?.approximateLng || 0,
        score: null,
        status: 'insufficient_data',
        confidence: 'insufficient',
        measurementCount,
        reportCount: recentReports,
        avgDownloadSpeed: null,
        avgUploadSpeed: null,
        avgLatency: null,
        avgSignalStrength: null,
        connectionSuccessRate: null,
        activeOutage: !!activeOutage,
        calculatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return null;
  }

  const successRate = data.successCount / data.count;
  const { weights } = config;

  // Calculate component scores
  const components = {
    signal:      scoreSignal(data.avgSignal),
    speed:       scoreSpeed(data.avgDownload),
    latency:     scoreLatency(data.avgLatency),
    reliability: scoreReliability(successRate),
    outage:      scoreOutagePenalty(!!activeOutage, recentReports),
  };

  // Weighted sum — skip null components, redistribute weight
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, val] of Object.entries(components)) {
    if (val !== null) {
      const w = weights[key] || 0;
      weightedSum += val * w;
      totalWeight += w;
    }
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
  const status = score !== null ? getStatusFromScore(score) : 'insufficient_data';

  const result = await HealthScore.findOneAndUpdate(
    { networkId, gridCellId },
    {
      networkId,
      gridCellId,
      approximateLat: data.approximateLat,
      approximateLng: data.approximateLng,
      score,
      status,
      confidence,
      measurementCount,
      reportCount: recentReports,
      avgDownloadSpeed: data.avgDownload ? parseFloat(data.avgDownload.toFixed(2)) : null,
      avgUploadSpeed: data.avgUpload ? parseFloat(data.avgUpload.toFixed(2)) : null,
      avgLatency: data.avgLatency ? parseFloat(data.avgLatency.toFixed(0)) : null,
      avgSignalStrength: data.avgSignal ? parseFloat(data.avgSignal.toFixed(1)) : null,
      connectionSuccessRate: parseFloat(successRate.toFixed(3)),
      activeOutage: !!activeOutage,
      calculatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return result;
}

async function recalculateAll() {
  try {
    const config = await getConfig();
    const networks = await Network.find({ active: true });

    // Find all distinct gridCells with recent measurements
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const distinctCells = await Measurement.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: { networkId: '$networkId', gridCellId: '$gridCellId' } } },
    ]);

    let processed = 0;
    for (const cell of distinctCells) {
      try {
        await calculateForCell(cell._id.networkId, cell._id.gridCellId, config);
        processed++;
      } catch (err) {
        logger.error(`HealthEngine error for cell ${cell._id.gridCellId}: ${err.message}`);
      }
    }

    logger.info(`NetworkHealthEngine: recalculated ${processed} network-cell combinations`);
    return processed;
  } catch (err) {
    logger.error(`NetworkHealthEngine.recalculateAll error: ${err.message}`);
    throw err;
  }
}

// Recalculate a single cell immediately (called after new measurement submission)
async function recalculateCell(networkId, gridCellId) {
  try {
    const config = await getConfig();
    return await calculateForCell(networkId, gridCellId, config);
  } catch (err) {
    logger.error(`NetworkHealthEngine.recalculateCell error: ${err.message}`);
    return null;
  }
}

module.exports = { recalculateAll, recalculateCell, invalidateConfigCache, getStatusFromScore };
