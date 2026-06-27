import React, { useState } from 'react';
import { Home, Edit, Check, ArrowLeft, ArrowRight, Calendar, Ruler, Bed, Bath } from 'lucide-react';
import { HomeProfile } from '../../types';

interface HomeDataReviewProps {
  homeData: any;
  homeProfile: Partial<HomeProfile>;
  onConfirm: (updatedProfile: Partial<HomeProfile>) => void;
  onBack: () => void;
}

const HomeDataReview: React.FC<HomeDataReviewProps> = ({
  homeData,
  homeProfile,
  onConfirm,
  onBack
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<HomeProfile>>(homeProfile);

  const handleSave = () => {
    setIsEditing(false);
    onConfirm(editedProfile);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const updateField = (field: keyof HomeProfile, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const homeTypeOptions = [
    { value: 'single-family', label: 'Single Family Home' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'condo', label: 'Condominium' },
    { value: 'apartment', label: 'Apartment' }
  ];

  const commonFeatures = [
    'Central Air', 'Hardwood Floors', 'Granite Countertops', 'Stainless Steel Appliances',
    'Two-Car Garage', 'Deck', 'Patio', 'Fireplace', 'Pool', 'Hot Tub',
    'Security System', 'Smart Home Features', 'Solar Panels', 'Basement',
    'Attic', 'Laundry Room', 'Walk-in Closet', 'Garden', 'Sprinkler System'
  ];

  const toggleFeature = (feature: string) => {
    const currentFeatures = editedProfile.features || [];
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    updateField('features', updatedFeatures);
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Home Details</h2>
        <p className="text-gray-600">
          We found this information about your home. Please review and update as needed.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Address */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <Home className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Property Address</h3>
              <p className="text-gray-700">{editedProfile.address}</p>
            </div>
          </div>
        </div>

        {/* Family Name */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Name (for personalized greetings)
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.familyName || ''}
                onChange={(e) => updateField('familyName', e.target.value)}
                placeholder="e.g., Smith, Johnson, Garcia"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {editedProfile.familyName ? `${editedProfile.familyName} family` : 'Not set'}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              This will be used for personalized messages like "Welcome back, {editedProfile.familyName || 'Smith'} family"
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Year Built
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProfile.yearBuilt || ''}
                  onChange={(e) => updateField('yearBuilt', parseInt(e.target.value))}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{editedProfile.yearBuilt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="h-4 w-4 inline mr-1" />
                Square Footage
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProfile.squareFootage || ''}
                  onChange={(e) => updateField('squareFootage', parseInt(e.target.value))}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{editedProfile.squareFootage?.toLocaleString()} sq ft</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bed className="h-4 w-4 inline mr-1" />
                Bedrooms
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProfile.bedrooms || ''}
                  onChange={(e) => updateField('bedrooms', parseInt(e.target.value))}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{editedProfile.bedrooms}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bath className="h-4 w-4 inline mr-1" />
                Bathrooms
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.5"
                  value={editedProfile.bathrooms || ''}
                  onChange={(e) => updateField('bathrooms', parseFloat(e.target.value))}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{editedProfile.bathrooms}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Type</label>
              {isEditing ? (
                <select
                  value={editedProfile.homeType || ''}
                  onChange={(e) => updateField('homeType', e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  {homeTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 font-medium capitalize">
                  {homeTypeOptions.find(opt => opt.value === editedProfile.homeType)?.label}
                </p>
              )}
            </div>

            {editedProfile.lotSize && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lot Size</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editedProfile.lotSize || ''}
                    onChange={(e) => updateField('lotSize', parseFloat(e.target.value))}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Acres"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{editedProfile.lotSize} acres</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Home Features */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Features</h3>
          <p className="text-gray-600 text-sm mb-4">
            Select all features that apply to your home. This helps us recommend the right maintenance tasks.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Save & Continue</span>
            </button>
          ) : (
            <button
              onClick={() => onConfirm(editedProfile)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDataReview;