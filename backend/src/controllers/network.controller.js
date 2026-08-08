const Network = require('../models/Network');
const HealthScore = require('../models/HealthScore');
const Measurement = require('../models/Measurement');
const Report = require('../models/Report');

exports.getNetworks = async (req, res, next) => {
  try {
    const networks = await Network.find({ active: true }).sort({ name: 1 });
    res.json({ networks });
  } catch (err) {
    next(err);
  }
};

exports.getNetworkStats = async (req, res, next) => {
  try {
    const { code } = req.params;
    const network = await Network.findOne({ code: code.toUpperCase() });
    if (!network) {
      return res.status(404).json({ error: 'Network not found' });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const agg = await Measurement.aggregate([
      { $match: { networkId: network._id, timestamp: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalMeasurements: { $sum: 1 },
          avgDownload: { $avg: '$downloadSpeed' },
          avgUpload: { $avg: '$uploadSpeed' },
          avgLatency: { $avg: '$latency' },
          successRate: { $avg: { $cond: ['$connectionSuccess', 1, 0] } },
        },
      },
    ]);

    const reportCount = await Report.countDocuments({
      networkId: network._id,
      createdAt: { $gte: since },
    });

    const stats = agg[0] || {
      totalMeasurements: 0,
      avgDownload: null,
      avgUpload: null,
      avgLatency: null,
      successRate: null,
    };

    res.json({
      network,
      stats: {
        totalMeasurements24h: stats.totalMeasurements,
        reports24h: reportCount,
        avgDownloadSpeed: stats.avgDownload ? parseFloat(stats.avgDownload.toFixed(2)) : null,
        avgUploadSpeed: stats.avgUpload ? parseFloat(stats.avgUpload.toFixed(2)) : null,
        avgLatency: stats.avgLatency ? Math.round(stats.avgLatency) : null,
        connectionSuccessRate: stats.successRate ? parseFloat((stats.successRate * 100).toFixed(1)) : null,
      },
    });
  } catch (err) {
    next(err);
  }
};
