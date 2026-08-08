function latLngToGridCell(lat, lng) {
  const CELL_SIZE = 0.005; // ~500m
  const gridLat = Math.round(lat / CELL_SIZE) * CELL_SIZE;
  const gridLng = Math.round(lng / CELL_SIZE) * CELL_SIZE;
  return {
    gridCellId: \`GH-\${gridLat.toFixed(3)}-\${gridLng.toFixed(3)}\`,
    approximateLat: gridLat,
    approximateLng: gridLng
  };
}

function isWithinGhana(lat, lng) {
  return lat >= 4.5 && lat <= 11.5 && lng >= -3.5 && lng <= 1.5;
}

module.exports = {
  latLngToGridCell,
  isWithinGhana
};
