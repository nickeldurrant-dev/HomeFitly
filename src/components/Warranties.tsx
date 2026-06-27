import React, { useState } from 'react';
import { Shield, Search, Calendar, FileText, AlertTriangle, Plus, Camera, Upload, Loader, Check, X } from 'lucide-react';
import { Warranty } from '../types';
import UpgradePrompt from './UpgradePrompt';
import WarrantyScanner from './WarrantyScanner';

const warrantyCategories = [
  'Kitchen Appliances',
  'HVAC & Climate',
  'Electronics',
  'Plumbing',
  'Electrical',
  'Flooring',
  'Roofing',
  'Security Systems',
  'Lighting',
  'Bathroom',
  'Laundry',
  'Outdoor Equipment',
  'Tools & Equipment',
  'Other'
];

interface WarrantiesProps {
  warranties: Warranty[];
  userPlan: 'free' | 'premium';
  onShowPricing: () => void;
}

const Warranties: React.FC<WarrantiesProps> = ({ warranties, userPlan, onShowPricing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showWarrantyScanner, setShowWarrantyScanner] = useState(false);
  const [capturedImages, setCapturedImages] = useState<{ receipt?: string; warranty?: string }>({});
  const [newWarranty, setNewWarranty] = useState({
    item: '',
    brand: '',
    model: '',
    category: '',
    purchaseDate: '',
    expirationDate: '',
    warrantyType: '',
    notes: ''
  });

  const filteredWarranties = warranties.filter(warranty =>
    warranty.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warranty.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warranty.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user can add more warranties
  const canAddWarranty = userPlan === 'premium' || warranties.length === 0;
  const isAtFreeLimit = userPlan === 'free' && warranties.length >= 1;

  const getWarrantyStatus = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', label: 'Expired' };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', color: 'bg-orange-100 text-orange-800', label: `${daysUntilExpiration} days left` };
    } else if (daysUntilExpiration <= 90) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800', label: `${daysUntilExpiration} days left` };
    } else {
      return { status: 'active', color: 'bg-green-100 text-green-800', label: 'Active' };
    }
  };

  const expiringCount = warranties.filter(w => {
    const daysUntilExpiration = Math.ceil((new Date(w.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
  }).length;

  const expiredCount = warranties.filter(w => {
    const daysUntilExpiration = Math.ceil((new Date(w.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration < 0;
  }).length;

  const handleManualEntry = () => {
    // In a real app, this would save to the database
    console.log('Saving warranty:', newWarranty);
    
    if (!newWarranty.item.trim() || !newWarranty.brand.trim() || !newWarranty.model.trim() || 
        !newWarranty.category || !newWarranty.purchaseDate || !newWarranty.expirationDate || 
        !newWarranty.warrantyType) {
      alert('Please fill in all required fields');
      return;
    }

    alert('Warranty saved successfully! (Demo mode - not actually saved)');
    
    // Reset form
    setNewWarranty({
      item: '',
      brand: '',
      model: '',
      category: '',
      purchaseDate: '',
      expirationDate: '',
      warrantyType: '',
      notes: ''
    });
    setShowManualEntry(false);
  };

  const handleImageCapture = (type: 'receipt' | 'warranty', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImages(prev => ({
        ...prev,
        [type]: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'receipt' | 'warranty') => {
    setCapturedImages(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  const ManualEntryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add Warranty Manually</h3>
          <p className="text-gray-600 mt-1">Enter warranty information for your home item</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Photo Capture Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Document Photos (Optional)</h4>
            <p className="text-sm text-gray-600">Take photos of your receipt and warranty document for your records</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Receipt Photo */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Receipt Photo</label>
                {capturedImages.receipt ? (
                  <div className="relative">
                    <img 
                      src={capturedImages.receipt} 
                      alt="Receipt" 
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage('receipt')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">Take a photo of your receipt</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && handleImageCapture('receipt', e.target.files[0])}
                      className="hidden"
                      id="receipt-camera"
                    />
                    <label
                      htmlFor="receipt-camera"
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium inline-flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Take Photo</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Warranty Document Photo */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Warranty Document</label>
                {capturedImages.warranty ? (
                  <div className="relative">
                    <img 
                      src={capturedImages.warranty} 
                      alt="Warranty Document" 
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage('warranty')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">Take a photo of warranty info</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && handleImageCapture('warranty', e.target.files[0])}
                      className="hidden"
                      id="warranty-camera"
                    />
                    <label
                      htmlFor="warranty-camera"
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm font-medium inline-flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Take Photo</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Photo Tips</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure good lighting and clear text</li>
                    <li>• Include all warranty terms and dates</li>
                    <li>• Capture serial numbers and model info</li>
                    <li>• Photos are stored securely with your warranty</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item/Product Name *
              </label>
              <input
                type="text"
                value={newWarranty.item}
                onChange={(e) => setNewWarranty({ ...newWarranty, item: e.target.value })}
                placeholder="e.g., Refrigerator, Water Heater, HVAC System"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                value={newWarranty.brand}
                onChange={(e) => setNewWarranty({ ...newWarranty, brand: e.target.value })}
                placeholder="e.g., Samsung, GE, Whirlpool"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Number *
              </label>
              <input
                type="text"
                value={newWarranty.model}
                onChange={(e) => setNewWarranty({ ...newWarranty, model: e.target.value })}
                placeholder="e.g., RF28R7351SG"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={newWarranty.category}
                onChange={(e) => setNewWarranty({ ...newWarranty, category: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select category</option>
                {warrantyCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Type *
              </label>
              <select
                value={newWarranty.warrantyType}
                onChange={(e) => setNewWarranty({ ...newWarranty, warrantyType: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select warranty type</option>
                <option value="Manufacturer Warranty">Manufacturer Warranty</option>
                <option value="Extended Warranty">Extended Warranty</option>
                <option value="Service Contract">Service Contract</option>
                <option value="Limited Warranty">Limited Warranty</option>
                <option value="Full Warranty">Full Warranty</option>
                <option value="Parts Only">Parts Only</option>
                <option value="Labor Only">Labor Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date *
              </label>
              <input
                type="date"
                value={newWarranty.purchaseDate}
                onChange={(e) => setNewWarranty({ ...newWarranty, purchaseDate: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Expiration Date *
              </label>
              <input
                type="date"
                value={newWarranty.expirationDate}
                onChange={(e) => setNewWarranty({ ...newWarranty, expirationDate: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={newWarranty.notes}
              onChange={(e) => setNewWarranty({ ...newWarranty, notes: e.target.value })}
              placeholder="Additional warranty details, coverage information, or special terms..."
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Warranty Duration Helper */}
          {newWarranty.purchaseDate && newWarranty.expirationDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Warranty Duration</h4>
              <p className="text-blue-800 text-sm">
                {(() => {
                  const start = new Date(newWarranty.purchaseDate);
                  const end = new Date(newWarranty.expirationDate);
                  const diffTime = Math.abs(end.getTime() - start.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const years = Math.floor(diffDays / 365);
                  const months = Math.floor((diffDays % 365) / 30);
                  
                  if (years > 0) {
                    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` and ${months} month${months > 1 ? 's' : ''}` : ''} warranty period`;
                  } else if (months > 0) {
                    return `${months} month${months > 1 ? 's' : ''} warranty period`;
                  } else {
                    return `${diffDays} day${diffDays > 1 ? 's' : ''} warranty period`;
                  }
                })()}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowManualEntry(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleManualEntry}
            disabled={!newWarranty.item || !newWarranty.brand || !newWarranty.model || !newWarranty.category || !newWarranty.purchaseDate || !newWarranty.expirationDate || !newWarranty.warrantyType}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Warranty
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upgrade Prompt for Free Users */}
      {userPlan === 'free' && showUpgradePrompt && (
        <UpgradePrompt
          feature="Advanced Warranty Tracking"
          description="Track unlimited warranties, get expiration alerts, and store warranty documents securely in the cloud."
          onUpgrade={onShowPricing}
          onDismiss={() => setShowUpgradePrompt(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Warranty Management</h1>
          <p className="text-gray-600">Track and manage all your home appliance and system warranties</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => canAddWarranty ? setShowManualEntry(true) : onShowPricing()}
            className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              canAddWarranty 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>
              {canAddWarranty 
                ? 'Add Warranty' 
                : `Upgrade for More (${warranties.length}/1 used)`
              }
            </span>
          </button>
        </div>
      </div>

      {/* Free Plan Limit Notice */}
      {isAtFreeLimit && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Free Plan Limit Reached</h3>
              <p className="text-orange-800 text-sm mt-1">
                You've used your 1 free warranty slot. Upgrade to Premium to track unlimited warranties with advanced features.
              </p>
              <button
                onClick={onShowPricing}
                className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warranty Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{warranties.length}</div>
              <div className="text-sm text-gray-500">Total Warranties</div>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{warranties.length - expiringCount - expiredCount}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{expiringCount}</div>
              <div className="text-sm text-gray-500">Expiring Soon</div>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
              <div className="text-sm text-gray-500">Expired</div>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search warranties by item, brand, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Warranties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarranties.map((warranty) => {
          const isPremiumFeature = userPlan === 'free';
          const statusInfo = getWarrantyStatus(warranty.expirationDate);
          
          return (
            <div key={warranty.id} className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${isPremiumFeature ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{warranty.item}</h3>
                  <p className="text-gray-600 text-sm">{warranty.brand} {warranty.model}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Warranty Type:</span>
                  <span className="font-medium text-gray-900">{warranty.warrantyType}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Purchase Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(warranty.purchaseDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Expiration:</span>
                  <span className={`font-medium ${
                    statusInfo.status === 'expired' ? 'text-red-600' :
                    statusInfo.status === 'expiring' ? 'text-orange-600' :
                    'text-gray-900'
                  }`}>
                    {new Date(warranty.expirationDate).toLocaleDateString()}
                  </span>
                </div>

                {warranty.notes && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{warranty.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    if (isPremiumFeature) {
                      onShowPricing();
                    } else {
                      alert('Document viewer coming soon! This will display your warranty documents and receipts.');
                    }
                  }}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  disabled={isPremiumFeature}
                >
                  <FileText className="h-4 w-4" />
                  <span>{isPremiumFeature ? 'Premium Feature' : 'View Document'}</span>
                </button>
                <button 
                  onClick={() => {
                    if (isPremiumFeature) {
                      onShowPricing();
                    } else {
                      alert('Reminder system coming soon! You\'ll be able to set custom reminders for warranty expirations.');
                    }
                  }}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
                  disabled={isPremiumFeature}
                >
                  <Calendar className="h-4 w-4" />
                  <span>{isPremiumFeature ? 'Premium Feature' : 'Set Reminder'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWarranties.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No warranties found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Add your first warranty to get started.'}
          </p>
        </div>
      )}

      {/* Warranty Scanner Modal */}
      {showWarrantyScanner && userPlan === 'premium' && (
        <WarrantyScanner 
          onClose={() => setShowWarrantyScanner(false)}
          onSave={(warrantyData) => {
            // In real app, this would save to database
            console.log('Saving warranty:', warrantyData);
            setShowWarrantyScanner(false);
          }}
        />
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && <ManualEntryModal />}
    </div>
  );
};

export default Warranties;