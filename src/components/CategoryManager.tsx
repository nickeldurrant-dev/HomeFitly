import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Palette } from 'lucide-react';
import { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  type: 'receipt' | 'warranty' | 'both';
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  type
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Package'
  });

  const colorOptions = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-teal-100 text-teal-800',
    'bg-gray-100 text-gray-800'
  ];

  const iconOptions = [
    'Package', 'Home', 'Zap', 'Wrench', 'Settings', 'Shield', 
    'Lightbulb', 'Droplets', 'Wind', 'Trees', 'Car', 'Smartphone'
  ];

  const filteredCategories = categories.filter(cat => 
    cat.type === type || cat.type === 'both'
  );

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      onAddCategory({
        name: newCategory.name.trim(),
        type,
        isDefault: false,
        color: newCategory.color,
        icon: newCategory.icon
      });
      setNewCategory({ name: '', color: 'bg-blue-100 text-blue-800', icon: 'Package' });
      setShowAddForm(false);
    }
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    onUpdateCategory(id, updates);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {type === 'both' ? 'All' : type} Categories
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Enter category name"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newCategory.color === color ? 'border-gray-900' : 'border-gray-300'
                    } ${color.split(' ')[0]}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-2">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                {category.name}
              </span>
              {category.isDefault && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  Default
                </span>
              )}
            </div>
            
            {!category.isDefault && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingId(category.id)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;