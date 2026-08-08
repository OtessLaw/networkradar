const User = require('../models/User');
const Report = require('../models/Report');
const Measurement = require('../models/Measurement');
const Outage = require('../models/Outage');
const Network = require('../models/Network');
const ScoringConfig = require('../models/ScoringConfig');
const { invalidateConfigCache } = require('../services/NetworkHealthEngine');

exports.getAdminStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalUsers = await User.countDocuments();
    const activeUsers24h = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const reportsToday = await Report.countDocuments({ createdAt: { $gte: today } });
    const measurementsToday = await Measurement.countDocuments({ timestamp: { $gte: today } });

    const activeOutages = await Outage.countDocuments({ status: 'confirmed_community' });
    const possibleOutages = await Outage.countDocuments({ status: 'possible' });

    res.json({
      stats: {
        totalUsers,
        activeUsers24h,
        reportsToday,
        measurementsToday,
        activeOutages,
        possibleOutages,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

exports.updateUserReputation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reputation, trustWeight } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (reputation) user.reputation = reputation;
    if (trustWeight !== undefined) user.trustWeight = trustWeight;

    await user.save();

    res.json({ message: 'User reputation updated', user });
  } catch (err) {
    next(err);
  }
};

exports.getAdminReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const reports = await Report.find(query)
      .populate('userId', 'name email reputation')
      .populate('networkId', 'name code color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({ reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (status) report.status = status;
    if (adminNote) report.adminNote = adminNote;

    await report.save();

    res.json({ message: 'Report status updated', report });
  } catch (err) {
    next(err);
  }
};

exports.getAdminOutages = async (req, res, next) => {
  try {
    const outages = await Outage.find()
      .populate('networkId', 'name code color')
      .sort({ startedAt: -1 });

    res.json({ outages });
  } catch (err) {
    next(err);
  }
};

exports.updateOutageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const outage = await Outage.findById(id);
    if (!outage) return res.status(404).json({ error: 'Outage not found' });

    outage.status = status;
    outage.adminConfirmed = true;
    outage.lastUpdatedAt = new Date();
    if (status === 'resolved') outage.resolvedAt = new Date();

    await outage.save();

    res.json({ message: 'Outage status updated', outage });
  } catch (err) {
    next(err);
  }
};

exports.getScoringConfig = async (req, res, next) => {
  try {
    let config = await ScoringConfig.findOne();
    if (!config) config = await ScoringConfig.create({});
    res.json({ config });
  } catch (err) {
    next(err);
  }
};

exports.updateScoringConfig = async (req, res, next) => {
  try {
    let config = await ScoringConfig.findOne();
    if (!config) config = new ScoringConfig();

    const { weights, confidenceThresholds, outageThresholds, reportRateLimit, dataRetentionDays } = req.body;

    if (weights) config.weights = { ...config.weights, ...weights };
    if (confidenceThresholds) config.confidenceThresholds = { ...config.confidenceThresholds, ...confidenceThresholds };
    if (outageThresholds) config.outageThresholds = { ...config.outageThresholds, ...outageThresholds };
    if (reportRateLimit) config.reportRateLimit = { ...config.reportRateLimit, ...reportRateLimit };
    if (dataRetentionDays !== undefined) config.dataRetentionDays = dataRetentionDays;

    config.updatedAt = new Date();
    await config.save();

    invalidateConfigCache();

    res.json({ message: 'Scoring configuration updated successfully', config });
  } catch (err) {
    next(err);
  }
};

exports.getAdminNetworks = async (req, res, next) => {
  try {
    const networks = await Network.find();
    res.json({ networks });
  } catch (err) {
    next(err);
  }
};
