const User = require('../models/User');
const Report = require('../models/Report');
const Measurement = require('../models/Measurement');

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    delete user.refreshTokens;
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, notificationPreferences, savedLocations } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }
    if (savedLocations) user.savedLocations = savedLocations;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    delete updatedUser.refreshTokens;

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    await Report.deleteMany({ userId });
    res.json({ message: 'Account and associated reports deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ userId: req.user._id })
      .populate('networkId', 'name code color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ userId: req.user._id });

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyMeasurements = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const measurements = await Measurement.find({ userId: req.user._id })
      .populate('networkId', 'name code color')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Measurement.countDocuments({ userId: req.user._id });

    res.json({
      measurements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
