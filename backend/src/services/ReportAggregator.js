const Report = require('../models/Report');
const ScoringConfig = require('../models/ScoringConfig');
const OutageDetector = require('./OutageDetector');
const logger = require('../utils/logger');

async function getConfig() {
  let config = await ScoringConfig.findOne();
  if (!config) config = await ScoringConfig.create({});
  return config;
}

/**
 * After a new report is submitted, re-assess confidence for the
 * network+cell+time window and update all pending reports' confidence.
 */
async function aggregateAfterReport(networkId, gridCellId) {
  try {
    const config = await getConfig();
    const windowMs = 2 * 60 * 60 * 1000; // 2-hour aggregation window
    const since = new Date(Date.now() - windowMs);

    const reports = await Report.find({
      networkId,
      gridCellId,
      status: { $in: ['pending', 'verified'] },
      createdAt: { $gte: since },
    }).populate('userId', 'trustWeight reputation');

    if (reports.length === 0) return;

    // Count distinct users and IPs
    const distinctUsers = new Set(reports.map(r => r.userId?._id?.toString()).filter(Boolean));
    const distinctIPs = new Set(reports.map(r => r.ipHash).filter(Boolean));

    // Weighted confidence score
    const totalWeight = reports.reduce((sum, r) => sum + (r.weight || 0.3), 0);
    const maxExpected = 5; // 5 trusted users → maximum confidence
    const weightScore = Math.min(1, totalWeight / maxExpected);

    // Adjust for distinct sources (more distinct = more credible)
    const distinctBonus = Math.min(0.3, (distinctUsers.size * 0.05) + (distinctIPs.size * 0.03));
    const finalScore = Math.min(1, weightScore + distinctBonus);

    let confidence;
    if (reports.length >= 10 && finalScore >= 0.7) confidence = 'high';
    else if (reports.length >= 5 && finalScore >= 0.4) confidence = 'medium';
    else if (reports.length >= 2) confidence = 'low';
    else confidence = 'very_low';

    // Update all reports in window with new confidence
    await Report.updateMany(
      { _id: { $in: reports.map(r => r._id) } },
      { $set: { confidence } }
    );

    logger.debug(`ReportAggregator: ${reports.length} reports → confidence: ${confidence}`);

    // If medium+ confidence, trigger outage detection
    if (confidence === 'medium' || confidence === 'high') {
      await OutageDetector.detectForCellNow(networkId, gridCellId);
    }
  } catch (err) {
    logger.error(`ReportAggregator.aggregateAfterReport error: ${err.message}`);
  }
}

module.exports = { aggregateAfterReport };
