const Measurement = require('../models/Measurement');
const HealthScore = require('../models/HealthScore');
const Outage = require('../models/Outage');
const Network = require('../models/Network');
const { latLngToGridCell } = require('../utils/geo');

exports.getNetworkQuality = async (req, res, next) => {
  try {
    const { latitude, longitude, radius, network, dateRange } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    const { gridCellId } = latLngToGridCell(parseFloat(latitude), parseFloat(longitude));

    let networkDoc = null;
    if (network) {
      networkDoc = await Network.findOne({ code: network.toUpperCase() });
    }

    const days = parseInt(dateRange) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const query = { gridCellId, timestamp: { $gte: since } };
    if (networkDoc) query.networkId = networkDoc._id;

    const agg = await Measurement.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$networkId',
          measurementCount: { $sum: 1 },
          avgSpeed: { $avg: '$downloadSpeed' },
          avgLatency: { $avg: '$latency' },
          successRate: { $avg: { $cond: ['$connectionSuccess', 1, 0] } },
        },
      },
    ]);

    const outageQuery = { gridCellId, startedAt: { $gte: since } };
    if (networkDoc) outageQuery.networkId = networkDoc._id;
    const outageCount = await Outage.countDocuments(outageQuery);

    const healthScores = await HealthScore.find({ gridCellId }).populate('networkId', 'name code color');

    res.json({
      location: { latitude, longitude, gridCellId },
      dateRangeDays: days,
      networks: healthScores.map(score => ({
        network: score.networkId.code,
        score: score.score,
        status: score.status,
        confidence: score.confidence,
        avgDownloadSpeed: score.avgDownloadSpeed,
        avgLatency: score.avgLatency,
        connectionSuccessRate: score.connectionSuccessRate,
      })),
      outageCount,
    });
  } catch (err) {
    next(err);
  }
};
