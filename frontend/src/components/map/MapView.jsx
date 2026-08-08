import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GHANA_CENTER, GHANA_BOUNDS } from '../../constants/ghana';
import { locationService } from '../../services/location.service';
import { MapFilters } from './MapFilters';
import { CellPopup } from './CellPopup';
import { useSocket } from '../../hooks/useSocket';
import { Spinner } from '../common/Spinner';
import { Search, MapPin, LocateFixed, Crosshair, Loader2, Route, Move, Terminal, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { getDistanceKm } from '../../utils/geo';
import { useGeolocation } from '../../hooks/useGeolocation';

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Modern Subtle Live GPS Blue Dot Marker (Softer, elegant pulse effect)
const createLiveUserDotIcon = (heading = null) => {
  const rotationStyle = heading !== null && !isNaN(heading) ? `transform: rotate(${heading}deg);` : '';
  
  return L.divIcon({
    className: 'live-gps-user-marker-container',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <!-- Subtle Soft Pulsing Radar Ring -->
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.25);" class="animate-ping"></div>
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.10);"></div>
        <!-- Inner Core Blue Dot -->
        <div style="position: relative; width: 18px; height: 18px; background-color: #2563eb; border: 2.5px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center;">
          ${heading !== null && !isNaN(heading) ? `
            <div style="${rotationStyle} color: white; font-size: 9px; font-weight: bold; line-height: 1;">▲</div>
          ` : `
            <div style="width: 5px; height: 5px; background-color: #ffffff; border-radius: 9999px;"></div>
          `}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Component to force Leaflet map size recalculation on mount and resize
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
}

// Component to handle map clicks, drag start, & bounds updates
function MapEventsHandler({ onBoundsChange, isPinpointMode, onMapClick, onUserDrag }) {
  useMapEvents({
    moveend: (e) => {
      const bounds = e.target.getBounds();
      onBoundsChange({
        northLat: bounds.getNorth(),
        southLat: bounds.getSouth(),
        eastLng: bounds.getEast(),
        westLng: bounds.getWest(),
      });
    },
    dragstart: () => {
      onUserDrag(); // Automatically pause Follow Mode when user manually drags map
    },
    click: (e) => {
      if (isPinpointMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Controller to programmatically fly/pan map smoothly to street level zoom (Zoom 17)
function MapFlyController({ flyToCoords, isFollowing }) {
  const map = useMap();
  const lastFlyCoordsRef = useRef(null);

  useEffect(() => {
    if (isFollowing && flyToCoords && typeof flyToCoords.lat === 'number' && typeof flyToCoords.lng === 'number' && !isNaN(flyToCoords.lat) && !isNaN(flyToCoords.lng)) {
      const key = `${flyToCoords.lat.toFixed(5)},${flyToCoords.lng.toFixed(5)},${flyToCoords.zoom}`;
      if (lastFlyCoordsRef.current !== key) {
        lastFlyCoordsRef.current = key;
        map.panTo([flyToCoords.lat, flyToCoords.lng], { animate: true, duration: 1.2 });
        map.setZoom(flyToCoords.zoom || 17); // Zoom directly to close street level
      }
    }
  }, [flyToCoords, isFollowing, map]);

  return null;
}

// Helper to format relative time since last GPS update
function getRelativeTimeString(timestamp) {
  if (!timestamp) return 'Updating...';
  const elapsedSec = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (elapsedSec < 3) return 'Updated just now';
  if (elapsedSec < 60) return `Updated ${elapsedSec}s ago`;
  const mins = Math.floor(elapsedSec / 60);
  return `Updated ${mins}m ago`;
}

export function MapView() {
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(false); // Non-blocking cell loading indicator
  const [filters, setFilters] = useState({ network: 'all', status: 'all' });

  // Custom Geolocation Hook
  const {
    location,
    ipLocation,
    loading: geoLoading,
    error: geoError,
    permission: geoPermission,
    accuracyDetails,
    requestLocation,
    startTracking,
    refreshLocation
  } = useGeolocation();

  // Navigation & Follow Mode State
  const [isFollowing, setIsFollowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [searchedDestination, setSearchedDestination] = useState(null);
  const [isPinpointMode, setIsPinpointMode] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [, setTicker] = useState(0);

  // Address details state
  const [addressDetails, setAddressDetails] = useState({ landmark: 'Locating standing position...', district: '' });

  const searchDebounceRef = useRef(null);
  const markerRef = useRef(null);
  const { on } = useSocket();

  // Refresh relative timestamp ticker every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Automatically start live tracking on mount
  useEffect(() => {
    startTracking();
  }, [startTracking]);

  // Immediately zoom in to user standing position on initial acquisition
  useEffect(() => {
    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      const { latitude, longitude } = location;

      if (isFollowing) {
        setFlyToCoords({ lat: latitude, lng: longitude, zoom: 17 }); // Deep street/suburb zoom
      }

      locationService.reverseGeocode(latitude, longitude).then((res) => {
        setAddressDetails(res);
      });
    }
  }, [location, isFollowing]);

  const fetchMapData = useCallback(async (bounds) => {
    try {
      setLoading(true);
      const params = bounds || {
        northLat: GHANA_BOUNDS[1][0],
        southLat: GHANA_BOUNDS[0][0],
        eastLng: GHANA_BOUNDS[1][1],
        westLng: GHANA_BOUNDS[0][1],
      };
      if (filters.network !== 'all') params.network = filters.network;

      const res = await locationService.getMapData(params);
      setCells(res.data?.cells || []);
    } catch (err) {
      console.warn('Map cell data fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.network]);

  useEffect(() => {
    fetchMapData();

    const offScore = on('score:updated', (update) => {
      setCells((prev) => {
        const idx = prev.findIndex((c) => c._id === update.gridCellId || c.gridCellId === update.gridCellId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...update };
          return updated;
        }
        return [...prev, update];
      });
    });

    return () => {
      offScore?.();
    };
  }, [fetchMapData, on]);

  // Manual pinpoint positioning
  const handleManualPinpoint = async (lat, lng) => {
    setIsFollowing(false);
    setFlyToCoords({ lat, lng, zoom: 17 });
    const res = await locationService.reverseGeocode(lat, lng);
    setAddressDetails(res);
  };

  // User manually dragged map -> pause follow mode
  const handleUserDrag = () => {
    if (isFollowing) {
      setIsFollowing(false);
    }
  };

  // Recenter map on user standing location at close street zoom (Zoom 17)
  const handleRecenterStandingLocation = () => {
    setIsFollowing(true);
    if (location && typeof location.latitude === 'number') {
      setFlyToCoords({ lat: location.latitude, lng: location.longitude, zoom: 17 });
    } else {
      requestLocation();
    }
  };

  // Live search across Ghana
  const handleSearchChange = (e) => {
    const rawVal = e.target.value;
    setSearchQuery(rawVal);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!rawVal.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const sanitizedQuery = rawVal
      .replace(/^i\s+am\s+at\s+/i, '')
      .replace(/^i'm\s+at\s+/i, '')
      .replace(/^where\s+is\s+/i, '')
      .replace(/^show\s+me\s+/i, '')
      .replace(/^find\s+/i, '')
      .trim();

    if (!sanitizedQuery) return;

    setIsSearching(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=gh&limit=8&q=${encodeURIComponent(sanitizedQuery)}`,
          { headers: { 'User-Agent': 'NetworkRadarGhana/2.0' } }
        );
        const remoteData = await res.json();

        if (Array.isArray(remoteData) && remoteData.length > 0) {
          const activeLat = location ? location.latitude : null;
          const activeLng = location ? location.longitude : null;

          const remoteMatches = remoteData.map((item) => {
            const rLat = parseFloat(item.lat);
            const rLng = parseFloat(item.lon);
            const dist = (activeLat !== null && !isNaN(rLat))
              ? getDistanceKm(activeLat, activeLng, rLat, rLng)
              : null;

            return {
              name: item.display_name.split(',')[0],
              suburb: item.display_name.split(',').slice(1, 3).join(',').trim(),
              district: item.display_name,
              lat: rLat,
              lng: rLng,
              distanceKm: dist,
            };
          });

          setSearchResults(remoteMatches);

          // Auto-select exact city match if query matches full name
          if (['cape coast', 'kumasi', 'tamale', 'takoradi', 'oyibi', 'sunyani', 'ho', 'koforidua'].includes(sanitizedQuery.toLowerCase())) {
            const topMatch = remoteMatches[0];
            if (topMatch && typeof topMatch.lat === 'number') {
              setIsFollowing(false);
              setFlyToCoords({ lat: topMatch.lat, lng: topMatch.lng, zoom: 15 });
              setSearchedDestination(topMatch);
            }
          }
        }
      } catch {
        // Fail gracefully
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectLocation = (loc) => {
    setSearchQuery(loc.name);
    setSearchResults([]);
    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng)) {
      setIsFollowing(false);
      setFlyToCoords({ lat: loc.lat, lng: loc.lng, zoom: 15 });
      setSearchedDestination(loc);
    }
  };

  const getStatusColorHex = (status) => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#22c55e';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      case 'critical': return '#991b1b';
      default: return '#6b7280';
    }
  };

  const filteredCells = cells.filter((cell) => {
    const st = cell.status || cell.overallStatus;
    if (filters.status !== 'all' && st !== filters.status) return false;
    return true;
  });

  const activeLat = location ? location.latitude : null;
  const activeLng = location ? location.longitude : null;

  const rawDist = (activeLat !== null && searchedDestination?.lat)
    ? getDistanceKm(activeLat, activeLng, searchedDestination.lat, searchedDestination.lng)
    : null;

  const activeDistanceKm = (rawDist !== null && rawDist !== undefined && !isNaN(rawDist))
    ? Number(rawDist).toFixed(1)
    : null;

  const initialMapCenter = location 
    ? [location.latitude, location.longitude] 
    : GHANA_CENTER;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[500px] z-0 bg-slate-950">
      {/* Search Bar Container */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] w-[92%] max-w-md pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="relative glass rounded-2xl shadow-2xl border border-slate-700 flex items-center px-4 py-3 bg-slate-950/95 backdrop-blur-xl">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-blue-400 shrink-0 mr-2.5 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-blue-400 shrink-0 mr-2.5" />
          )}

          <input
            type="text"
            placeholder="Search Cape Coast, Kumasi, Oyibi, Madina, Takoradi..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />

          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); setSearchedDestination(null); }}
              className="text-xs text-slate-400 hover:text-white px-2 font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 glass rounded-2xl shadow-2xl border border-slate-700 bg-slate-900/98 backdrop-blur-2xl divide-y divide-slate-800 overflow-hidden max-h-72 overflow-y-auto">
            {searchResults.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectLocation(loc)}
                className="w-full text-left px-4 py-3 hover:bg-blue-600/30 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">{loc.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">{loc.suburb || loc.district}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {loc.distanceKm !== null && loc.distanceKm !== undefined && !isNaN(loc.distanceKm) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center space-x-1">
                      <Route className="w-3 h-3" />
                      <span>{loc.distanceKm < 1 ? `${Math.round(loc.distanceKm * 1000)} m` : `${Number(loc.distanceKm).toFixed(1)} km`}</span>
                    </span>
                  )}
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold">
                    Fly To
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LOCATION PERMISSION PROMPT BANNER */}
      {geoPermission === 'prompt' && !location && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/50 flex items-center space-x-3 text-xs backdrop-blur-xl max-w-[92%]">
          <Crosshair className="w-5 h-5 text-blue-400 shrink-0 animate-pulse" />
          <div className="flex-1">
            <span className="font-bold block text-white">Enable Precise Location</span>
            <span className="text-[11px] text-slate-300">Grant location access so Network Radar can track your live GPS standing position.</span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={requestLocation}
            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg cursor-pointer"
          >
            {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Allow GPS'}
          </Button>
        </div>
      )}

      {/* LOCATION ERROR & RETRY BANNER */}
      {geoError && !location && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 text-slate-100 px-5 py-3 rounded-2xl shadow-2xl border border-red-500/50 flex items-center space-x-3 text-xs backdrop-blur-xl max-w-[92%]">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block text-red-400">Unable to determine your precise location</span>
            <span className="text-[11px] text-slate-300 block leading-tight mt-0.5">{geoError}</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={refreshLocation}
            className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* ACCURATE DEVICE LOCATION STATUS & RELATIVE TIMESTAMP HEADER BANNER */}
      {location && !searchedDestination && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-slate-950/95 text-white px-5 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center space-x-2.5 text-xs font-extrabold backdrop-blur-md max-w-[92%] truncate">
          <span className="flex items-center space-x-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Live GPS</span>
          </span>
          <span className="text-slate-600 font-normal">|</span>
          <span className="truncate text-blue-300 font-bold">📍 {addressDetails.landmark}</span>
          {accuracyDetails && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${accuracyDetails.bg} ${accuracyDetails.color} ${accuracyDetails.border} shrink-0`}>
              ±{location.accuracy}m
            </span>
          )}
          <span className="text-slate-500 text-[10px] font-mono font-normal shrink-0">
            ({getRelativeTimeString(location.timestamp)})
          </span>
        </div>
      )}

      {/* DISTANCE BANNER TO SEARCHED DESTINATION */}
      {location && searchedDestination && activeDistanceKm && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-2xl border border-blue-400/50 flex items-center space-x-2 text-xs font-extrabold backdrop-blur-md">
          <Route className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>
            Distance to <strong>{searchedDestination.name}</strong>: <strong className="text-amber-300">{activeDistanceKm} km</strong> from where you are standing
          </span>
        </div>
      )}

      {/* TOP-RIGHT COLLAPSIBLE OPEN & CLOSE FILTER BAR */}
      <MapFilters filters={filters} setFilters={setFilters} />

      {/* ACTION CONTROL BUTTONS */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col space-y-3">
        {/* Recenter & Follow Me Button */}
        <Button
          variant="primary"
          className={`shadow-2xl rounded-full w-14 h-14 p-0 flex flex-col items-center justify-center border transition-all cursor-pointer ${
            isFollowing
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-blue-400 text-white shadow-blue-500/50 animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-blue-400'
          }`}
          onClick={handleRecenterStandingLocation}
          title={isFollowing ? 'Follow Mode Active: Centered on your standing position' : 'Recenter map on my live GPS position'}
        >
          <LocateFixed className="w-6 h-6" />
          <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5">
            {isFollowing ? 'FOLLOWING' : 'RECENTER'}
          </span>
        </Button>

        {/* Manual Click Pinpoint Button */}
        <Button
          variant={isPinpointMode ? 'primary' : 'secondary'}
          className={`shadow-2xl rounded-full w-14 h-14 p-0 flex flex-col items-center justify-center border transition-all cursor-pointer ${
            isPinpointMode
              ? 'bg-gradient-to-tr from-amber-500 to-orange-600 border-amber-300 text-white animate-bounce shadow-amber-500/50'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-400'
          }`}
          onClick={() => { setIsPinpointMode(!isPinpointMode); if (!isPinpointMode) setIsFollowing(false); }}
          title={isPinpointMode ? 'Click anywhere on map to set your exact spot!' : 'Click to pinpoint your exact spot on the map'}
        >
          <Move className="w-6 h-6" />
          <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5">
            {isPinpointMode ? 'CLICK MAP' : 'PINPOINT'}
          </span>
        </Button>

        {/* Dev Diagnostics Toggle Button */}
        <Button
          variant="secondary"
          className="shadow-2xl rounded-full w-10 h-10 p-0 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer"
          onClick={() => setShowDevPanel(!showDevPanel)}
          title="Toggle Location Diagnostics Panel"
        >
          <Terminal className="w-4 h-4" />
        </Button>
      </div>

      {/* DEVELOPER LOCATION DIAGNOSTICS PANEL (Collapsible) */}
      {showDevPanel && (
        <div className="absolute bottom-6 left-6 z-[1000] w-80 bg-slate-950/95 border border-slate-800 text-slate-200 p-4 rounded-2xl shadow-2xl backdrop-blur-xl font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-blue-400 flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Location Diagnostics</span>
            </span>
            <button onClick={() => setShowDevPanel(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Source:</span>
              <span className="font-bold text-emerald-400">{location ? location.source.toUpperCase() : ipLocation ? 'IP (APPROX)' : 'NONE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Permission:</span>
              <span className="text-slate-300">{geoPermission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Follow Mode:</span>
              <span className={isFollowing ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{isFollowing ? 'ENABLED' : 'PAUSED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Latitude:</span>
              <span className="text-white">{location ? location.latitude.toFixed(6) : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Longitude:</span>
              <span className="text-white">{location ? location.longitude.toFixed(6) : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Accuracy:</span>
              <span className="text-amber-400">{location ? `±${location.accuracy} meters` : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Heading / Speed:</span>
              <span className="text-slate-300">{location ? `${location.heading !== null ? `${Math.round(location.heading)}°` : 'N/A'} / ${location.speed !== null ? `${location.speed.toFixed(1)} m/s` : '0 m/s'}` : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Update:</span>
              <span className="text-slate-400 text-[10px]">{location ? getRelativeTimeString(location.timestamp) : '--'}</span>
            </div>
          </div>
        </div>
      )}

      {/* NON-BLOCKING BOTTOM-LEFT REFRESH SPINNER BADGE */}
      {loading && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/90 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/30 text-xs font-semibold flex items-center space-x-2 backdrop-blur-md">
          <Spinner size="sm" />
          <span>Updating map signals...</span>
        </div>
      )}

      <MapContainer
        center={initialMapCenter}
        zoom={location ? 17 : 16}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapResizer />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEventsHandler 
          onBoundsChange={fetchMapData} 
          isPinpointMode={isPinpointMode}
          onMapClick={handleManualPinpoint}
          onUserDrag={handleUserDrag}
        />
        <MapFlyController flyToCoords={flyToCoords} isFollowing={isFollowing} />

        {/* Dashed Path Connecting Standing Location to Searched Spot */}
        {typeof location?.latitude === 'number' && typeof searchedDestination?.lat === 'number' && !isNaN(location.latitude) && !isNaN(searchedDestination.lat) && (
          <Polyline
            positions={[
              [location.latitude, location.longitude],
              [searchedDestination.lat, searchedDestination.lng],
            ]}
            pathOptions={{
              color: '#38bdf8',
              weight: 3,
              dashArray: '8, 8',
              opacity: 0.85,
            }}
          />
        )}

        {/* BROWSER GPS ACCURACY RADIUS CIRCLE */}
        {typeof location?.latitude === 'number' && !isNaN(location.latitude) && location.accuracy > 0 && (
          <Circle
            center={[location.latitude, location.longitude]}
            radius={location.accuracy}
            pathOptions={{
              color: '#4285F4',
              fillColor: '#4285F4',
              fillOpacity: 0.12,
              weight: 1.5,
            }}
          />
        )}

        {/* MODERN LIVE GPS BLUE DOT MARKER (Softer, elegant pulse effect) */}
        {typeof location?.latitude === 'number' && !isNaN(location.latitude) && (
          <Marker
            position={[location.latitude, location.longitude]}
            icon={createLiveUserDotIcon(location.heading)}
            draggable={true}
            ref={markerRef}
            eventHandlers={{
              dragend: () => {
                const marker = markerRef.current;
                if (marker) {
                  const latLng = marker.getLatLng();
                  handleManualPinpoint(latLng.lat, latLng.lng);
                }
              },
            }}
          >
            <Popup className="custom-popup">
              <CellPopup
                userLocation={true}
                gpsAccuracy={location.accuracy}
                data={{
                  landmark: `${addressDetails.landmark} (Your Live Location)`,
                  suburb: addressDetails.suburb,
                  district: addressDetails.district,
                  approximateLat: location.latitude,
                  approximateLng: location.longitude,
                  networks: [
                    { code: 'MTN', name: 'MTN Ghana', score: null, status: 'insufficient_data', confidence: 'insufficient', avgDownloadSpeed: null, avgLatency: null },
                    { code: 'TELECEL', name: 'Telecel Ghana', score: null, status: 'insufficient_data', confidence: 'insufficient', avgDownloadSpeed: null, avgLatency: null },
                    { code: 'AT', name: 'AT Ghana', score: null, status: 'insufficient_data', confidence: 'insufficient', avgDownloadSpeed: null, avgLatency: null },
                  ],
                }}
              />
            </Popup>
          </Marker>
        )}

        {/* Searched Destination Marker Pin */}
        {typeof searchedDestination?.lat === 'number' && !isNaN(searchedDestination.lat) && (
          <CircleMarker
            center={[searchedDestination.lat, searchedDestination.lng]}
            radius={14}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#f59e0b',
              fillOpacity: 0.95,
              weight: 3,
            }}
          >
            <Popup className="custom-popup">
              <CellPopup
                data={{
                  landmark: searchedDestination.name,
                  areaName: searchedDestination.name,
                  district: searchedDestination.district,
                  approximateLat: searchedDestination.lat,
                  approximateLng: searchedDestination.lng,
                  networks: [
                    { code: 'MTN', name: 'MTN Ghana', score: null, status: 'insufficient_data', confidence: 'insufficient', avgDownloadSpeed: null, avgLatency: null },
                    { code: 'TELECEL', name: 'Telecel Ghana', score: null, status: 'insufficient_data', confidence: 'insufficient', avgDownloadSpeed: null, avgLatency: null },
                    { code: 'AT', name: 'AT Ghana', score: null, status: 'insufficient_data', confidence: 'insufficient', avgDownloadSpeed: null, avgLatency: null },
                  ],
                }}
              />
            </Popup>
          </CircleMarker>
        )}

        {/* Real Database Grid Cells across Ghana */}
        {filteredCells.map((cell, index) => {
          const lat = cell.approximateLat !== undefined ? cell.approximateLat : cell.lat;
          const lng = cell.approximateLng !== undefined ? cell.approximateLng : cell.lng;

          if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) return null;

          const cellStatus = cell.status || cell.overallStatus || 'insufficient_data';
          const colorHex = getStatusColorHex(cellStatus);

          return (
            <CircleMarker
              key={cell._id || cell.gridCellId || index}
              center={[lat, lng]}
              radius={20}
              pathOptions={{
                color: colorHex,
                fillColor: colorHex,
                fillOpacity: 0.65,
                weight: 2,
              }}
            >
              <Popup className="custom-popup">
                <CellPopup data={cell} />
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .leaflet-popup-tip-container {
          display: none;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .live-gps-user-marker-container {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default MapView;
