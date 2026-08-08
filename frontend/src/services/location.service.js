import api from './api';

export const locationService = {
  getMapData: (bounds) => api.get('/locations/map-data', { params: bounds }),

  // Reverse geocode exact GPS coordinates to human-readable address with resilient fallbacks
  reverseGeocode: async (lat, lng) => {
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      return { landmark: 'Ghana', suburb: 'Ghana', district: 'Ghana', city: 'Ghana' };
    }

    // Source 1: BigDataCloud (Fast, 0 CORS restriction, 100% free client API)
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { cache: 'no-store' }
      );
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const locality = bdcData.locality || bdcData.city || bdcData.localityInfo?.administrative?.[2]?.name || bdcData.localityInfo?.informative?.[0]?.name;
        const region = bdcData.principalSubdivision || bdcData.city || 'Ghana';

        if (locality) {
          const landmarkName = region && region !== locality ? `${locality}, ${region}` : locality;
          return {
            landmark: landmarkName,
            suburb: locality,
            district: region,
            city: bdcData.city || region,
            formattedAddress: `${landmarkName}, Ghana`
          };
        }
      }
    } catch {
      // Try Nominatim as secondary fallback
    }

    // Source 2: OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'NetworkRadarGhana/2.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data?.address || {};

        const street =
          addr.road ||
          addr.street ||
          addr.pedestrian ||
          addr.path ||
          addr.footway ||
          addr.amenity ||
          addr.building;

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
      }
    } catch {
      // Fall through
    }

    return {
      landmark: `Standing Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      suburb: 'Ghana',
      district: 'Ghana',
      city: 'Ghana',
      formattedAddress: `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  },

  // Secondary IP Geolocation (Informational fallback ONLY)
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
