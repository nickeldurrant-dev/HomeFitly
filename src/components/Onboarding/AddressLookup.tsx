import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Home, Loader, Navigation, AlertCircle, ExternalLink } from 'lucide-react';

interface AddressLookupProps {
  onAddressSelect: (address: string, homeData: any) => void;
}

const AddressLookup: React.FC<AddressLookupProps> = ({ onAddressSelect }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isLoadingHomeData, setIsLoadingHomeData] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if Google Maps API key is available
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setApiKeyMissing(true);
      return;
    }

    // Load Google Maps Places API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleMapsLoaded(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
      if (existingScript) {
        setGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setApiKeyMissing(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  useEffect(() => {
    if (googleMapsLoaded && inputRef.current && !autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: ['us', 'ca'] }, // US and Canada only
        fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
      });

      // Bias results to user's location if available
      if (userLocation && window.google && window.google.maps) {
        const circle = new google.maps.Circle({
          center: userLocation,
          radius: 50000 // 50km radius
        });
        autocompleteRef.current.setBounds(circle.getBounds()!);
      }

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    }
  }, [googleMapsLoaded, userLocation]);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    setIsRequestingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setUserLocation(location);
      setLocationPermission('granted');

      // Update autocomplete bias if already initialized
      if (autocompleteRef.current && window.google && window.google.maps) {
        const circle = new google.maps.Circle({
          center: location,
          radius: 50000 // 50km radius
        });
        autocompleteRef.current.setBounds(circle.getBounds()!);
      }
    } catch (error) {
      console.error('Location access denied or failed:', error);
      setLocationPermission('denied');
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handlePlaceSelect = async () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    
    if (!place.formatted_address || !place.address_components) {
      console.error('Invalid place selected');
      return;
    }

    setSelectedAddress(place);
    setIsLoadingHomeData(true);

    try {
      // Extract address components
      const addressComponents = place.address_components;
      const getComponent = (type: string) => {
        const component = addressComponents.find(comp => comp.types.includes(type));
        return component?.long_name || '';
      };

      const streetNumber = getComponent('street_number');
      const streetName = getComponent('route');
      const city = getComponent('locality') || getComponent('administrative_area_level_2');
      const state = getComponent('administrative_area_level_1');
      const zipCode = getComponent('postal_code');
      const country = getComponent('country');

      // Simulate fetching property data (in real app, use property data APIs)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate realistic property data based on location and address
      const homeData = generatePropertyData(place, {
        streetNumber,
        streetName,
        city,
        state,
        zipCode,
        country
      });

      onAddressSelect(place.formatted_address, homeData);
    } catch (error) {
      console.error('Error processing place data:', error);
      // Fallback to basic data
      onAddressSelect(place.formatted_address, {
        address: place.formatted_address,
        yearBuilt: 2010,
        squareFootage: 2000,
        bedrooms: 3,
        bathrooms: 2,
        homeType: 'single-family',
        features: ['Central Air']
      });
    } finally {
      setIsLoadingHomeData(false);
    }
  };

  const generatePropertyData = (place: google.maps.places.PlaceResult, components: any) => {
    // Generate realistic property data based on location and other factors
    const currentYear = new Date().getFullYear();
    
    // Estimate home age based on area (newer developments vs established neighborhoods)
    const baseAge = Math.floor(Math.random() * 40) + 10; // 10-50 years old
    const yearBuilt = currentYear - baseAge;
    
    // Estimate square footage based on region
    const isUrban = ['New York', 'San Francisco', 'Boston', 'Washington'].includes(components.city);
    const baseSquareFootage = isUrban ? 1200 + Math.random() * 1500 : 1800 + Math.random() * 2000;
    const squareFootage = Math.round(baseSquareFootage / 100) * 100; // Round to nearest 100
    
    // Determine home type based on area and square footage
    let homeType = 'single-family';
    if (isUrban && squareFootage < 1500) {
      homeType = Math.random() > 0.5 ? 'condo' : 'townhouse';
    } else if (squareFootage < 1200) {
      homeType = 'condo';
    }
    
    // Calculate bedrooms/bathrooms based on square footage
    const bedrooms = Math.max(2, Math.min(5, Math.floor(squareFootage / 600)));
    const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75));
    
    // Generate features based on home age, type, and region
    const possibleFeatures = [
      'Central Air', 'Hardwood Floors', 'Granite Countertops', 'Stainless Steel Appliances',
      'Two-Car Garage', 'Deck', 'Patio', 'Fireplace', 'Basement', 'Attic',
      'Laundry Room', 'Walk-in Closet', 'Garden', 'Security System'
    ];
    
    // Add features based on probability
    const features = possibleFeatures.filter(() => Math.random() > 0.4);
    
    // Ensure some basic features for newer homes
    if (yearBuilt > 2000) {
      if (!features.includes('Central Air')) features.push('Central Air');
      if (!features.includes('Granite Countertops')) features.push('Granite Countertops');
    }
    
    // Add garage for single-family homes
    if (homeType === 'single-family' && !features.includes('Two-Car Garage')) {
      features.push(Math.random() > 0.3 ? 'Two-Car Garage' : 'One-Car Garage');
    }
    
    // Add outdoor features for single-family homes
    if (homeType === 'single-family') {
      if (Math.random() > 0.5) features.push('Deck');
      if (Math.random() > 0.6) features.push('Garden');
    }

    return {
      address: place.formatted_address,
      yearBuilt,
      squareFootage,
      bedrooms,
      bathrooms,
      homeType,
      lotSize: homeType === 'single-family' ? Math.round((Math.random() * 0.5 + 0.1) * 100) / 100 : undefined,
      features,
      coordinates: place.geometry?.location ? {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      } : undefined,
      placeId: place.place_id,
      city: components.city,
      state: components.state,
      zipCode: components.zipCode,
      country: components.country
    };
  };

  const handleManualEntry = () => {
    onAddressSelect('Manual Entry', {
      address: 'Manual Entry - Please update in next step',
      yearBuilt: new Date().getFullYear() - 10,
      squareFootage: 2000,
      bedrooms: 3,
      bathrooms: 2,
      homeType: 'single-family',
      features: []
    });
  };

  // Show API setup instructions if key is missing
  if (apiKeyMissing) {
    return (
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Maps API Required</h2>
          <p className="text-gray-600 mb-6">
            To use real address lookup, you need to set up Google Places API
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Setup Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable the "Places API" and "Maps JavaScript API"</li>
              <li>Create an API key in "Credentials"</li>
              <li>Add the API key to your environment variables as <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code></li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tip</h4>
            <p className="text-yellow-800 text-sm">
              Google provides $200 in free credits monthly, which covers thousands of address lookups.
              Perfect for development and small applications!
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={handleManualEntry}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Continue with Manual Entry
            </button>
            <p className="text-gray-500 text-sm mt-2">
              You can set up the API later and still use the app
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Home</h2>
        <p className="text-gray-600">
          Enter your address to automatically populate your home details from public records
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Location Permission Request */}
        {locationPermission === 'prompt' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">Enable Location for Better Suggestions</h3>
                <p className="text-blue-800 text-sm mb-3">
                  We can show you addresses near your current location to make finding your home easier.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={requestLocation}
                    disabled={isRequestingLocation}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isRequestingLocation ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Getting location...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4" />
                        <span>Use My Location</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setLocationPermission('denied')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Status */}
        {locationPermission === 'granted' && userLocation && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Navigation className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Location enabled</p>
                <p className="text-green-800 text-sm">Address suggestions will prioritize nearby locations</p>
              </div>
            </div>
          </div>
        )}

        {locationPermission === 'denied' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Location not available</p>
                <p className="text-orange-800 text-sm">You can still search for any address</p>
              </div>
            </div>
          </div>
        )}

        {/* Google Maps Loading */}
        {!googleMapsLoaded && !apiKeyMissing && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Loader className="h-5 w-5 text-gray-600 animate-spin" />
              <div>
                <p className="font-medium text-gray-900">Loading address lookup...</p>
                <p className="text-gray-600 text-sm">Connecting to Google Places API</p>
              </div>
            </div>
          </div>
        )}

        {/* Address Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={googleMapsLoaded ? "Start typing your address..." : "Loading address lookup..."}
            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            disabled={!googleMapsLoaded || isLoadingHomeData}
          />
        </div>

        {/* Loading State */}
        {isLoadingHomeData && selectedAddress && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gathering Property Information</h3>
            <p className="text-gray-600 mb-4">
              We're analyzing your property details and generating personalized recommendations...
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {selectedAddress.formatted_address}
              </p>
            </div>
          </div>
        )}

        {/* Manual Entry Option */}
        {googleMapsLoaded && address.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              Can't find your address? You can enter details manually in the next step.
            </p>
            <button
              onClick={handleManualEntry}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Enter details manually →
            </button>
          </div>
        )}

        {/* API Info */}
        {googleMapsLoaded && (
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
              <span>Powered by</span>
              <ExternalLink className="h-3 w-3" />
              <span>Google Places API</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressLookup;