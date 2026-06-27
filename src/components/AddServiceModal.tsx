import React, { useState } from 'react';
import { X, Calendar, DollarSign, Star, FileText } from 'lucide-react';
import { ServiceRecord } from '../types';

interface AddServiceModalProps {
  contactId: string;
  contactName: string;
  onClose: () => void;
  onAddService: (contactId: string, service: Omit<ServiceRecord, 'id'>) => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  contactId,
  contactName,
  onClose,
  onAddService
}) => {
  const [formData, setFormData] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    rating: 5,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Service description is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) < 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.date) {
      newErrors.date = 'Service date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newService: Omit<ServiceRecord, 'id'> = {
      description: formData.description.trim(),
      date: formData.date,
      amount: parseFloat(formData.amount),
      rating: formData.rating,
      notes: formData.notes.trim() || undefined
    };

    onAddService(contactId, newService);
    onClose();
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            className={`p-1 rounded transition-colors ${
              star <= formData.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star className={`h-6 w-6 ${star <= formData.rating ? 'fill-current' : ''}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({formData.rating} star{formData.rating !== 1 ? 's' : ''})</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Add Service Record</h3>
              <p className="text-gray-600 mt-1">For {contactName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Service Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., HVAC tune-up, plumbing repair, lawn mowing"
              className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : ''
              }`}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Service Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-300' : ''
                }`}
              />
              {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Amount Paid *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-300' : ''
                }`}
              />
              {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="h-4 w-4 inline mr-1" />
              Rating
            </label>
            {renderStars()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about the service..."
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;