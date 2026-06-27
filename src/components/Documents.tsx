import React, { useState } from 'react';
import { FileText, Upload, Search, Filter, Calendar, File, Image, Eye, Download, Plus } from 'lucide-react';
import { Document, Category } from '../types';
import UpgradePrompt from './UpgradePrompt';
import CategoryManager from './CategoryManager';
import { defaultCategories } from '../data/mockData';

interface DocumentsProps {
  documents: Document[];
  userPlan: 'free' | 'premium';
  onShowPricing: () => void;
}

const Documents: React.FC<DocumentsProps> = ({ documents, userPlan, onShowPricing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));
  const documentCategories = categories.filter(cat => cat.type === 'warranty' || cat.type === 'both');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    
    return matchesSearch && matchesType;
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

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'warranty' as Document['type'],
    category: documentCategories[0]?.id || 'other',
    relatedItem: '',
    expirationDate: '',
    notes: ''
  });

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleSaveDocument = () => {
    // In production, this would save to the database
    console.log('Saving document:', newDocument);
    alert('Document saved successfully! (Demo mode - not actually saved)');
    setShowUploadModal(false);
    setUploadedFile(null);
    setNewDocument({
      title: '',
      type: 'warranty',
      category: documentCategories[0]?.id || 'other',
      relatedItem: '',
      expirationDate: '',
      notes: ''
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warranty':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'manual':
        return <File className="h-5 w-5 text-green-500" />;
      case 'receipt':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'inspection':
        return <Search className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warranty':
        return 'bg-blue-100 text-blue-800';
      case 'manual':
        return 'bg-green-100 text-green-800';
      case 'receipt':
        return 'bg-purple-100 text-purple-800';
      case 'inspection':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
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

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
          <p className="text-gray-600 mt-1">Add warranty, manual, or other home document</p>
        </div>
        
        <div className="p-6 space-y-4">
          {uploadedFile ? (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload document or image</p>
              <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
            <input
              type="text"
              value={newDocument.title}
              onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
              placeholder="Document name"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              placeholder="Document name"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select 
                value={newDocument.type}
                onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as any })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="warranty">Warranty</option>
                <option value="manual">Manual</option>
                <option value="receipt">Receipt</option>
                <option value="inspection">Inspection</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={newDocument.category}
                onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                {documentCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Related Item (optional)</label>
            <input
              type="text"
              value={newDocument.relatedItem}
              onChange={(e) => setNewDocument({ ...newDocument, relatedItem: e.target.value })}
              placeholder="e.g., Refrigerator, Water Heater"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date (optional)</label>
            <input
              type="date"
              value={newDocument.expirationDate}
              onChange={(e) => setNewDocument({ ...newDocument, expirationDate: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              value={newDocument.notes}
              onChange={(e) => setNewDocument({ ...newDocument, notes: e.target.value })}
              placeholder="Additional notes about this document..."
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
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
            onClick={handleSaveDocument}
            disabled={!newDocument.title.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Upload Document
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
          feature="Document Management & Cloud Storage"
          description="Store unlimited warranties, manuals, and home documents with secure cloud backup and smart organization."
          onUpgrade={onShowPricing}
          onDismiss={() => setShowUpgradePrompt(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">Manage warranties, manuals, and important home documents</p>
        </div>
        <button 
          onClick={() => userPlan === 'free' ? onShowPricing() : setShowUploadModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{userPlan === 'free' ? 'Upgrade to Upload' : 'Upload Document'}</span>
        </button>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {documentTypes.map((type) => {
          const count = documents.filter(doc => doc.type === type).length;
          return (
            <div key={type} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{type}s</div>
                </div>
                {getTypeIcon(type)}
              </div>
            </div>
          );
        })}
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
              type="warranty"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents by title, category, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {documentTypes.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => {
          const expirationStatus = getExpirationStatus(document.expirationDate);
          
          return (
            <div key={document.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${userPlan === 'free' ? 'opacity-75' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(document.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                    <p className="text-sm text-gray-600">{getCategoryInfo(document.category).name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(document.type)} capitalize`}>
                    {document.type}
                  </span>
                  {expirationStatus && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${expirationStatus.color}`}>
                      {expirationStatus.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Uploaded:</span>
                  <span className="text-gray-900">{new Date(document.uploadDate).toLocaleDateString()}</span>
                </div>
                
                {document.relatedItem && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Related to:</span>
                    <span className="text-gray-900">{document.relatedItem}</span>
                  </div>
                )}

                {document.expirationDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expires:</span>
                    <span className={`font-medium ${
                      expirationStatus?.status === 'expired' ? 'text-red-600' :
                      expirationStatus?.status === 'expiring' ? 'text-orange-600' :
                      'text-gray-900'
                    }`}>
                      {new Date(document.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {document.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{document.notes}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                <button 
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50"
                  disabled={userPlan === 'free'}
                  onClick={() => {
                    if (userPlan === 'free') {
                      onShowPricing();
                    } else {
                      alert('Document viewer coming soon! This will display your documents with zoom, annotation, and sharing capabilities.');
                    }
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span>{userPlan === 'free' ? 'Premium Feature' : 'View'}</span>
                </button>
                <button 
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50"
                  disabled={userPlan === 'free'}
                  onClick={() => {
                    if (userPlan === 'free') {
                      onShowPricing();
                    } else {
                      alert('Document download coming soon! You\'ll be able to download your documents in various formats.');
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>{userPlan === 'free' ? 'Upgrade' : 'Download'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedType !== 'all'
              ? 'Try adjusting your search criteria.'
              : 'Upload your first document to get started organizing your home records.'}
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default Documents;