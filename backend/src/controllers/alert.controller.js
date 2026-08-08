const Alert = require('../models/Alert');
const Network = require('../models/Network');
const { latLngToGridCell } = require('../utils/geo');

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id })
      .populate('networkId', 'name code color')
      .sort({ createdAt: -1 });

    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

exports.createAlert = async (req, res, next) => {
  try {
    const { networkCode, area, latitude, longitude, alertType } = req.body;

    let networkId = null;
    if (networkCode) {
      const net = await Network.findOne({ code: networkCode.toUpperCase() });
      if (net) networkId = net._id;
    }

    let gridCellId = null;
    let approximateLat = null;
    let approximateLng = null;

    if (latitude && longitude) {
      const cell = latLngToGridCell(parseFloat(latitude), parseFloat(longitude));
      gridCellId = cell.gridCellId;
      approximateLat = cell.approximateLat;
      approximateLng = cell.approximateLng;
    }

    const alert = await Alert.create({
      userId: req.user._id,
      networkId,
      area: area || 'General Area',
      gridCellId,
      approximateLat,
      approximateLng,
      alertType: alertType || 'outage',
    });

    const populated = await alert.populate('networkId', 'name code color');
    res.status(201).json({ message: 'Alert subscription created', alert: populated });
  } catch (err) {
    next(err);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!alert) {
      return res.status(404).json({ error: 'Alert subscription not found' });
    }
    res.json({ message: 'Alert subscription deleted successfully' });
  } catch (err) {
    next(err);
  }
};
