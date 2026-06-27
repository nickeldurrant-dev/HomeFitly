import React, { useState } from 'react';
import { Home, Edit, Save, User, Calendar, Ruler, Bed, Bath, MapPin, Check, X, AlertTriangle, Loader, Camera } from 'lucide-react';
import { HomeProfile as IHomeProfile } from '../types';
import { useHomeProfile } from '../hooks/useHomeProfile';
import { useAuth } from '../hooks/useAuth';
import { SecurityManager } from '../utils/security';

interface HomeProfileProps {
  homeProfile: IHomeProfile;
  onProfileUpdate: (updatedProfile: IHomeProfile) => void;
}

const HomeProfile: React.FC<HomeProfileProps> = ({ homeProfile, onProfileUpdate }) => {
  const { user } = useAuth();
  const { updateHomeProfile } = useHomeProfile(user?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editedProfile, setEditedProfile] = useState<IHomeProfile>(homeProfile);

  const homeTypeOptions = [
    { value: 'single-family', label: 'Single Family Home' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'condo', label: 'Condominium' },
    { value: 'apartment', label: 'Apartment' }
  ];

  const commonFeatures = [
    'Central Air', 'Hardwood Floors', 'Granite Countertops', 'Stainless Steel Appliances',
    'Two-Car Garage', 'One-Car Garage', 'Deck', 'Patio', 'Fireplace', 'Pool', 'Hot Tub',
    'Security System', 'Smart Home Features', 'Solar Panels', 'Basement', 'Attic',
    'Laundry Room', 'Walk-in Closet', 'Garden', 'Sprinkler System', 'Central Vacuum',
    'Wine Cellar', 'Home Theater', 'Gym/Exercise Room', 'Office/Study'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!editedProfile.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!editedProfile.familyName?.trim()) {
      newErrors.familyName = 'Family name is required';
    }

    // Numeric field validation
    if (editedProfile.yearBuilt !== null) {
      const currentYear = new Date().getFullYear();
      if (editedProfile.yearBuilt < 1800 || editedProfile.yearBuilt > currentYear) {
        newErrors.yearBuilt = `Year built must be between 1800 and ${currentYear}`;
      }
    }

    if (editedProfile.squareFootage !== null && editedProfile.squareFootage <= 0) {
      newErrors.squareFootage = 'Square footage must be greater than 0';
    }

    if (editedProfile.bedrooms !== null && editedProfile.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative';
    }

    if (editedProfile.bathrooms !== null && editedProfile.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative';
    }

    if (editedProfile.lotSize !== undefined && editedProfile.lotSize !== null && editedProfile.lotSize <= 0) {
      newErrors.lotSize = 'Lot size must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Sanitize input data
      const sanitizedProfile: IHomeProfile = {
        ...editedProfile,
        address: SecurityManager.sanitizeInput(editedProfile.address),
        familyName: SecurityManager.sanitizeInput(editedProfile.familyName),
        features: editedProfile.features.map(feature => SecurityManager.sanitizeInput(feature))
      };

      // Update in database
      await updateHomeProfile(sanitizedProfile);
      
      // Update parent component
      onProfileUpdate(sanitizedProfile);
      
      // Show success feedback
      setSaveSuccess(true);
      
      // Show additional message if new features were added
      const previousFeatures = homeProfile?.features || [];
      const newFeatures = sanitizedProfile.features || [];
      const addedFeatures = newFeatures.filter(feature => !previousFeatures.includes(feature));
      
      if (addedFeatures.length > 0) {
        // Trigger task generation in parent component
        // This will be handled by the handleProfileUpdate function in App.tsx
        console.log('New features added:', addedFeatures);
      }
      
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to save profile:', error);
      setErrors({ general: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(homeProfile);
    setErrors({});
    setIsEditing(false);
  };

  const updateField = (field: keyof IHomeProfile, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = editedProfile.features || [];
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    updateField('features', updatedFeatures);
  };

  const getHomeAge = () => {
    if (!editedProfile.yearBuilt) return 'Unknown';
    const age = new Date().getFullYear() - editedProfile.yearBuilt;
    return `${age} years old`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Home Profile</h1>
          <p className="text-gray-600">Manage your home information and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Home Summary with Photo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Home Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              {editedProfile.homePhoto ? (
                <div className="relative">
                  <img 
                    src={editedProfile.homePhoto} 
                    alt="Home" 
                    className="w-48 h-32 object-cover rounded-xl border-2 border-white shadow-lg"
                  />
                  {isEditing && (
                    <button
                      onClick={() => updateField('homePhoto', undefined)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-48 h-32 bg-white rounded-xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-blue-600 hover:border-blue-400 transition-colors">
                  <Home className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">No photo</span>
                </div>
              )}
              
              {isEditing && (
                <div className="mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateField('homePhoto', event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="home-photo-upload"
                  />
                  <label
                    htmlFor="home-photo-upload"
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium flex items-center space-x-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{editedProfile.homePhoto ? 'Change Photo' : 'Add Photo'}</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Home Summary Stats */}
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {editedProfile.familyName ? `${editedProfile.familyName} Family Home` : 'Your Home'}
              </h3>
              <p className="text-gray-600 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {editedProfile.address}
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {editedProfile.yearBuilt ? getHomeAge() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Home Age</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {editedProfile.squareFootage ? `${editedProfile.squareFootage.toLocaleString()}` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Square Feet</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {editedProfile.bedrooms || 'N/A'} / {editedProfile.bathrooms || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Bed / Bath</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{editedProfile.features?.length || 0}</div>
                <div className="text-sm text-gray-600">Features</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 text-sm">{errors.general}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 text-sm font-medium">Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
          {isEditing && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Address *
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editedProfile.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address ? 'border-red-300' : ''
                  }`}
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{editedProfile.address}</p>
            )}
          </div>

          {/* Family Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Family Name *
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editedProfile.familyName || ''}
                  onChange={(e) => updateField('familyName', e.target.value)}
                  placeholder="Smith, Johnson, Garcia"
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.familyName ? 'border-red-300' : ''
                  }`}
                />
                {errors.familyName && <p className="text-red-600 text-sm mt-1">{errors.familyName}</p>}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{editedProfile.familyName} family</p>
            )}
          </div>

          {/* Home Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Type</label>
            {isEditing ? (
              <select
                value={editedProfile.homeType || ''}
                onChange={(e) => updateField('homeType', e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select home type</option>
                {homeTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 font-medium">
                {homeTypeOptions.find(opt => opt.value === editedProfile.homeType)?.label || 'Not specified'}
              </p>
            )}
          </div>

          {/* Year Built */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Year Built
            </label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  value={editedProfile.yearBuilt || ''}
                  onChange={(e) => updateField('yearBuilt', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="1995"
                  min="1800"
                  max={new Date().getFullYear()}
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.yearBuilt ? 'border-red-300' : ''
                  }`}
                />
                {errors.yearBuilt && <p className="text-red-600 text-sm mt-1">{errors.yearBuilt}</p>}
              </div>
            ) : (
              <div>
                <p className="text-gray-900 font-medium">{editedProfile.yearBuilt || 'Not specified'}</p>
                {editedProfile.yearBuilt && (
                  <p className="text-sm text-gray-500">{getHomeAge()}</p>
                )}
              </div>
            )}
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="h-4 w-4 inline mr-1" />
              Square Footage
            </label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  value={editedProfile.squareFootage || ''}
                  onChange={(e) => updateField('squareFootage', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="2000"
                  min="1"
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.squareFootage ? 'border-red-300' : ''
                  }`}
                />
                {errors.squareFootage && <p className="text-red-600 text-sm mt-1">{errors.squareFootage}</p>}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">
                {editedProfile.squareFootage ? `${editedProfile.squareFootage.toLocaleString()} sq ft` : 'Not specified'}
              </p>
            )}
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bed className="h-4 w-4 inline mr-1" />
              Bedrooms
            </label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  value={editedProfile.bedrooms || ''}
                  onChange={(e) => updateField('bedrooms', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="3"
                  min="0"
                  max="20"
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.bedrooms ? 'border-red-300' : ''
                  }`}
                />
                {errors.bedrooms && <p className="text-red-600 text-sm mt-1">{errors.bedrooms}</p>}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{editedProfile.bedrooms || 'Not specified'}</p>
            )}
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bath className="h-4 w-4 inline mr-1" />
              Bathrooms
            </label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  step="0.5"
                  value={editedProfile.bathrooms || ''}
                  onChange={(e) => updateField('bathrooms', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="2.5"
                  min="0"
                  max="20"
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.bathrooms ? 'border-red-300' : ''
                  }`}
                />
                {errors.bathrooms && <p className="text-red-600 text-sm mt-1">{errors.bathrooms}</p>}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{editedProfile.bathrooms || 'Not specified'}</p>
            )}
          </div>

          {/* Lot Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lot Size (acres)</label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={editedProfile.lotSize || ''}
                  onChange={(e) => updateField('lotSize', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.25"
                  min="0"
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lotSize ? 'border-red-300' : ''
                  }`}
                />
                {errors.lotSize && <p className="text-red-600 text-sm mt-1">{errors.lotSize}</p>}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">
                {editedProfile.lotSize ? `${editedProfile.lotSize} acres` : 'Not specified'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Home Features */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Home Features</h3>
            <p className="text-gray-600 text-sm mt-1">
              {isEditing 
                ? 'Select features that apply to your home. This helps us recommend the right maintenance tasks.'
                : `${editedProfile.features?.length || 0} features selected`
              }
            </p>
          </div>
          {isEditing && (
            <div className="text-sm text-gray-500">
              {editedProfile.features?.length || 0} selected
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {commonFeatures.map((feature) => {
            const isSelected = (editedProfile.features || []).includes(feature);
            return (
              <button
                key={feature}
                onClick={() => isEditing && toggleFeature(feature)}
                disabled={!isEditing}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                } ${!isEditing ? 'cursor-default' : 'cursor-pointer hover:border-blue-300'}`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span>{feature}</span>
                </div>
              </button>
            );
          })}
        </div>

        {isEditing && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Home className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Smart Recommendations</h4>
                <p className="text-blue-800 text-sm">
                  Based on your selected features, we'll automatically create personalized maintenance tasks and checklists 
                  to help you keep your home in perfect condition.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Home Summary */}
      {!isEditing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{getHomeAge()}</div>
              <div className="text-sm text-gray-600">Home Age</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {editedProfile.squareFootage ? `${editedProfile.squareFootage.toLocaleString()}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Square Feet</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {editedProfile.bedrooms || 'N/A'} / {editedProfile.bathrooms || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Bed / Bath</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{editedProfile.features?.length || 0}</div>
              <div className="text-sm text-gray-600">Features</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeProfile;