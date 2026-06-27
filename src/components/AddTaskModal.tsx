import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, Tag, RotateCcw, Plus } from 'lucide-react';
import { Task } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  userPlan: 'free' | 'premium';
  onShowPricing: () => void;
  taskCount: number;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  userPlan,
  onShowPricing,
  taskCount
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance' as const,
    priority: 'medium' as const,
    dueDate: new Date().toISOString().split('T')[0],
    estimatedTime: 30,
    difficulty: 'medium' as const,
    points: 25,
    recurring: {
      enabled: false,
      frequency: 'monthly' as const
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'maintenance', label: 'Maintenance', color: 'bg-blue-100 text-blue-800' },
    { value: 'cleaning', label: 'Cleaning', color: 'bg-purple-100 text-purple-800' },
    { value: 'seasonal', label: 'Seasonal', color: 'bg-orange-100 text-orange-800' },
    { value: 'repair', label: 'Repair', color: 'bg-red-100 text-red-800' },
    { value: 'upgrade', label: 'Upgrade', color: 'bg-green-100 text-green-800' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', points: 15 },
    { value: 'medium', label: 'Medium', points: 25 },
    { value: 'hard', label: 'Hard', points: 40 }
  ];

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'biannually', label: 'Twice a Year' },
    { value: 'annually', label: 'Annually' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-update points based on difficulty
    if (field === 'difficulty') {
      const difficultyData = difficulties.find(d => d.value === value);
      if (difficultyData) {
        setFormData(prev => ({ ...prev, points: difficultyData.points }));
      }
    }
  };

  const handleRecurringChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurring: { ...prev.recurring, [field]: value }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.estimatedTime < 5 || formData.estimatedTime > 480) {
      newErrors.estimatedTime = 'Estimated time must be between 5 and 480 minutes';
    }

    if (formData.points < 1 || formData.points > 100) {
      newErrors.points = 'Points must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check free plan limits
    if (userPlan === 'free' && taskCount >= 10) {
      onShowPricing();
      return;
    }

    if (!validateForm()) {
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate,
      completed: false,
      estimatedTime: formData.estimatedTime,
      difficulty: formData.difficulty,
      points: formData.points,
      recurring: formData.recurring.enabled ? formData.recurring : undefined
    };

    onAddTask(newTask);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'maintenance',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedTime: 30,
      difficulty: 'medium',
      points: 25,
      recurring: {
        enabled: false,
        frequency: 'monthly'
      }
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
              <h3 className="text-xl font-bold text-gray-900">Add New Task</h3>
              <p className="text-gray-600 mt-1">Create a new home maintenance task</p>
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
          {/* Free Plan Limit Warning */}
          {userPlan === 'free' && taskCount >= 8 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {taskCount >= 10 ? 'Task Limit Reached' : `${10 - taskCount} tasks remaining`}
                </span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                {taskCount >= 10 
                  ? 'Upgrade to Premium to add unlimited tasks'
                  : 'Upgrade to Premium for unlimited tasks and advanced features'
                }
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Replace HVAC filter, Clean gutters, Test smoke detectors"
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : ''
                }`}
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed instructions for completing this task..."
                rows={3}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : ''
                }`}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-1" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dueDate ? 'border-red-300' : ''
                }`}
              />
              {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={formData.estimatedTime}
                onChange={(e) => handleInputChange('estimatedTime', parseInt(e.target.value) || 30)}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimatedTime ? 'border-red-300' : ''
                }`}
              />
              {errors.estimatedTime && <p className="text-red-600 text-sm mt-1">{errors.estimatedTime}</p>}
            </div>
          </div>

          {/* Difficulty and Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label} ({difficulty.points} points)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points Reward
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 25)}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.points ? 'border-red-300' : ''
                }`}
              />
              {errors.points && <p className="text-red-600 text-sm mt-1">{errors.points}</p>}
            </div>
          </div>

          {/* Recurring Task Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring.enabled}
                onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <RotateCcw className="h-4 w-4 text-blue-600" />
                <span>Make this a recurring task</span>
              </label>
            </div>

            {formData.recurring.enabled && (
              <div className="ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.recurring.frequency}
                    onChange={(e) => handleRecurringChange('frequency', e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {frequencies.map(frequency => (
                      <option key={frequency.value} value={frequency.value}>
                        {frequency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Recurring Task:</strong> When you complete this task, a new instance will be automatically 
                    scheduled for the next {formData.recurring.frequency} cycle.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Task Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Task Preview</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Title:</span>
                <span className="font-medium text-gray-900">{formData.title || 'Task title'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  categories.find(c => c.value === formData.category)?.color
                }`}>
                  {categories.find(c => c.value === formData.category)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  priorities.find(p => p.value === formData.priority)?.color
                }`}>
                  {priorities.find(p => p.value === formData.priority)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(formData.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estimated Time:</span>
                <span className="font-medium text-gray-900">{formData.estimatedTime} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points:</span>
                <span className="font-medium text-blue-600">{formData.points} points</span>
              </div>
              {formData.recurring.enabled && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recurring:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {formData.recurring.frequency}
                  </span>
                </div>
              )}
            </div>
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
              disabled={userPlan === 'free' && taskCount >= 10}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>
                {userPlan === 'free' && taskCount >= 10 ? 'Upgrade to Add Tasks' : 'Add Task'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;