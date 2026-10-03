import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

const DEFAULT_WARSAW_LOCATION: LocationData = {
  latitude: 52.2297,
  longitude: 21.0122,
  accuracy: 10,
  altitude: null,
  heading: null,
  speed: null,
  timestamp: Date.now(),
};

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshLocation = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
          accuracy: currentLoc.coords.accuracy,
          altitude: currentLoc.coords.altitude,
          heading: currentLoc.coords.heading,
          speed: currentLoc.coords.speed,
          timestamp: currentLoc.timestamp,
        });
      }
    } catch (err) {
      console.warn('Odświeżanie lokalizacji nie powiodło się:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    async function initLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setErrorMsg('Brak zgody na dostęp do lokalizacji. Użyto domyślnych współrzędnych.');
            setIsPermissionGranted(false);
            setLocation(DEFAULT_WARSAW_LOCATION);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setIsPermissionGranted(true);
          setErrorMsg(null);
        }

        const currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (isMounted) {
          setLocation({
            latitude: currentLoc.coords.latitude,
            longitude: currentLoc.coords.longitude,
            accuracy: currentLoc.coords.accuracy,
            altitude: currentLoc.coords.altitude,
            heading: currentLoc.coords.heading,
            speed: currentLoc.coords.speed,
            timestamp: currentLoc.timestamp,
          });
          setLoading(false);
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000,
            distanceInterval: 3,
          },
          (newLoc) => {
            if (isMounted) {
              setLocation({
                latitude: newLoc.coords.latitude,
                longitude: newLoc.coords.longitude,
                accuracy: newLoc.coords.accuracy,
                altitude: newLoc.coords.altitude,
                heading: newLoc.coords.heading,
                speed: newLoc.coords.speed,
                timestamp: newLoc.timestamp,
              });
            }
          }
        );
      } catch {
        if (isMounted) {
          setErrorMsg('Wystąpił błąd podczas ustalania pozycji GPS.');
          setLocation((prev) => prev || DEFAULT_WARSAW_LOCATION);
          setLoading(false);
        }
      }
    }

    initLocation();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return {
    location: location || DEFAULT_WARSAW_LOCATION,
    errorMsg,
    isPermissionGranted,
    loading,
    refreshLocation,
  };
}
