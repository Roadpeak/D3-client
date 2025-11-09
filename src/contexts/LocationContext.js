import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { locationAPI } from '../config/api';

// Create the Location Context
const LocationContext = createContext();

// Custom hook to use the Location Context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Location Provider Component
export const LocationProvider = ({ children }) => {
  // FIXED: Always default to "All Locations"
  const [currentLocation, setCurrentLocation] = useState('All Locations');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Available locations - fetched from API only
  const [availableLocations, setAvailableLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // FIXED: Memoize loadAvailableLocations to prevent recreating on every render
  const loadAvailableLocations = useCallback(async () => {
    try {
      setIsLoadingLocations(true);

      const result = await locationAPI.getAvailableLocations();

      if (result.success && result.locations && result.locations.length > 0) {
        // Format locations for our context
        const formattedLocations = result.locations.map(location => ({
          id: location.id || location.name,
          name: location.name,
          area: location.area || 'Location',
          offers: location.offers || `${location.storeCount || 0} stores`,
          storeCount: location.storeCount || 0,
          offerCount: location.offerCount || 0
        }));

        // FIXED: Always add "All Locations" option at the beginning
        const allLocationsOption = {
          id: 'all',
          name: 'All Locations',
          area: 'Show everywhere',
          offers: 'All deals',
          storeCount: formattedLocations.reduce((sum, loc) => sum + (loc.storeCount || 0), 0),
          offerCount: formattedLocations.reduce((sum, loc) => sum + (loc.offerCount || 0), 0)
        };

        setAvailableLocations([allLocationsOption, ...formattedLocations]);
      } else {
        setAvailableLocations([{
          id: 'all',
          name: 'All Locations',
          area: 'Show everywhere',
          offers: 'All deals'
        }]);
      }
    } catch (error) {
      setAvailableLocations([{
        id: 'all',
        name: 'All Locations',
        area: 'Show everywhere',
        offers: 'All deals'
      }]);
    } finally {
      setIsLoadingLocations(false);
    }
  }, []); // No dependencies - this function doesn't depend on any state

  // Load locations on component mount
  useEffect(() => {
    const initializeLocationData = async () => {
      // Only load available locations from API
      await loadAvailableLocations();

      // Check if user has a saved location preference
      const savedLocation = localStorage.getItem('userSelectedLocation');
      if (savedLocation && savedLocation !== 'null') {
        setCurrentLocation(savedLocation);
      }
    };

    initializeLocationData();
  }, [loadAvailableLocations]);

  // FIXED: Memoized location change function
  const changeLocation = useCallback(async (newLocation) => {
    try {
      setIsLocationLoading(true);
      setLocationError(null);

      // Update current location
      setCurrentLocation(newLocation);

      // Save to localStorage for persistence
      try {
        if (newLocation && newLocation !== 'All Locations') {
          localStorage.setItem('userSelectedLocation', newLocation);
          localStorage.setItem('locationManuallySelected', 'true');
          localStorage.setItem('lastLocationChangeTime', Date.now().toString());
        } else {
          localStorage.removeItem('userSelectedLocation');
          localStorage.removeItem('locationManuallySelected');
          localStorage.removeItem('lastLocationChangeTime');
        }
      } catch (storageError) {
        // Silently handle localStorage errors
      }

      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('locationChanged', {
        detail: {
          location: newLocation,
          timestamp: Date.now()
        }
      }));

    } catch (error) {
      setLocationError(error.message);
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  // FIXED: Memoized geolocation function
  const getCurrentLocationFromBrowser = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser';
        setLocationError(error);
        setIsLocationLoading(false);
        reject(new Error(error));
        return;
      }

      setIsLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Use our API to reverse geocode
            const locationResult = await locationAPI.reverseGeocode(latitude, longitude);

            if (locationResult.success && locationResult.nearestAvailableLocation) {
              const detectedLocation = locationResult.nearestAvailableLocation;

              if (detectedLocation && detectedLocation !== 'All Locations') {
                await changeLocation(detectedLocation);
                resolve(detectedLocation);
              } else {
                resolve('All Locations');
              }
            } else {
              setLocationError('Could not determine your location');
              resolve('All Locations');
            }
          } catch (error) {
            setLocationError('Could not determine your location');
            resolve('All Locations');
          } finally {
            setIsLocationLoading(false);
          }
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';

          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location access denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information unavailable';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Location request timed out';
          }

          setLocationError(errorMessage);
          setIsLocationLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    });
  }, [changeLocation]);

  // CRITICAL FIX: Memoized getShortLocationName function
  const getShortLocationName = useCallback(() => {
    if (!currentLocation || currentLocation === 'All Locations') {
      return 'All Locations';
    }
    return currentLocation.split(',')[0];
  }, [currentLocation]);

  // FIXED: Memoized getLocationDetails function
  const getLocationDetails = useCallback(() => {
    if (!currentLocation) return null;
    return availableLocations.find(loc => loc.name === currentLocation);
  }, [currentLocation, availableLocations]);

  // FIXED: Memoized refreshAvailableLocations function  
  const refreshAvailableLocations = useCallback(async () => {
    await loadAvailableLocations();
  }, [loadAvailableLocations]);

  // FIXED: Memoized helper functions
  const isLocationSelected = useCallback((locationName) => currentLocation === locationName, [currentLocation]);

  const clearLocationError = useCallback(() => setLocationError(null), []);

  // CRITICAL FIX: Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Current location state
    currentLocation,
    isLocationLoading,
    locationError,

    // Available locations
    availableLocations,
    isLoadingLocations,

    // Functions - ALL MEMOIZED
    changeLocation,
    getCurrentLocationFromBrowser,
    refreshAvailableLocations,
    getShortLocationName,
    getLocationDetails,

    // Helpers - ALL MEMOIZED
    isLocationSelected,
    hasLocationData: !!currentLocation,
    isAutoDetected: false,

    // Reset error
    clearLocationError
  }), [
    currentLocation,
    isLocationLoading,
    locationError,
    availableLocations,
    isLoadingLocations,
    changeLocation,
    getCurrentLocationFromBrowser,
    refreshAvailableLocations,
    getShortLocationName,
    getLocationDetails,
    isLocationSelected,
    clearLocationError
  ]);

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Higher-order component to wrap components that need location
export const withLocation = (Component) => {
  return function LocationWrappedComponent(props) {
    return (
      <LocationProvider>
        <Component {...props} />
      </LocationProvider>
    );
  };
};

export default LocationProvider;