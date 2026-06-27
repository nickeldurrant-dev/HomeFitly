import React, { useState } from 'react';
import { Camera, Camera as CameraSource } from 'lucide-react';
import { useNativeFeatures } from '../hooks/useNativeFeatures';

interface NativeCameraProps {
  onImageCapture: (imageData: string) => void;
  onError?: (error: string) => void;
}

const NativeCamera: React.FC<NativeCameraProps> = ({ onImageCapture, onError }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const { isNative, takePicture, triggerHaptic } = useNativeFeatures();

  const handleTakePicture = async (source: 'camera' | 'gallery' = 'camera') => {
    setIsCapturing(true);
    
    try {
      await triggerHaptic();
      
      const imageData = await takePicture(
        source === 'camera' ? CameraSource.Camera : CameraSource.Photos
      );
      
      if (imageData) {
        onImageCapture(imageData);
        await triggerHaptic();
      }
    } catch (error) {
      console.error('Camera error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to capture image');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isNative) {
    // Fallback for web version
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Take a photo or upload an image</p>
          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
            id="web-camera-input"
          />
          <label
            htmlFor="web-camera-input"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Choose File
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera Capture */}
        <button
          onClick={() => handleTakePicture('camera')}
          disabled={isCapturing}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors disabled:opacity-50"
        >
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {isCapturing ? 'Opening camera...' : 'Take Photo'}
          </p>
          <p className="text-sm text-gray-500">Use device camera</p>
        </button>

        {/* Photo Library */}
        <button
          onClick={() => handleTakePicture('gallery')}
          disabled={isCapturing}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Camera className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-gray-600 mb-2">
            {isCapturing ? 'Opening gallery...' : 'Choose from Gallery'}
          </p>
          <p className="text-sm text-gray-500">Select existing photo</p>
        </button>
      </div>

      {isCapturing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 text-sm">Accessing camera...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeCamera;