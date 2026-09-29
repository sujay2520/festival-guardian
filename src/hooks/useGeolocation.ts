'use client';
import { useState, useEffect, useCallback } from 'react';

interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setIsWatching(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsWatching(false);
    };
  }, []);

  const getCurrentPosition = useCallback(
    (): { lat: number; lng: number } => {
      return position
        ? { lat: position.lat, lng: position.lng }
        : { lat: 0, lng: 0 };
    },
    [position]
  );

  return { position, error, isWatching, getCurrentPosition };
}
