const { isWithinGhana } = require('../utils/geo');

const geoValidate = (latField = 'latitude', lngField = 'longitude') => (req, res, next) => {
  const lat = parseFloat(req.body[latField] || req.query[latField]);
  const lng = parseFloat(req.body[lngField] || req.query[lngField]);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: `${latField} and ${lngField} are required` });
  }
  if (!isWithinGhana(lat, lng)) {
    return res.status(400).json({
      error: 'Location must be within Ghana (lat: 4.5–11.5, lng: -3.5–1.5)',
    });
  }
  next();
};

module.exports = geoValidate;
