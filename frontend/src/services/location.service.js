import api from './api';
import { getDistanceKm } from '../utils/geo';

// Pre-configured known Ghanaian hubs and suburbs for instant offline/CORS fallback
const GHANA_KNOWN_LOCATIONS = [
  { name: 'Osu Castle / Osu', lat: 5.5471, lng: -0.1838, suburb: 'Osu', city: 'Accra' },
  { name: 'East Legon', lat: 5.6353, lng: -0.1578, suburb: 'East Legon', city: 'Accra' },
  { name: 'Oyibi', lat: 5.7952, lng: -0.1335, suburb: 'Oyibi', city: 'Greater Accra' },
  { name: 'Madina', lat: 5.6683, lng: -0.1664, suburb: 'Madina', city: 'Accra' },
  { name: 'Airport Residential Area', lat: 5.5972, lng: -0.1802, suburb: 'Airport Residential', city: 'Accra' },
  { name: 'Cape Coast Castle / Cape Coast', lat: 5.1053, lng: -1.2466, suburb: 'Cape Coast Central', city: 'Cape Coast' },
  { name: 'Kumasi Central / Adum', lat: 6.6885, lng: -1.6244, suburb: 'Adum', city: 'Kumasi' },
  { name: 'KNUST Campus', lat: 6.6743, lng: -1.5714, suburb: 'KNUST', city: 'Kumasi' },
  { name: 'Takoradi Market Circle', lat: 4.8872, lng: -1.7584, suburb: 'Takoradi Central', city: 'Takoradi' },
  { name: 'Tamale Central', lat: 9.4075, lng: -0.8533, suburb: 'Tamale Central', city: 'Tamale' },
  { name: 'Sunyani Central', lat: 7.3349, lng: -2.3123, suburb: 'Sunyani', city: 'Bono Region' },
  { name: 'Ho Central', lat: 6.6101, lng: 0.4785, suburb: 'Ho', city: 'Volta Region' },
  { name: 'Koforidua', lat: 6.0941, lng: -0.2591, suburb: 'Koforidua', city: 'Eastern Region' },
  { name: 'Spintex Road', lat: 5.6189, lng: -0.1042, suburb: 'Spintex', city: 'Accra' },
  { name: 'Dansoman', lat: 5.5562, lng: -0.2647, suburb: 'Dansoman', city: 'Accra' },
  { name: 'Tema Community 1', lat: 5.6441, lng: -0.0069, suburb: 'Tema C1', city: 'Tema' },
  { name: 'Kasoa', lat: 5.5342, lng: -0.4168, suburb: 'Kasoa', city: 'Central Region' }
];

export const locationService = {
  getMapData: (bounds) => api.get('/locations/map-data', { params: bounds }),

  // Reverse geocode exact GPS coordinates to human-readable address with resilient fallbacks
  reverseGeocode: async (lat, lng) => {
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      return { landmark: 'Ghana', suburb: 'Ghana', district: 'Ghana', city: 'Ghana' };
    }

    // 1. Check nearest known Ghanaian location (Instant < 2km match)
    let closestKnown = null;
    let minDistance = Infinity;

    for (const loc of GHANA_KNOWN_LOCATIONS) {
      const dist = getDistanceKm(lat, lng, loc.lat, loc.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestKnown = loc;
      }
    }

    // 2. Fetch BigDataCloud (Fast, 0 CORS restriction, 100% free client API)
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { cache: 'no-store' }
      );
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const locality = bdcData.locality || bdcData.city || bdcData.localityInfo?.administrative?.[2]?.name || bdcData.localityInfo?.informative?.[0]?.name;
        const region = bdcData.principalSubdivision || bdcData.city || 'Ghana';

        if (locality && locality !== 'Ghana') {
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
      // Fall through to Nominatim or closest match
    }

    // 3. OpenStreetMap Nominatim
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

        if (landmark && landmark !== 'Ghana') {
          return {
            landmark,
            suburb: suburb || city,
            district,
            city,
            formattedAddress: data.display_name || `${landmark}, ${district}`,
          };
        }
      }
    } catch {
      // Fall through
    }

    // 4. If closest known match is within 15km in Ghana, return it!
    if (closestKnown && minDistance <= 15) {
      return {
        landmark: `${closestKnown.name}`,
        suburb: closestKnown.suburb,
        district: closestKnown.city,
        city: closestKnown.city,
        formattedAddress: `${closestKnown.name}, ${closestKnown.city}, Ghana`
      };
    }

    return {
      landmark: `Standing Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
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
