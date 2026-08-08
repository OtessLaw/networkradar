const HealthScore = require('../models/HealthScore');
const Network = require('../models/Network');

// Preset Ghana regions/cities for search
const GHANA_LOCATIONS = [
  { name: 'Madina, Accra', lat: 5.668, lng: -0.166 },
  { name: 'East Legon, Accra', lat: 5.635, lng: -0.155 },
  { name: 'Osu, Accra', lat: 5.555, lng: -0.183 },
  { name: 'Spintex, Accra', lat: 5.620, lng: -0.100 },
  { name: 'Circle, Accra', lat: 5.558, lng: -0.207 },
  { name: 'Kumasi Central', lat: 6.688, lng: -1.624 },
  { name: 'KNUST, Kumasi', lat: 6.674, lng: -1.571 },
  { name: 'Bantama, Kumasi', lat: 6.700, lng: -1.635 },
  { name: 'Tamale Central', lat: 9.407, lng: -0.853 },
  { name: 'Takoradi Market Circle', lat: 4.884, lng: -1.755 },
  { name: 'Cape Coast', lat: 5.105, lng: -1.246 },
  { name: 'Sunyani', lat: 7.334, lng: -2.326 },
  { name: 'Ho', lat: 6.600, lng: 0.470 },
  { name: 'Koforidua', lat: 6.084, lng: -0.259 },
  { name: 'Tema Community 1', lat: 5.645, lng: 0.000 },
];

exports.getMapData = async (req, res, next) => {
  try {
    const { northLat, southLat, westLng, eastLng, network } = req.query;

    const query = {};

    if (northLat && southLat && westLng && eastLng) {
      query.approximateLat = { $gte: parseFloat(southLat), $lte: parseFloat(northLat) };
      query.approximateLng = { $gte: parseFloat(westLng), $lte: parseFloat(eastLng) };
    }

    if (network && network !== 'all') {
      const net = await Network.findOne({ code: network.toUpperCase() });
      if (net) query.networkId = net._id;
    }

    // Fetch pre-aggregated health scores (cell-based, never raw measurements)
    const scores = await HealthScore.find(query)
      .populate('networkId', 'name code color')
      .sort({ calculatedAt: -1 });

    res.json({ cells: scores });
  } catch (err) {
    next(err);
  }
};

exports.searchLocations = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.json({ locations: [] });

    const matches = GHANA_LOCATIONS.filter((loc) =>
      loc.name.toLowerCase().includes(q)
    );

    res.json({ locations: matches });
  } catch (err) {
    next(err);
  }
};

exports.getCellSummary = async (req, res, next) => {
  try {
    const { gridCellId } = req.params;
    const scores = await HealthScore.find({ gridCellId }).populate(
      'networkId',
      'name code color'
    );

    res.json({ gridCellId, scores });
  } catch (err) {
    next(err);
  }
};
