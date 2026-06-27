import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, Tag, RotateCcw, Plus, Crown, Zap, Home } from 'lucide-react';
import { Task } from '../hooks/useTasks';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  onSave: (taskData: any) => Promise<void>;
  isPremium: boolean;
  taskCount: number;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onClose,
  onSave,
  isPremium,
  taskCount
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance' as const,
    priority: 'medium' as const,
    due_date: new Date().toISOString().split('T')[0],
    estimated_time: 30,
    difficulty: 'medium' as const,
    points: 25,
    appliance_id: '',
    recurring_config: {
      enabled: false,
      frequency: 'monthly' as const,
      seasonal_months: [] as number[]
    },
    home_specific_config: {
      home_types: [] as string[],
      features: [] as string[],
      climate_zones: [] as string[]
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        due_date: task.due_date,
        estimated_time: task.estimated_time,
        difficulty: task.difficulty,
        points: task.points,
        appliance_id: task.appliance_id || '',
        recurring_config: task.recurring_config || {
          enabled: false,
          frequency: 'monthly',
          seasonal_months: []
        },
        home_specific_config: task.home_specific_config || {
          home_types: [],
          features: [],
          climate_zones: []
        }
      });
    }
  }, [task]);

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

  const homeTypes = [
    'single-family',
    'townhouse',
    'condo',
    'apartment'
  ];

  const homeFeatures = [
    'Central Air', 'Hardwood Floors', 'Granite Countertops', 'Stainless Steel Appliances',
    'Two-Car Garage', 'Deck', 'Patio', 'Fireplace', 'Pool', 'Hot Tub',
    'Security System', 'Smart Home Features', 'Solar Panels', 'Basement',
    'Attic', 'Laundry Room', 'Walk-in Closet', 'Garden', 'Sprinkler System'
  ];

  const climateZones = [
    'northern',
    'southern',
    'humid',
    'dry',
    'coastal',
    'mountain'
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
      recurring_config: { ...prev.recurring_config, [field]: value }
    }));
  };

  const handleHomeSpecificChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      home_specific_config: { ...prev.home_specific_config, [field]: value }
    }));
  };

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    if (formData.estimated_time < 5 || formData.estimated_time > 480) {
      newErrors.estimated_time = 'Estimated time must be between 5 and 480 minutes';
    }

    if (formData.points < 1 || formData.points > 100) {
      newErrors.points = 'Points must be between 1 and 100';
    }

    // Check premium feature restrictions
    if (!isPremium) {
      if (formData.recurring_config.enabled) {
        newErrors.recurring = 'Recurring tasks are a Premium feature';
      }
      if (formData.appliance_id) {
        newErrors.appliance = 'Appliance-linked tasks are a Premium feature';
      }
      if (!task && taskCount >= 10) {
        newErrors.limit = 'Free plan limited to 10 active tasks';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        ...formData,
        recurring_config: formData.recurring_config.enabled ? formData.recurring_config : null,
        appliance_id: formData.appliance_id || null,
        home_specific_config: Object.values(formData.home_specific_config).some(arr => arr.length > 0) 
          ? formData.home_specific_config 
          : null
      };

      if (task) {
        await onSave(task.id, taskData);
      } else {
        await onSave(taskData);
      }
      
      onClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save task' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {task ? 'Edit Task' : 'Add New Task'}
              </h3>
              <p className="text-gray-600 mt-1">
                {task ? 'Update task details' : 'Create a new home maintenance task'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              {Object.entries(errors).map(([field, message]) => (
                <p key={field} className="text-red-800 text-sm">{message}</p>
              ))}
            </div>
          )}

          {/* Free Plan Limit Warning */}
          {!isPremium && !task && taskCount >= 8 && (
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed instructions for completing this task..."
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
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
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.due_date ? 'border-red-300' : ''
                }`}
              />
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
                value={formData.estimated_time}
                onChange={(e) => handleInputChange('estimated_time', parseInt(e.target.value) || 30)}
                className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimated_time ? 'border-red-300' : ''
                }`}
              />
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
            </div>
          </div>

          {/* Premium Features */}
          <div className="space-y-6">
            {/* Recurring Task Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring_config.enabled}
                  onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                  disabled={!isPremium}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor="recurring" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <RotateCcw className="h-4 w-4 text-blue-600" />
                  <span>Make this a recurring task</span>
                  {!isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                </label>
              </div>

              {!isPremium && (
                <div className="ml-7 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    <Crown className="h-4 w-4 inline mr-1" />
                    Recurring tasks are a Premium feature. Upgrade to automatically schedule recurring maintenance.
                  </p>
                </div>
              )}

              {formData.recurring_config.enabled && isPremium && (
                <div className="ml-7 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.recurring_config.frequency}
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

                  {(formData.recurring_config.frequency === 'biannually' || formData.recurring_config.frequency === 'annually') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seasonal Months (optional)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
                          { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
                          { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
                          { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
                        ].map(month => (
                          <button
                            key={month.value}
                            type="button"
                            onClick={() => {
                              const newMonths = toggleArrayValue(formData.recurring_config.seasonal_months, month.value);
                              handleRecurringChange('seasonal_months', newMonths);
                            }}
                            className={`p-2 text-xs rounded border ${
                              formData.recurring_config.seasonal_months.includes(month.value)
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {month.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Recurring Task:</strong> When you complete this task, a new instance will be automatically 
                      scheduled for the next {formData.recurring_config.frequency} cycle.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Appliance Linking */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Link to Appliance (optional)
                  {!isPremium && <Crown className="h-4 w-4 inline ml-1 text-yellow-500" />}
                </label>
                <input
                  type="text"
                  value={formData.appliance_id}
                  onChange={(e) => handleInputChange('appliance_id', e.target.value)}
                  placeholder="Appliance ID or name"
                  disabled={!isPremium}
                  className={`w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                    errors.appliance ? 'border-red-300' : ''
                  }`}
                />
                {!isPremium && (
                  <p className="text-yellow-700 text-sm mt-1">
                    <Crown className="h-3 w-3 inline mr-1" />
                    Appliance linking is a Premium feature for tracking appliance-specific maintenance.
                  </p>
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Advanced Home-Specific Settings</span>
                <span className="text-xs text-gray-500">(optional)</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applicable Home Types
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {homeTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            const newTypes = toggleArrayValue(formData.home_specific_config.home_types, type);
                            handleHomeSpecificChange('home_types', newTypes);
                          }}
                          className={`p-2 text-sm rounded border ${
                            formData.home_specific_config.home_types.includes(type)
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {type.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Home Features
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {homeFeatures.map(feature => (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => {
                            const newFeatures = toggleArrayValue(formData.home_specific_config.features, feature);
                            handleHomeSpecificChange('features', newFeatures);
                          }}
                          className={`p-2 text-sm rounded border text-left ${
                            formData.home_specific_config.features.includes(feature)
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Climate Zones
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {climateZones.map(zone => (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => {
                            const newZones = toggleArrayValue(formData.home_specific_config.climate_zones, zone);
                            handleHomeSpecificChange('climate_zones', newZones);
                          }}
                          className={`p-2 text-sm rounded border ${
                            formData.home_specific_config.climate_zones.includes(zone)
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {zone}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                  {new Date(formData.due_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estimated Time:</span>
                <span className="font-medium text-gray-900">{formData.estimated_time} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points:</span>
                <span className="font-medium text-blue-600">{formData.points} points</span>
              </div>
              {formData.recurring_config.enabled && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recurring:</span>
                  <span className="font-medium text-green-600 capitalize flex items-center space-x-1">
                    <span>{formData.recurring_config.frequency}</span>
                    {!isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                  </span>
                </div>
              )}
              {formData.appliance_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Appliance:</span>
                  <span className="font-medium text-purple-600 flex items-center space-x-1">
                    <span>{formData.appliance_id}</span>
                    {!isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isPremium && !task && taskCount >= 10}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>
                {!isPremium && !task && taskCount >= 10 ? 'Upgrade to Add Tasks' : 
                 task ? 'Update Task' : 'Add Task'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;