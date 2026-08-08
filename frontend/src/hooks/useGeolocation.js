import { useState, useEffect, useRef, useCallback } from 'react';
import { locationService } from '../services/location.service';

/**
 * Standardized Location Object Structure
 * {
 *   latitude: Number,
 *   longitude: Number,
 *   accuracy: Number, // in meters
 *   altitude: Number | null,
 *   heading: Number | null,
 *   speed: Number | null,
 *   timestamp: Date,
 *   source: "gps" | "network" | "ip"
 * }
 */

export function getAccuracyCategory(accuracy) {
  if (accuracy <= 20) return { label: 'High accuracy', category: 'high', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', indicator: '🟢' };
  if (accuracy <= 50) return { label: 'Good accuracy', category: 'good', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', indicator: '🟢' };
  if (accuracy <= 100) return { label: 'Moderate accuracy', category: 'moderate', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', indicator: '🟡' };
  return { label: 'Low accuracy', category: 'low', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', indicator: '🔴' };
}

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unavailable' | 'timeout'
  const [isTracking, setIsTracking] = useState(false);
  
  const watchIdRef = useRef(null);

  // Helper to parse GeolocationPosition into standardized Location Object
  const parsePosition = (pos, source = 'gps') => {
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy || 0),
      altitude: pos.coords.altitude !== undefined ? pos.coords.altitude : null,
      heading: pos.coords.heading !== undefined ? pos.coords.heading : null,
      speed: pos.coords.speed !== undefined ? pos.coords.speed : null,
      timestamp: new Date(pos.timestamp || Date.now()),
      source: source
    };
  };

  // Fetch secondary IP location (strictly labeled as approximate fallback)
  const fetchIpFallback = useCallback(async () => {
    try {
      const ipRes = await locationService.getIpLocation();
      if (ipRes && typeof ipRes.latitude === 'number' && typeof ipRes.longitude === 'number') {
        const ipLocObj = {
          latitude: ipRes.latitude,
          longitude: ipRes.longitude,
          accuracy: 15000, // IP accuracy is coarse (~15km)
          altitude: null,
          heading: null,
          speed: null,
          timestamp: new Date(),
          source: 'ip',
          cityName: ipRes.cityName || 'Ghana',
          regionName: ipRes.regionName || 'Ghana'
        };
        setIpLocation(ipLocObj);
        return ipLocObj;
      }
    } catch (err) {
      console.warn('Secondary IP location lookup failed:', err);
    }
    return null;
  }, []);

  // Request single high-accuracy GPS position
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission('unavailable');
      setError('Geolocation API is not supported by your browser.');
      fetchIpFallback();
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const locObj = parsePosition(pos, 'gps');
        setLocation(locObj);
        setPermission('granted');
        setError(null);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermission('denied');
          setError('Location permission was denied. Please enable location access in your browser settings and try again.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPermission('unavailable');
          setError('Your device could not determine your location. Please check your GPS/location services and try again.');
        } else if (err.code === err.TIMEOUT) {
          setPermission('timeout');
          setError('Location request timed out. Please try again.');
        } else {
          setPermission('unavailable');
          setError(err.message || 'Unable to determine your precise location.');
        }

        // Fetch secondary IP location for informational display
        fetchIpFallback();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [fetchIpFallback]);

  // Start continuous live tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission('unavailable');
      setError('Geolocation API is not supported by your browser.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsTracking(true);
    setLoading(true);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const locObj = parsePosition(pos, 'gps');
        setLocation(locObj);
        setPermission('granted');
        setError(null);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermission('denied');
          setError('Location permission was denied. Please enable location access in your browser settings and try again.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPermission('unavailable');
          setError('Your device could not determine your location. Please check your GPS/location services and try again.');
        } else if (err.code === err.TIMEOUT) {
          setPermission('timeout');
          setError('Location request timed out. Please try again.');
        } else {
          setError(err.message || 'Unable to determine your precise location.');
        }

        fetchIpFallback();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    watchIdRef.current = watchId;
  }, [fetchIpFallback]);

  // Stop tracking and clean up watcher
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Compute accuracy details
  const accuracyDetails = location ? getAccuracyCategory(location.accuracy) : null;

  return {
    location,
    ipLocation,
    loading,
    error,
    permission,
    accuracy: location ? location.accuracy : null,
    accuracyDetails,
    isTracking,
    requestLocation,
    startTracking,
    stopTracking,
    refreshLocation: requestLocation
  };
}

export default useGeolocation;
