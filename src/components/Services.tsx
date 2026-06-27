import React, { useState } from 'react';
import { Search, Star, Phone, Mail, MapPin, Filter, Users, Plus, Globe, Heart, Calendar, DollarSign, Tag, ExternalLink, Edit, Trash2, X } from 'lucide-react';
import { ServiceContact, ServiceRecord } from '../types';
import AddContactModal from './AddContactModal';
import AddServiceModal from './AddServiceModal';

interface ServicesProps {
  serviceContacts: ServiceContact[];
  onAddContact: (contact: ServiceContact) => void;
  onUpdateContact: (contact: ServiceContact) => void;
  onDeleteContact: (contactId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ serviceContacts, onAddContact, onUpdateContact, onDeleteContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ServiceContact | null>(null);
  const [showAddService, setShowAddService] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<ServiceContact | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAllServices, setShowAllServices] = useState<string | null>(null);

  const DeleteConfirmModal = ({ contactId, contactName }: { contactId: string; contactName: string }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Delete Contact</h3>
              <p className="text-gray-600 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{contactName}</strong>? 
            This will permanently remove the contact and all associated service history.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-800 text-sm font-medium">This will delete:</span>
            </div>
            <ul className="mt-2 text-red-700 text-sm space-y-1 ml-4">
              <li>• Contact information</li>
              <li>• All service records</li>
              <li>• Service history and ratings</li>
              <li>• Any notes and tags</li>
            </ul>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteContact(contactId)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete Contact
          </button>
        </div>
      </div>
    </div>
  );

  const categories = Array.from(new Set(serviceContacts.map(contact => contact.category)));

