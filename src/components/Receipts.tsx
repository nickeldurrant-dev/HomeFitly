import React, { useState } from 'react';
import { Receipt, FileText, Upload, Search, Filter, Calendar, DollarSign, Tag, Camera, Plus, Eye } from 'lucide-react';
import { Receipt as IReceipt, Category } from '../types';
import UpgradePrompt from './UpgradePrompt';
import CategoryManager from './CategoryManager';
import { defaultCategories } from '../data/mockData';

interface ReceiptsProps {
  receipts: IReceipt[];
  userPlan: 'free' | 'premium';
  onShowPricing: () => void;
}

const Receipts: React.FC<ReceiptsProps> = ({ receipts, userPlan, onShowPricing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  const receiptCategories = categories.filter(cat => cat.type === 'receipt' || cat.type === 'both');

  // Check if user can add more receipts
  const canAddReceipt = userPlan === 'premium' || receipts.length === 0;
  const isAtFreeLimit = userPlan === 'free' && receipts.length >= 1;

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || receipt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category || { name: categoryId, color: 'bg-gray-100 text-gray-800' };
  };

  const handleAddCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [newReceipt, setNewReceipt] = useState({
    title: '',
    amount: '',
    vendor: '',
    description: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    tags: '',
    category: receiptCategories[0]?.id || 'other',
    warrantyDuration: '',
    warrantyType: ''
  });

  const handleImageCapture = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReceipt = () => {
    // In production, this would save to the database
    console.log('Saving receipt:', newReceipt);
    alert('Receipt saved successfully! (Demo mode - not actually saved)');
    setShowUploadModal(false);
    setCapturedImage(null);
    setNewReceipt({
      title: '',
      amount: '',
      vendor: '',
      description: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      tags: '',
      category: receiptCategories[0]?.id || 'other',
      warrantyDuration: '',
      warrantyType: ''
    });
  };

  const totalSpent = filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const thisYearSpent = filteredReceipts
    .filter(receipt => new Date(receipt.purchaseDate).getFullYear() === new Date().getFullYear())
    .reduce((sum, receipt) => sum + receipt.amount, 0);

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Upload Receipt</h3>
          <p className="text-gray-600 mt-1">Add a new purchase record to your home</p>
        </div>
        
        <div className="p-6 space-y-4">
          {capturedImage ? (
            <div className="relative">
              <img src={capturedImage} alt="Receipt" className="w-full h-48 object-cover rounded-lg" />
              <button
                onClick={() => setCapturedImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Take a photo or upload an image</p>
              <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files?.[0] && handleImageCapture(e.target.files[0])}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={newReceipt.title}
              onChange={(e) => setNewReceipt({ ...newReceipt, title: e.target.value })}
              placeholder="Item name"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={newReceipt.amount}
                onChange={(e) => setNewReceipt({ ...newReceipt, amount: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <input
                type="text"
                value={newReceipt.vendor}
                onChange={(e) => setNewReceipt({ ...newReceipt, vendor: e.target.value })}
                placeholder="Store/Company name"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <textarea
              value={newReceipt.description}
              onChange={(e) => setNewReceipt({ ...newReceipt, description: e.target.value })}
              placeholder="Additional details about the purchase..."
              rows={2}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
              <input
                type="date"
                value={newReceipt.purchaseDate}
                onChange={(e) => setNewReceipt({ ...newReceipt, purchaseDate: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
              <input
                type="text"
                value={newReceipt.tags}
                onChange={(e) => setNewReceipt({ ...newReceipt, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              value={newReceipt.category}
              onChange={(e) => setNewReceipt({ ...newReceipt, category: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {receiptCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Duration (optional)</label>
              <select
                value={newReceipt.warrantyDuration}
                onChange={(e) => setNewReceipt({ ...newReceipt, warrantyDuration: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No warranty</option>
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="3 years">3 years</option>
                <option value="5 years">5 years</option>
                <option value="10 years">10 years</option>
                <option value="Lifetime">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Type (optional)</label>
              <select
                value={newReceipt.warrantyType}
                onChange={(e) => setNewReceipt({ ...newReceipt, warrantyType: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                disabled={!newReceipt.warrantyDuration}
              >
                <option value="">Select type</option>
                <option value="Manufacturer Warranty">Manufacturer Warranty</option>
                <option value="Extended Warranty">Extended Warranty</option>
                <option value="Limited Warranty">Limited Warranty</option>
                <option value="Full Warranty">Full Warranty</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowUploadModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveReceipt}
            disabled={!newReceipt.title.trim() || !newReceipt.amount.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Save Receipt
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
          feature="Receipt & Document Storage"
          description="Store unlimited receipts, warranty documents, and home improvement records with cloud backup and smart categorization."
          onUpgrade={onShowPricing}
          onDismiss={() => setShowUpgradePrompt(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipts & Documents</h1>
          <p className="text-gray-600">Track your home purchases, upgrades, and important documents</p>
        </div>
        <button 
          onClick={() => canAddReceipt ? setShowUploadModal(true) : onShowPricing()}
          className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            canAddReceipt 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>
            {canAddReceipt 
              ? 'Upload Receipt' 
              : `Upgrade for More (${receipts.length}/1 used)`
            }
          </span>
        </button>
      </div>

      {/* Free Plan Limit Notice */}
      {isAtFreeLimit && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Receipt className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Free Plan Limit Reached</h3>
              <p className="text-orange-800 text-sm mt-1">
                You've used your 1 free receipt slot. Upgrade to Premium to store unlimited receipts with advanced features like cloud backup and smart categorization.
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Spent</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">${thisYearSpent.toLocaleString()}</div>
              <div className="text-sm text-gray-500">This Year</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{receipts.length}</div>
              <div className="text-sm text-gray-500">Total Records</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-700">Search & Filter</span>
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Manage Categories
          </button>
        </div>
        
        {showCategoryManager && (
          <div className="mb-6">
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              type="receipt"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search receipts by title, vendor, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {receiptCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReceipts.map((receipt) => (
          <div key={receipt.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${userPlan === 'free' ? 'opacity-75' : ''}`}>
            {receipt.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={receipt.imageUrl} 
                  alt={receipt.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{receipt.title}</h3>
                <p className="text-sm text-gray-600">{receipt.vendor}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryInfo(receipt.category).color}`}>
                {getCategoryInfo(receipt.category).name}
              </span>
            </div>

            {receipt.description && (
              <p className="text-gray-600 text-sm mb-3">{receipt.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold text-gray-900">${receipt.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-900">{new Date(receipt.purchaseDate).toLocaleDateString()}</span>
              </div>

              {receipt.warranty && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Warranty:</span>
                  <span className="text-green-600 font-medium">{receipt.warranty.duration}</span>
                </div>
              )}
            </div>

            {receipt.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {receipt.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {receipt.tags.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{receipt.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
              <button 
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50"
                disabled={false}
                onClick={() => {
                  alert('Receipt details viewer coming soon! This will show full receipt information, warranty details, and related documents.');
                }}
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
              <button 
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50"
                disabled={false}
                onClick={() => {
                  alert('Receipt editor coming soon! You\'ll be able to edit receipt details, add tags, and update warranty information.');
                }}
              >
                <FileText className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReceipts.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search criteria.'
              : canAddReceipt 
                ? 'Upload your first receipt to get started tracking your home expenses.'
                : 'Upgrade to Premium to store more receipts and documents.'}
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default Receipts;