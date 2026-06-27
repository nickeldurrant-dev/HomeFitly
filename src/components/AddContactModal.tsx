import React, { useState } from 'react';
import { useEffect } from 'react';
import { X, User, Building, Phone, Mail, Globe, MapPin, Tag, Heart } from 'lucide-react';
import { ServiceContact } from '../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: Omit<ServiceContact, 'id' | 'addedDate'>) => void;
  editingContact?: ServiceContact | null;
  onUpdateContact?: (contact: ServiceContact) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
  editingContact,
  onUpdateContact
}) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    notes: '',
    tags: '',
    isFavorite: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name,
        company: editingContact.company || '',
        category: editingContact.category,
        phone: editingContact.phone,
        email: editingContact.email || '',
        website: editingContact.website || '',
        address: editingContact.address || '',
        notes: editingContact.notes || '',
        tags: editingContact.tags.join(', '),
        isFavorite: editingContact.isFavorite
      });
    } else {
      setFormData({
        name: '',
        company: '',
        category: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        notes: '',
        tags: '',
        isFavorite: false
      });
    }
  }, [editingContact]);

  const categories = [
    'HVAC',
    'Plumbing',
    'Electrical',
    'Landscaping',
    'Roofing',
    'Cleaning',
    'Pest Control',
    'Security',
    'Appliance Repair',
    'Handyman',
    'Painting',
    'Flooring',
    'Windows & Doors',
    'Pool & Spa',
    'Other'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Basic email validation if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Basic website validation if provided
    if (formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Process tags
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (editingContact && onUpdateContact) {
      // Update existing contact
      const updatedContact: ServiceContact = {
        ...editingContact,
        name: formData.name.trim(),
        company: formData.company.trim() || undefined,
        category: formData.category,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        tags,
        isFavorite: formData.isFavorite
      };
      onUpdateContact(updatedContact);
    } else {
      // Add new contact
      const newContact: Omit<ServiceContact, 'id' | 'addedDate'> = {
        name: formData.name.trim(),
        company: formData.company.trim() || undefined,
        category: formData.category,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        services: [],
        tags,
        isFavorite: formData.isFavorite,
        lastUsed: undefined
      };
      onAddContact(newContact);
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      company: '',
      category: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      notes: '',
      tags: '',
      isFavorite: false
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <p className="text-gray-600 mt-1">
                {editingContact ? 'Update contact information' : 'Add a service provider to your contacts'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., John Smith"
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : ''
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Company (optional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., ABC Plumbing Services"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.category ? 'border-red-300' : ''
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g., (555) 123-4567"
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300' : ''
                }`}
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="e.g., contact@company.com"
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : ''
                }`}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                Website (optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="e.g., https://company.com"
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.website ? 'border-red-300' : ''
                }`}
              />
              {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Address (optional)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="e.g., 123 Main St, City, State"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags (optional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="e.g., reliable, emergency-service, licensed (comma-separated)"
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this contact..."
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Favorite */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.isFavorite}
              onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="favorite" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Heart className={`h-4 w-4 ${formData.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              <span>Add to favorites</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editingContact ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;