  const filteredContacts = serviceContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         contact.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || contact.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const getAverageRating = (services: ServiceRecord[]) => {
    const ratingsWithValues = services.filter(s => s.rating);
    if (ratingsWithValues.length === 0) return 0;
    return ratingsWithValues.reduce((sum, s) => sum + (s.rating || 0), 0) / ratingsWithValues.length;
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className={`ml-1 text-gray-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  const getTotalSpent = (services: ServiceRecord[]) => {
    return services.reduce((sum, service) => sum + service.amount, 0);
  };

  const getYTDSpent = (services: ServiceRecord[]) => {
    const currentYear = new Date().getFullYear();
    return services
      .filter(service => new Date(service.date).getFullYear() === currentYear)
      .reduce((sum, service) => sum + service.amount, 0);
  };

  const getPastSpent = (services: ServiceRecord[]) => {
    const currentYear = new Date().getFullYear();
    return services
      .filter(service => new Date(service.date).getFullYear() < currentYear)
      .reduce((sum, service) => sum + service.amount, 0);
  };

  const formatLastUsed = (lastUsed?: string) => {
    if (!lastUsed) return 'Never used';
    const date = new Date(lastUsed);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleAddContact = (contactData: Omit<ServiceContact, 'id' | 'addedDate'>) => {
    const newContact: ServiceContact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      addedDate: new Date().toISOString().split('T')[0]
    };
    onAddContact(newContact);
  };

  const handleEditContact = (contactData: Omit<ServiceContact, 'id' | 'addedDate'>) => {
    if (editingContact) {
      const updatedContact: ServiceContact = {
        ...editingContact,
        ...contactData
      };
      onUpdateContact(updatedContact);
      setEditingContact(null);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    onDeleteContact(contactId);
    setShowDeleteConfirm(null);
  };

  const handleAddService = (contactId: string, serviceData: Omit<ServiceRecord, 'id'>) => {
    const newService: ServiceRecord = {
      ...serviceData,
      id: `service-${Date.now()}`
    };
    
    const contact = serviceContacts.find(c => c.id === contactId);
    if (contact) {
      const updatedContact = {
        ...contact,
        services: [...contact.services, newService],
        lastUsed: serviceData.date
      };
      onUpdateContact(updatedContact);
    }
    
    setShowAddService(null);
  };

  const handleCloseAddEditModal = () => {
    setShowAddContact(false);
    setEditingContact(null);
  };

  const ContactDetailModal = ({ contact }: { contact: ServiceContact }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <span>{contact.name}</span>
                <Calendar className="h-5 w-5 text-blue-600" />
              </h3>
              {contact.company && (
                <p className="text-gray-600">{contact.company}</p>
              )}
              <p className="text-sm text-blue-600 font-medium mt-1">Service History</p>
            </div>
            <button
              onClick={() => setSelectedContact(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Spending Summary */}
          {contact.services.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-semibold text-green-900 mb-3">Spending Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">${getYTDSpent(contact.services).toFixed(0)}</div>
                  <div className="text-sm text-green-600">YTD {new Date().getFullYear()}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">${getPastSpent(contact.services).toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Previous Years</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">${getTotalSpent(contact.services).toFixed(0)}</div>
                  <div className="text-sm text-blue-600">Total Spent</div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{contact.phone}</span>
              </div>
              {contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{contact.email}</span>
                </div>
              )}
              {contact.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    {contact.website}
                  </a>
                </div>
              )}
              {contact.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Service History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Service History</h4>
              {contact.services.length > 0 && (
                <span className="text-sm text-gray-500">
                  {contact.services.length} service{contact.services.length !== 1 ? 's' : ''} total
                </span>
              )}
            </div>
            {contact.services.length > 0 ? (
              <div className="space-y-3">
                {contact.services
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((service) => (
                  <div key={service.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{service.description}</h5>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm text-gray-600">{new Date(service.date).toLocaleDateString()}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            new Date(service.date).getFullYear() === new Date().getFullYear()
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {new Date(service.date).getFullYear() === new Date().getFullYear() ? 'This Year' : new Date(service.date).getFullYear()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${service.amount.toFixed(2)}</div>
                        {service.rating && renderStars(service.rating, 'sm')}
                      </div>
                    </div>
                    {service.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-sm text-gray-600 italic">{service.notes}</p>
                      </div>
                    )}
                  </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No service history yet</p>
                <p className="text-gray-400 text-xs">Add a service record to start tracking history</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contacts</h1>
          <p className="text-gray-600">Manage your trusted service providers and track service history</p>
        </div>
        <button 
          onClick={() => setShowAddContact(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{serviceContacts.length}</div>
              <div className="text-sm text-gray-500">Total Contacts</div>
            </div>
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{serviceContacts.filter(c => c.isFavorite).length}</div>
              <div className="text-sm text-gray-500">Favorites</div>
            </div>
            <Heart className="h-6 w-6 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
            <Tag className="h-6 w-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ${serviceContacts.reduce((sum, contact) => sum + getTotalSpent(contact.services), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Spent</div>
            </div>
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-700">Search & Filter</span>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`ml-auto flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              showFavoritesOnly 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, category, or tags..."
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
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => {
          const averageRating = getAverageRating(contact.services);
          const ytdSpent = getYTDSpent(contact.services);
          const pastSpent = getPastSpent(contact.services);
          
          return (
          <div key={contact.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                  {contact.isFavorite && (
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  )}
                </div>
                {contact.company && (
                  <p className="text-sm text-gray-600 mb-1">{contact.company}</p>
                )}
                <p className="text-sm text-blue-600 font-medium mb-2">{contact.category}</p>
                {averageRating > 0 && (
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(averageRating)}
                    <span className="text-sm text-gray-500">({contact.services.length} services)</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                {(ytdSpent > 0 || pastSpent > 0) && (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-900">
                      ${getTotalSpent(contact.services).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="flex flex-col space-y-1 mt-2">
                      {ytdSpent > 0 && (
                        <div className="text-xs">
                          <span className="text-green-600 font-medium">${ytdSpent.toFixed(0)} YTD</span>
                        </div>
                      )}
                      {pastSpent > 0 && (
                        <div className="text-xs">
                          <span className="text-gray-600">${pastSpent.toFixed(0)} Past</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {formatLastUsed(contact.lastUsed)}
                </div>
              </div>
            </div>

            {contact.notes && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{contact.notes}</p>
            )}

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {contact.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {contact.tags.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      +{contact.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </button>
              {contact.services.length > 0 ? (
                <button 
                  onClick={() => setSelectedContact(contact)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span>History</span>
                </button>
              ) : (
                <button 
                  onClick={() => setSelectedContact(contact)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Users className="h-4 w-4" />
                  <span>Details</span>
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <button 
                onClick={() => setShowAddService(contact.id)}
                className="flex-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add Service Record
              </button>
              <button 
                onClick={() => setEditingContact(contact)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(contact.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all' || showFavoritesOnly
              ? 'Try adjusting your search criteria.'
              : 'Add your first contact to get started.'}
          </p>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal contact={selectedContact} />
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContact || editingContact !== null}
        onClose={handleCloseAddEditModal}
        onAddContact={handleAddContact}
        editingContact={editingContact}
        onUpdateContact={(updatedContact) => {
          onUpdateContact(updatedContact);
          setEditingContact(null);
        }}
      />

      {/* Add Service Modal */}
      {showAddService && (
        <AddServiceModal 
          contactId={showAddService}
          contactName={serviceContacts.find(c => c.id === showAddService)?.name || ''}
          onClose={() => setShowAddService(null)}
          onAddService={handleAddService}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal 
          contactId={showDeleteConfirm}
          contactName={serviceContacts.find(c => c.id === showDeleteConfirm)?.name || 'Unknown Contact'}
        />
      )}
    </div>
  );
};

export default Services;