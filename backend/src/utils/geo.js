const crypto = require('crypto');

// Ghana bounding box
const GHANA_BOUNDS = { minLat: 4.5, maxLat: 11.5, minLng: -3.5, maxLng: 1.5 };

// Grid cell size (~500m at equator)
const CELL_SIZE = 0.005;

/**
 * Fuzz lat/lng to a 500m grid cell.
 * Raw GPS coordinates are NEVER stored.
 */
const latLngToGridCell = (lat, lng) => {
  const gridLat = Math.round(lat / CELL_SIZE) * CELL_SIZE;
  const gridLng = Math.round(lng / CELL_SIZE) * CELL_SIZE;
  return {
    gridCellId: `GH-${gridLat.toFixed(3)}-${gridLng.toFixed(3)}`,
    approximateLat: parseFloat(gridLat.toFixed(3)),
    approximateLng: parseFloat(gridLng.toFixed(3)),
  };
};

/**
 * Check if coordinates are within Ghana.
 */
const isWithinGhana = (lat, lng) => {
  return (
    lat >= GHANA_BOUNDS.minLat &&
    lat <= GHANA_BOUNDS.maxLat &&
    lng >= GHANA_BOUNDS.minLng &&
    lng <= GHANA_BOUNDS.maxLng
  );
};

/**
 * Get all grid cells within a bounding box.
 */
const getCellsInBounds = (northLat, southLat, westLng, eastLng) => {
  const cells = [];
  const startLat = Math.round(southLat / CELL_SIZE) * CELL_SIZE;
  const endLat = Math.round(northLat / CELL_SIZE) * CELL_SIZE;
  const startLng = Math.round(westLng / CELL_SIZE) * CELL_SIZE;
  const endLng = Math.round(eastLng / CELL_SIZE) * CELL_SIZE;

  for (let lat = startLat; lat <= endLat + CELL_SIZE; lat += CELL_SIZE) {
    for (let lng = startLng; lng <= endLng + CELL_SIZE; lng += CELL_SIZE) {
      const gridLat = parseFloat(lat.toFixed(3));
      const gridLng = parseFloat(lng.toFixed(3));
      cells.push({
        gridCellId: `GH-${gridLat}-${gridLng}`,
        approximateLat: gridLat,
        approximateLng: gridLng,
      });
    }
  }
  return cells;
};

/**
 * Hash an IP address for abuse detection (never store raw IPs).
 */
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'nr-gh')).digest('hex');
};

/**
 * Calculate distance between two lat/lng points in km (Haversine).
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = { latLngToGridCell, isWithinGhana, getCellsInBounds, hashIP, haversineDistance };
