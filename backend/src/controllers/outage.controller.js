const Outage = require('../models/Outage');
const Network = require('../models/Network');

exports.getOutages = async (req, res, next) => {
  try {
    const { status, network } = req.query;
    const query = {};

    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = { $in: ['possible', 'confirmed_community'] };
      } else {
        query.status = status;
      }
    }

    if (network) {
      const net = await Network.findOne({ code: network.toUpperCase() });
      if (net) query.networkId = net._id;
    }

    const outages = await Outage.find(query)
      .populate('networkId', 'name code color')
      .sort({ startedAt: -1 });

    res.json({ outages });
  } catch (err) {
    next(err);
  }
};

exports.getActiveOutages = async (req, res, next) => {
  try {
    const outages = await Outage.find({ status: { $in: ['possible', 'confirmed_community'] } })
      .populate('networkId', 'name code color')
      .sort({ startedAt: -1 });

    res.json({ outages });
  } catch (err) {
    next(err);
  }
};
