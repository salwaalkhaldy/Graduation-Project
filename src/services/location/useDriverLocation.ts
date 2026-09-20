import { useCallback, useEffect, useState } from 'react';
import { JORDAN_PRESET_AREAS, AMMAN_PRESET_AREAS, DEFAULT_DRIVER_LOCATION } from '../../config/constants';
import { GeoPoint } from '../../types/domain';
import { getStoredDriverLocation, setStoredDriverLocation } from '../../api/mock/db';

export interface DriverLocationState {
  point: GeoPoint;
  source: 'gps' | 'demo';
  error: string | null;
  changeLocation: (areaName: string) => void;
  requestGps: () => Promise<void>;
}

export function useDriverLocation(): DriverLocationState {
  const [point, setPoint] = useState<GeoPoint>(() => {
    const savedArea = getStoredDriverLocation();
    if (savedArea && (JORDAN_PRESET_AREAS[savedArea] || AMMAN_PRESET_AREAS[savedArea])) {
      return JORDAN_PRESET_AREAS[savedArea] || AMMAN_PRESET_AREAS[savedArea];
    }
    return DEFAULT_DRIVER_LOCATION;
  });

  const [source, setSource] = useState<'gps' | 'demo'>('demo');
  const [error, setError] = useState<string | null>(null);

  const changeLocation = useCallback((areaName: string) => {
    const target = JORDAN_PRESET_AREAS[areaName] || AMMAN_PRESET_AREAS[areaName];
    if (target) {
      setPoint(target);
      setSource('demo');
      setError(null);
      setStoredDriverLocation(areaName);
    }
  }, []);

  const requestGps = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPoint: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: `GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
        };
        setPoint(newPoint);
        setSource('gps');
        setError(null);
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) {
          msg = 'Location permission was denied. Using demo preset location.';
        } else if (err.code === 2) {
          msg = 'Location position unavailable. Using demo preset location.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Using demo preset location.';
        }
        setError(msg);
        setSource('demo');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  return {
    point,
    source,
    error,
    changeLocation,
    requestGps,
  };
}
