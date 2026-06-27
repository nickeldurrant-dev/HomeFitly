import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader, Check, X, AlertTriangle, FileText, Calendar, Tag, Building } from 'lucide-react';
import NativeCamera from './NativeCamera';
import { useNativeFeatures } from '../hooks/useNativeFeatures';

interface WarrantyData {
  item: string;
  brand: string;
  model: string;
  purchaseDate: string;
  expirationDate: string;
  warrantyType: string;
  serialNumber?: string;
  notes?: string;
  documentUrl?: string;
}

interface WarrantyScannerProps {
  onClose: () => void;
  onSave: (warrantyData: WarrantyData) => void;
}

const WarrantyScanner: React.FC<WarrantyScannerProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<WarrantyData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isNative, saveFile } = useNativeFeatures();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please select an image or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    setStep('processing');
    processDocument(file);
  };

  const handleNativeImageCapture = async (imageData: string) => {
    try {
      // Convert data URL to blob for processing
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'warranty-document.jpg', { type: 'image/jpeg' });
      
      setSelectedFile(file);
      setPreviewUrl(imageData);
      setError(null);
      setStep('processing');
      processDocument(file);
    } catch (error) {
      setError('Failed to process captured image');
    }
  };

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate AI document processing
      // In a real app, this would use OCR and AI services like:
      // - Google Cloud Vision API
      // - AWS Textract
      // - Azure Form Recognizer
      // - OpenAI GPT-4 Vision
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

      // Mock extracted data based on common warranty document patterns
      const mockExtractedData: Partial<WarrantyData> = {
        item: 'Refrigerator', // Would be extracted from document
        brand: 'Samsung', // Would be extracted from document
        model: 'RF28R7351SG', // Would be extracted from document
        warrantyType: 'Limited Warranty', // Would be extracted from document
        serialNumber: 'SN123456789', // Would be extracted from document
        // purchaseDate and expirationDate would be extracted if found
      };

      setExtractedData(mockExtractedData);
      setStep('review');
    } catch (err) {
      setError('Failed to process document. Please try again or enter details manually.');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    // Validate required fields
    const requiredFields = ['item', 'brand', 'model', 'purchaseDate', 'expirationDate', 'warrantyType'];
    const missingFields = requiredFields.filter(field => !extractedData[field as keyof WarrantyData]);

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    onSave(extractedData as WarrantyData);
  };

  const updateField = (field: keyof WarrantyData, value: string) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Scan Warranty Document</h3>
              <p className="text-gray-600 mt-1">
                {step === 'upload' && 'Take a photo or upload your warranty document'}
                {step === 'processing' && 'Extracting warranty information...'}
                {step === 'review' && 'Review and complete warranty details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-6">
              {isNative ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Capture Warranty Document
                  </label>
                  <NativeCamera 
                    onImageCapture={handleNativeImageCapture}
                    onError={(error) => setError(error)}
                  />
                </div>
              ) : (
                <>
                  {/* Camera Capture */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Take a Photo
                    </label>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Use your camera to capture the warranty document</p>
                      <p className="text-sm text-gray-500">Best for physical documents</p>
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Document
                    </label>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload warranty document or photo</p>
                      <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </>
              )}

              {/* AI Features Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">AI-Powered Extraction</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Automatically extracts product information</li>
                      <li>• Identifies warranty dates and terms</li>
                      <li>• Reads serial numbers and model details</li>
                      <li>• Saves document for future reference</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Document</h4>
              <p className="text-gray-600 mb-6">
                Our AI is analyzing your warranty document and extracting key information...
              </p>
              
              {previewUrl && (
                <div className="max-w-sm mx-auto">
                  <img 
                    src={previewUrl} 
                    alt="Document preview" 
                    className="w-full rounded-lg shadow-sm border border-gray-200"
                  />
                </div>
              )}
              
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Reading document text...</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Identifying product information...</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>Extracting warranty details...</span>
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Document Processed Successfully!</h4>
                    <p className="text-sm text-green-800 mt-1">
                      Please review and complete any missing information below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              {previewUrl && (
                <div className="text-center">
                  <img 
                    src={previewUrl} 
                    alt="Document preview" 
                    className="max-w-xs mx-auto rounded-lg shadow-sm border border-gray-200"
                  />
                </div>
              )}

              {/* Extracted Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Item/Product Name *
                  </label>
                  <input
                    type="text"
                    value={extractedData.item || ''}
                    onChange={(e) => updateField('item', e.target.value)}
                    placeholder="e.g., Refrigerator, Water Heater"
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-1" />
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={extractedData.brand || ''}
                    onChange={(e) => updateField('brand', e.target.value)}
                    placeholder="e.g., Samsung, GE, Whirlpool"
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Number *
                  </label>
                  <input
                    type="text"
                    value={extractedData.model || ''}
                    onChange={(e) => updateField('model', e.target.value)}
                    placeholder="e.g., RF28R7351SG"
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={extractedData.serialNumber || ''}
                    onChange={(e) => updateField('serialNumber', e.target.value)}
                    placeholder="e.g., SN123456789"
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={extractedData.purchaseDate || ''}
                    onChange={(e) => updateField('purchaseDate', e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Warranty Expiration *
                  </label>
                  <input
                    type="date"
                    value={extractedData.expirationDate || ''}
                    onChange={(e) => updateField('expirationDate', e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Type *
                  </label>
                  <select
                    value={extractedData.warrantyType || ''}
                    onChange={(e) => updateField('warrantyType', e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select warranty type</option>
                    <option value="Manufacturer Warranty">Manufacturer Warranty</option>
                    <option value="Extended Warranty">Extended Warranty</option>
                    <option value="Service Contract">Service Contract</option>
                    <option value="Limited Warranty">Limited Warranty</option>
                    <option value="Full Warranty">Full Warranty</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={extractedData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Additional warranty details, coverage information, or special terms..."
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Missing Data Helper */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Can't find some information?</h4>
                    <p className="text-sm text-yellow-800">
                      If dates or details aren't visible in the document, check the original receipt, 
                      product manual, or manufacturer's website. You can always update this information later.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          {step === 'upload' && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {step === 'processing' && (
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {step === 'review' && (
            <>
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Scan Again
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Warranty
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarrantyScanner;