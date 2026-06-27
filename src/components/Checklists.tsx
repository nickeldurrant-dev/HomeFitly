import React, { useState } from 'react';
import { CheckSquare, Plus, Filter, Clock, AlertTriangle, Check, ChevronRight, Home, Calendar, Settings, Lightbulb, Star, X, Trash2 } from 'lucide-react';
import { Checklist, ChecklistItem } from '../types';
import UpgradePrompt from './UpgradePrompt';

interface ChecklistsProps {
  checklists: Checklist[];
  userPlan: 'free' | 'premium';
  onShowPricing: () => void;
  onUpdateChecklistItem: (checklistId: string, itemId: string, completed: boolean) => void;
  onAddChecklist: (checklist: Checklist) => void;
}

const Checklists: React.FC<ChecklistsProps> = ({ 
  checklists, 
  userPlan, 
  onShowPricing,
  onUpdateChecklistItem,
  onAddChecklist
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [showCustomization, setShowCustomization] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChecklist, setNewChecklist] = useState({
    title: '',
    description: '',
    category: 'custom' as const,
    items: [] as ChecklistItem[]
  });
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    estimatedTime: 30
  });

  const categories = Array.from(new Set(checklists.map(checklist => checklist.category)));

  const filteredChecklists = checklists.filter(checklist => {
    if (selectedCategory === 'all') return true;
    return checklist.category === selectedCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'move-in':
        return <Home className="h-5 w-5 text-blue-500" />;
      case 'seasonal':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'maintenance':
        return <Settings className="h-5 w-5 text-green-500" />;
      default:
        return <CheckSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getCompletionPercentage = (checklist: Checklist) => {
    const completed = checklist.items.filter(item => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  const getRecommendationBadge = (item: ChecklistItem) => {
    if (item.conditions || item.seasonal) {
      return (
        <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          <Lightbulb className="h-3 w-3" />
          <span>Recommended</span>
        </div>
      );
    }
    return null;
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;
    
    const item: ChecklistItem = {
      id: `item-${Date.now()}`,
      title: newItem.title.trim(),
      description: newItem.description.trim() || undefined,
      completed: false,
      category: newItem.category.trim() || 'General',
      priority: newItem.priority,
      estimatedTime: newItem.estimatedTime
    };
    
    setNewChecklist(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    
    // Reset new item form
    setNewItem({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      estimatedTime: 30
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setNewChecklist(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleCreateChecklist = () => {
    if (!newChecklist.title.trim() || newChecklist.items.length === 0) {
      alert('Please add a title and at least one task to your checklist.');
      return;
    }
    
    const checklist: Checklist = {
      id: `custom-${Date.now()}`,
      title: newChecklist.title.trim(),
      description: newChecklist.description.trim() || `Custom checklist with ${newChecklist.items.length} tasks`,
      category: 'custom',
      customizable: false,
      premium: false,
      baseItems: [...newChecklist.items],
      items: [...newChecklist.items]
    };
    
    onAddChecklist(checklist);
    
    // Reset form
    setNewChecklist({
      title: '',
      description: '',
      category: 'custom',
      items: []
    });
    setShowCreateModal(false);
  };

  const CreateChecklistModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Create Custom Checklist</h3>
              <p className="text-gray-600 mt-1">Build your own personalized home maintenance checklist</p>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Checklist Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checklist Title *
              </label>
              <input
                type="text"
                value={newChecklist.title}
                onChange={(e) => setNewChecklist(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Monthly Apartment Maintenance"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={newChecklist.description}
                onChange={(e) => setNewChecklist(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this checklist"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Add New Item Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Check smoke detector batteries"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Safety, HVAC, Plumbing"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed instructions for this task..."
                rows={2}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={newItem.estimatedTime}
                  onChange={(e) => setNewItem(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddItem}
              disabled={!newItem.title.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Current Items List */}
          {newChecklist.items.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Checklist Tasks ({newChecklist.items.length})
              </h4>
              
              <div className="space-y-3">
                {newChecklist.items.map((item, index) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {index + 1}
                          </span>
                          <h5 className="font-semibold text-gray-900">{item.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">{item.category}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.estimatedTime} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChecklist}
            disabled={!newChecklist.title.trim() || newChecklist.items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Checklist
          </button>
        </div>
      </div>
    </div>
  );

  const CustomizationModal = ({ checklist }: { checklist: Checklist }) => {
    const [answers, setAnswers] = useState<Record<string, any>>({});

    const handleAnswer = (questionId: string, answer: any) => {
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const applyCustomization = () => {
      // This would typically update the checklist based on answers
      // For now, we'll just close the modal
      setShowCustomization(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Customize Your Checklist</h3>
            <p className="text-gray-600 mt-1">Answer a few questions to personalize your home checklist</p>
          </div>
          
          <div className="p-6 space-y-6">
            {checklist.customizationQuestions?.map((question) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  {question.question}
                </label>
                
                {question.type === 'boolean' && (
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={question.id}
                        value="true"
                        onChange={() => handleAnswer(question.id, true)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={question.id}
                        value="false"
                        onChange={() => handleAnswer(question.id, false)}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                )}
                
                {question.type === 'select' && (
                  <select
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an option...</option>
                    {question.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {question.type === 'multiselect' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const currentAnswers = answers[question.id] || [];
                            if (e.target.checked) {
                              handleAnswer(question.id, [...currentAnswers, option]);
                            } else {
                              handleAnswer(question.id, currentAnswers.filter((a: string) => a !== option));
                            }
                          }}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowCustomization(null)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyCustomization}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Customization
            </button>
          </div>
        </div>
      </div>
    );
  };
  if (selectedChecklist) {
    const checklist = checklists.find(c => c.id === selectedChecklist);
    if (!checklist) return null;

    const completedItems = checklist.items.filter(item => item.completed).length;
    const totalItems = checklist.items.length;
    const completionPercentage = getCompletionPercentage(checklist);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedChecklist(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            <span className="text-sm font-medium">Back to Checklists</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{checklist.title}</h1>
              <p className="text-gray-600">{checklist.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              {checklist.customizable && userPlan === 'premium' && (
                <button
                  onClick={() => setShowCustomization(checklist.id)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Customize</span>
                </button>
              )}
              {checklist.premium && userPlan === 'free' && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Premium
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        {userPlan === 'premium' && checklist.items.some(item => item.conditions || item.seasonal) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-8">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Based on your home profile and the season, we've added personalized tasks to your checklist.
                </p>
                <div className="flex flex-wrap gap-2">
                  {checklist.items
                    .filter(item => item.conditions || item.seasonal)
                    .slice(0, 3)
                    .map((item, index) => (
                      <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                        {item.title}
                      </span>
                    ))}
                  {checklist.items.filter(item => item.conditions || item.seasonal).length > 3 && (
                    <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-500 shadow-sm">
                      +{checklist.items.filter(item => item.conditions || item.seasonal).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
          </div>
          
          <div className="bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{completedItems} of {totalItems} completed</span>
            <span>{totalItems - completedItems} remaining</span>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {checklist.items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
                item.completed ? 'border-green-200 bg-green-50' : 'border-gray-100'
              } ${checklist.premium && userPlan === 'free' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => {
                    if (checklist.premium && userPlan === 'free') {
                      onShowPricing();
                    } else {
                      onUpdateChecklistItem(checklist.id, item.id, !item.completed);
                    }
                  }}
                  className={`mt-1 p-2 rounded-full transition-colors ${
                    item.completed
                      ? 'text-green-600 bg-green-100'
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                  disabled={checklist.premium && userPlan === 'free'}
                >
                  <Check className="h-5 w-5" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-lg font-semibold ${
                      item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      {item.estimatedTime && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{item.estimatedTime}min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-gray-600 mb-3">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {item.category}
                    </span>
                    {getRecommendationBadge(item)}
                    {checklist.premium && userPlan === 'free' && (
                      <button
                        onClick={onShowPricing}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Upgrade to Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mark All Complete */}
        {completedItems < totalItems && !(checklist.premium && userPlan === 'free') && (
          <div className="mt-8 text-center">
            <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium">
              Mark All as Complete
            </button>
          </div>
        )}

        {/* Customization Modal */}
        {showCustomization && (
          <CustomizationModal 
            checklist={checklists.find(c => c.id === showCustomization)!} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upgrade Prompt for Free Users */}
      {userPlan === 'free' && showUpgradePrompt && (
        <UpgradePrompt
          feature="Advanced Checklists & Move-In Guides"
          description="Get customizable checklists tailored to your home type, move-in guides, and seasonal maintenance schedules to keep your home in perfect condition."
          onUpgrade={onShowPricing}
          onDismiss={() => setShowUpgradePrompt(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checklists</h1>
          <p className="text-gray-600">Customizable checklists to keep your home maintenance on track</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Checklist</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-700">Filter by Category</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize flex items-center space-x-2 ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(category)}
              <span>{category.replace('-', ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Checklists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChecklists.map((checklist) => {
          const completionPercentage = getCompletionPercentage(checklist);
          const isPremium = checklist.premium && userPlan === 'free';
          
          return (
            <div
              key={checklist.id}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer ${
                isPremium ? 'opacity-75' : ''
              }`}
              onClick={() => {
                if (isPremium) {
                  onShowPricing();
                } else {
                  setSelectedChecklist(checklist.id);
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(checklist.category)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{checklist.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{checklist.category.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {checklist.customizable && (
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      Customizable
                    </div>
                  )}
                  {checklist.premium && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Premium
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{checklist.description}</p>

              {/* Smart Features Badge */}
              {checklist.customizable && userPlan === 'premium' && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="flex items-center space-x-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 font-medium">Smart recommendations included</span>
                  </div>
                  <p className="text-green-700 text-xs mt-1">
                    Personalized based on your home profile and preferences
                  </p>
                </div>
              )}

              {/* Items Preview */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Sample tasks:</div>
                <div className="space-y-1">
                  {checklist.baseItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      <span className="line-clamp-1">{item.title}</span>
                    </div>
                  ))}
                  {checklist.baseItems.length > 3 && (
                    <div className="text-xs text-gray-500 ml-3.5">
                      +{checklist.baseItems.length - 3} more tasks...
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{checklist.items.length} items</span>
                  <span>{checklist.items.filter(item => item.completed).length} completed</span>
                </div>
              </div>

              {isPremium && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowPricing();
                    }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all font-medium text-sm"
                  >
                    Upgrade to Access
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredChecklists.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No checklists found</h3>
          <p className="text-gray-500">
            {selectedCategory !== 'all'
              ? 'Try selecting a different category.'
              : 'Create your first checklist to get started.'}
          </p>
        </div>
      )}

      {/* Create Checklist Modal */}
      {showCreateModal && <CreateChecklistModal />}
    </div>
  );
};

export default Checklists;