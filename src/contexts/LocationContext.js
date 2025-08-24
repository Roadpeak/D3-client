import React, { createContext, useContext, useState, useEffect } from 'react';
import { locationAPI } from '../config/api'; // Import from your API

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
  const [isLocationLoading, setIsLocationLoading] = useState(false); // Don't start loading immediately
  const [locationError, setLocationError] = useState(null);
  
  // Available locations - fetched from API only
  const [availableLocations, setAvailableLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Load locations on component mount - but don't auto-detect user location
  useEffect(() => {
    const initializeLocationData = async () => {
      console.log('🚀 Initializing location data...');
      
      // Only load available locations from API
      await loadAvailableLocations();
      
      // Check if user has a saved location preference (but don't auto-detect)
      const savedLocation = localStorage.getItem('userSelectedLocation');
      if (savedLocation && savedLocation !== 'null') {
        console.log('📱 Found saved location preference:', savedLocation);
        setCurrentLocation(savedLocation);
      }
      // If no saved location, stay with "All Locations" default
    };

    initializeLocationData();
  }, []);

  // FIXED: Load available locations from API only
  const loadAvailableLocations = async () => {
    try {
      setIsLoadingLocations(true);
      console.log('📍 Fetching available locations from API...');
      
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
        console.log(`✅ Loaded ${formattedLocations.length} locations from API`);
      } else {
        console.warn('⚠️ No locations found in API response, using default');
        // FIXED: Only "All Locations" as fallback
        setAvailableLocations([{
          id: 'all',
          name: 'All Locations',
          area: 'Show everywhere',
          offers: 'All deals'
        }]);
      }
    } catch (error) {
      console.error('❌ Error loading locations from API:', error);
      // FIXED: Only "All Locations" as fallback on error
      setAvailableLocations([{
        id: 'all',
        name: 'All Locations',
        area: 'Show everywhere',
        offers: 'All deals'
      }]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // FIXED: Simplified location change function
  const changeLocation = async (newLocation) => {
    try {
      setIsLocationLoading(true);
      setLocationError(null);
      
      console.log('🔄 Changing location to:', newLocation);
      
      // Update current location
      setCurrentLocation(newLocation);
      
      // Save to localStorage for persistence
      try {
        if (newLocation && newLocation !== 'All Locations') {
          localStorage.setItem('userSelectedLocation', newLocation);
          // Set flag to indicate manual selection
          localStorage.setItem('locationManuallySelected', 'true');
          localStorage.setItem('lastLocationChangeTime', Date.now().toString());
        } else {
          // If "All Locations" is selected, clear saved location
          localStorage.removeItem('userSelectedLocation');
          localStorage.removeItem('locationManuallySelected');
          localStorage.removeItem('lastLocationChangeTime');
        }
      } catch (storageError) {
        console.warn('Could not save location to localStorage:', storageError);
      }
      
      console.log('✅ Location changed to:', newLocation);
      
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('locationChanged', {
        detail: { 
          location: newLocation,
          timestamp: Date.now()
        }
      }));
      
    } catch (error) {
      console.error('❌ Error changing location:', error);
      setLocationError(error.message);
    } finally {
      setIsLocationLoading(false);
    }
  };

  // FIXED: Simplified geolocation function - only called when user explicitly requests it
  const getCurrentLocationFromBrowser = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser';
        console.error('❌', error);
        setLocationError(error);
        setIsLocationLoading(false);
        reject(new Error(error));
        return;
      }

      console.log('🌍 Requesting user location...');
      setIsLocationLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log('📍 Got coordinates:', latitude, longitude);
            
            // Use our API to reverse geocode
            const locationResult = await locationAPI.reverseGeocode(latitude, longitude);
            
            if (locationResult.success && locationResult.nearestAvailableLocation) {
              const detectedLocation = locationResult.nearestAvailableLocation;
              
              console.log('🎯 Auto-detected location:', detectedLocation);
              
              // Only change if we found a valid location
              if (detectedLocation && detectedLocation !== 'All Locations') {
                await changeLocation(detectedLocation);
                resolve(detectedLocation);
              } else {
                console.log('🔄 No specific location detected, keeping "All Locations"');
                resolve('All Locations');
              }
            } else {
              console.log('⚠️ Could not determine location from coordinates');
              setLocationError('Could not determine your location');
              resolve('All Locations');
            }
          } catch (error) {
            console.error('❌ Error processing location:', error);
            setLocationError('Could not determine your location');
            resolve('All Locations');
          } finally {
            setIsLocationLoading(false);
          }
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          
          let errorMessage = 'Unable to retrieve your location';
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location access denied';
            console.log('🚫 User denied location permission');
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
          enableHighAccuracy: false, // Faster response
          timeout: 10000, // 10 seconds timeout
          maximumAge: 600000 // 10 minutes cache
        }
      );
    });
  };

  // Get short location name (just the area name without city)
  const getShortLocationName = () => {
    if (!currentLocation || currentLocation === 'All Locations') {
      return 'All Locations';
    }
    return currentLocation.split(',')[0];
  };

  // Get location details
  const getLocationDetails = () => {
    if (!currentLocation) return null;
    return availableLocations.find(loc => loc.name === currentLocation);
  };

  // Refresh available locations (useful when new stores/offers are added)
  const refreshAvailableLocations = async () => {
    console.log('🔄 Refreshing available locations...');
    await loadAvailableLocations();
  };

  // Context value
  const contextValue = {
    // Current location state
    currentLocation,
    isLocationLoading,
    locationError,
    
    // Available locations
    availableLocations,
    isLoadingLocations,
    
    // Functions
    changeLocation,
    getCurrentLocationFromBrowser, // Only called when user explicitly requests location detection
    refreshAvailableLocations,
    getShortLocationName,
    getLocationDetails,
    
    // Helpers
    isLocationSelected: (locationName) => currentLocation === locationName,
    hasLocationData: !!currentLocation,
    isAutoDetected: false, // SIMPLIFIED: Remove complex auto-detection logic
    
    // Reset error
    clearLocationError: () => setLocationError(null)
  };

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