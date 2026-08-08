import api from './api';

export const locationService = {
  getMapData: (bounds) => api.get('/locations/map-data', { params: bounds }),

  // Reverse geocode exact GPS coordinates to human-readable address
  reverseGeocode: async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=19&addressdetails=1`,
        { headers: { 'User-Agent': 'NetworkRadarGhana/2.0' } }
      );
      const data = await res.json();
      const addr = data?.address || {};

      const street =
        addr.road ||
        addr.street ||
        addr.pedestrian ||
        addr.path ||
        addr.footway ||
        addr.amenity ||
        addr.building ||
        addr.commercial ||
        addr.shop;

      const suburb =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.village ||
        addr.city_district ||
        addr.town;

      const city = addr.city || addr.town || addr.county || 'Ghana';
      const district = addr.county || addr.state_district || addr.state || city;

      const landmark = street
        ? suburb
          ? `${street}, ${suburb}`
          : `${street}, ${city}`
        : suburb
        ? `${suburb}, ${city}`
        : `${city}`;

      return {
        landmark,
        suburb: suburb || city,
        district,
        city,
        formattedAddress: data.display_name || `${landmark}, ${district}`,
      };
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
      return {
        landmark: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        suburb: 'Ghana',
        district: 'Ghana',
        city: 'Ghana',
        formattedAddress: `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
    }
  },

  // Secondary IP Geolocation (Strictly informational fallback ONLY)
  getIpLocation: async () => {
    try {
      const res = await fetch('https://freeipapi.com/api/json', { cache: 'no-store' });
      const data = await res.json();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          cityName: data.cityName || 'Ghana',
          regionName: data.regionName || 'Ghana',
          countryName: data.countryName || 'Ghana',
          source: 'ip'
        };
      }
    } catch {
      try {
        const res2 = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        const data2 = await res2.json();
        if (data2 && typeof data2.latitude === 'number' && typeof data2.longitude === 'number') {
          return {
            latitude: data2.latitude,
            longitude: data2.longitude,
            cityName: data2.city || 'Ghana',
            regionName: data2.region || 'Ghana',
            countryName: data2.country_name || 'Ghana',
            source: 'ip'
          };
        }
      } catch {
        // Fail quietly
      }
    }
    return null;
  }
};

export default locationService;
