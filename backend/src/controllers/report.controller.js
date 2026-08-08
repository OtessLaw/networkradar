const Report = require('../models/Report');
const Network = require('../models/Network');
const { latLngToGridCell, hashIP } = require('../utils/geo');
const { aggregateAfterReport } = require('../services/ReportAggregator');

exports.createReport = async (req, res, next) => {
  try {
    const { networkCode, type, description, latitude, longitude } = req.body;

    const network = await Network.findOne({ code: networkCode.toUpperCase() });
    if (!network) {
      return res.status(404).json({ error: `Network '${networkCode}' not found` });
    }

    const { gridCellId, approximateLat, approximateLng } = latLngToGridCell(
      parseFloat(latitude),
      parseFloat(longitude)
    );

    const ipHash = hashIP(req.ip);

    // Cooldown check: max 1 report per user per network+cell per 15 mins
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const existing = await Report.findOne({
      userId: req.user._id,
      networkId: network._id,
      gridCellId,
      createdAt: { $gte: fifteenMinsAgo },
    });

    if (existing) {
      return res.status(429).json({
        error: 'You have already reported a problem for this network in this area recently. Please wait 15 minutes.',
      });
    }

    const report = await Report.create({
      userId: req.user._id,
      networkId: network._id,
      type,
      description,
      gridCellId,
      approximateLat,
      approximateLng,
      weight: req.user.trustWeight || 0.3,
      ipHash,
    });

    // Increment user report count
    req.user.reportCount = (req.user.reportCount || 0) + 1;
    req.user.lastReportAt = new Date();
    await req.user.save();

    // Trigger report aggregation & confidence scoring in background
    aggregateAfterReport(network._id, gridCellId).catch(() => {});

    res.status(201).json({
      message: 'Report submitted successfully. Thank you for contributing!',
      report: {
        id: report._id,
        network: network.code,
        type: report.type,
        gridCellId,
        createdAt: report.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.network) {
      const net = await Network.findOne({ code: req.query.network.toUpperCase() });
      if (net) query.networkId = net._id;
    }

    // Public list returns anonymized report data
    const reports = await Report.find(query)
      .populate('networkId', 'name code color')
      .select('-userId -ipHash -weight -adminNote')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};
