import React, { useState } from 'react';
import { CheckSquare, Clock, Calendar, ArrowLeft, ArrowRight, Sparkles, Plus, RotateCcw, AlertTriangle, Home, History, Check } from 'lucide-react';
import { Task, HomeProfile } from '../../types';

interface TaskRecommendationsProps {
  tasks: Task[];
  selectedTasks: Set<string>;
  taskHistory: Record<string, { completed: boolean; lastCompleted?: string }>;
  setTaskHistory: React.Dispatch<React.SetStateAction<Record<string, { completed: boolean; lastCompleted?: string }>>>;
  onTaskToggle: (taskId: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  homeProfile: Partial<HomeProfile>;
}

const generateTaskRecommendations = (profile: Partial<HomeProfile>): Task[] => {
  const tasks: Task[] = [];
  const currentYear = new Date().getFullYear();
  const homeAge = profile.yearBuilt ? currentYear - profile.yearBuilt : 0;
  
  // Base maintenance tasks for all homes
  const baseTasks = [
    {
      title: 'Test Smoke Detectors',
      description: 'Test all smoke detectors and replace batteries if needed',
      category: 'maintenance' as const,
      priority: 'high' as const,
      estimatedTime: 20,
      difficulty: 'easy' as const,
      points: 30,
      recurring: {
        enabled: true,
        frequency: 'monthly' as const
      }
    },
    {
      title: 'Check HVAC Filter',
      description: 'Inspect and replace HVAC filter if dirty',
      category: 'maintenance' as const,
      priority: 'high' as const,
      estimatedTime: 15,
      difficulty: 'easy' as const,
      points: 25,
      recurring: {
        enabled: true,
        frequency: homeAge > 10 ? 'monthly' as const : 'quarterly' as const
      }
    },
    {
      title: 'Clean Dryer Vent',
      description: 'Remove lint buildup from dryer vent to prevent fire hazard',
      category: 'maintenance' as const,
      priority: 'medium' as const,
      estimatedTime: 45,
      difficulty: 'medium' as const,
      points: 40,
      recurring: {
        enabled: true,
        frequency: 'annually' as const
      }
    }
  ];

  // Add base tasks
  baseTasks.forEach((taskTemplate, index) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (index + 1) * 7); // Spread tasks over weeks
    
    tasks.push({
      id: `onboarding-${Date.now()}-${index}`,
      ...taskTemplate,
      dueDate: dueDate.toISOString().split('T')[0],
      completed: false
    });
  });

  // Home type specific tasks
  if (profile.homeType === 'single-family' || profile.homeType === 'townhouse') {
    const gutterTask = {
      id: `onboarding-gutters-${Date.now()}`,
      title: 'Clean Gutters',
      description: 'Remove debris and check for damage',
      category: 'seasonal' as const,
      priority: 'medium' as const,
      dueDate: getNextSeasonalDate([4, 10]), // April and October
      completed: false,
      estimatedTime: 90,
      difficulty: 'medium' as const,
      points: 50,
      recurring: {
        enabled: true,
        frequency: 'biannually' as const,
        seasonalMonths: [4, 10]
      }
    };
    tasks.push(gutterTask);
  }

  // Feature-based tasks
  if (profile.features?.includes('Central Air')) {
    const hvacServiceTask = {
      id: `onboarding-hvac-service-${Date.now()}`,
      title: 'Schedule HVAC Service',
      description: 'Professional HVAC maintenance and tune-up',
      category: 'maintenance' as const,
      priority: 'medium' as const,
      dueDate: getNextSeasonalDate([3, 9]), // March and September
      completed: false,
      estimatedTime: 15, // Time to schedule
      difficulty: 'easy' as const,
      points: 60,
      recurring: {
        enabled: true,
        frequency: 'biannually' as const,
        seasonalMonths: [3, 9]
      }
    };
    tasks.push(hvacServiceTask);
  }

  if (profile.features?.includes('Hardwood Floors')) {
    const floorCareTask = {
      id: `onboarding-floor-care-${Date.now()}`,
      title: 'Deep Clean Hardwood Floors',
      description: 'Professional cleaning and conditioning of hardwood floors',
      category: 'cleaning' as const,
      priority: 'low' as const,
      dueDate: getNextSeasonalDate([6]), // June
      completed: false,
      estimatedTime: 180,
      difficulty: 'medium' as const,
      points: 45,
      recurring: {
        enabled: true,
        frequency: 'annually' as const
      }
    };
    tasks.push(floorCareTask);
  }

  if (profile.features?.includes('Deck') || profile.features?.includes('Patio')) {
    const deckTask = {
      id: `onboarding-deck-${Date.now()}`,
      title: 'Clean and Seal Deck',
      description: 'Power wash and apply protective sealant to deck',
      category: 'seasonal' as const,
      priority: 'medium' as const,
      dueDate: getNextSeasonalDate([5]), // May
      completed: false,
      estimatedTime: 240,
      difficulty: 'medium' as const,
      points: 70,
      recurring: {
        enabled: true,
        frequency: 'annually' as const
      }
    };
    tasks.push(deckTask);
  }
  
  // Pool maintenance tasks
  if (profile.features?.includes('Pool')) {
    const poolTask = {
      id: `onboarding-pool-${Date.now()}`,
      title: 'Pool Chemical Balance Check',
      description: 'Test and balance pool chemicals, clean skimmer baskets, and check equipment',
      category: 'maintenance' as const,
      priority: 'medium' as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 45,
      difficulty: 'easy' as const,
      points: 30,
      recurring: {
        enabled: true,
        frequency: 'weekly' as const
      }
    };
    tasks.push(poolTask);
  }
  
  // Hot tub maintenance
  if (profile.features?.includes('Hot Tub')) {
    const hotTubTask = {
      id: `onboarding-hottub-${Date.now()}`,
      title: 'Hot Tub Maintenance',
      description: 'Check and balance hot tub chemicals, clean filters, and test temperature',
      category: 'maintenance' as const,
      priority: 'medium' as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 30,
      difficulty: 'easy' as const,
      points: 25,
      recurring: {
        enabled: true,
        frequency: 'weekly' as const
      }
    };
    tasks.push(hotTubTask);
  }
  
  // Fireplace maintenance
  if (profile.features?.includes('Fireplace')) {
    const fireplaceTask = {
      id: `onboarding-fireplace-${Date.now()}`,
      title: 'Fireplace Inspection and Cleaning',
      description: 'Inspect fireplace, clean chimney, and check for proper ventilation',
      category: 'seasonal' as const,
      priority: 'high' as const,
      dueDate: new Date(new Date().getFullYear(), 8, 15).toISOString().split('T')[0], // September 15
      completed: false,
      estimatedTime: 30,
      difficulty: 'medium' as const,
      points: 60,
      recurring: {
        enabled: true,
        frequency: 'annually' as const,
        seasonalMonths: [9]
      }
    };
    tasks.push(fireplaceTask);
  }
  
  // Garage maintenance
  if (profile.features?.includes('Two-Car Garage') || profile.features?.includes('One-Car Garage')) {
    const garageTask = {
      id: `onboarding-garage-${Date.now()}`,
      title: 'Garage Door Safety Check',
      description: 'Test garage door auto-reverse, lubricate tracks, and check remote batteries',
      category: 'maintenance' as const,
      priority: 'medium' as const,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 45,
      difficulty: 'easy' as const,
      points: 40,
      recurring: {
        enabled: true,
        frequency: 'biannually' as const
      }
    };
    tasks.push(garageTask);
  }
  
  // Security system maintenance
  if (profile.features?.includes('Security System')) {
    const securityTask = {
      id: `onboarding-security-${Date.now()}`,
      title: 'Test Security System',
      description: 'Test all sensors, cameras, and alarm functions',
      category: 'maintenance' as const,
      priority: 'high' as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 60,
      difficulty: 'easy' as const,
      points: 50,
      recurring: {
        enabled: true,
        frequency: 'monthly' as const
      }
    };
    tasks.push(securityTask);
  }
  
  // Solar panel maintenance
  if (profile.features?.includes('Solar Panels')) {
    const solarTask = {
      id: `onboarding-solar-${Date.now()}`,
      title: 'Solar Panel Inspection',
      description: 'Check solar panels for debris, damage, and optimal performance',
      category: 'maintenance' as const,
      priority: 'medium' as const,
      dueDate: new Date(new Date().getFullYear(), 2, 1).toISOString().split('T')[0], // March 1
      completed: false,
      estimatedTime: 90,
      difficulty: 'medium' as const,
      points: 55,
      recurring: {
        enabled: true,
        frequency: 'biannually' as const
      }
    };
    tasks.push(solarTask);
  }
  
  // Sprinkler system maintenance
  if (profile.features?.includes('Sprinkler System')) {
    const sprinklerTask = {
      id: `onboarding-sprinkler-${Date.now()}`,
      title: 'Sprinkler System Check',
      description: 'Test all zones, check for leaks, and adjust spray patterns',
      category: 'seasonal' as const,
      priority: 'medium' as const,
      dueDate: new Date(new Date().getFullYear(), 3, 15).toISOString().split('T')[0], // April 15
      completed: false,
      estimatedTime: 75,
      difficulty: 'medium' as const,
      points: 45,
      recurring: {
        enabled: true,
        frequency: 'biannually' as const,
        seasonalMonths: [4, 9]
      }
    };
    tasks.push(sprinklerTask);
  }
  
  // Smart home features maintenance
  if (profile.features?.includes('Smart Home Features')) {
    const smartHomeTask = {
      id: `onboarding-smarthome-${Date.now()}`,
      title: 'Smart Home System Update',
      description: 'Update smart home devices, check connectivity, and test automation',
      category: 'maintenance' as const,
      priority: 'low' as const,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 90,
      difficulty: 'medium' as const,
      points: 35,
      recurring: {
        enabled: true,
        frequency: 'quarterly' as const
      }
    };
    tasks.push(smartHomeTask);
  }
  
  // Garden maintenance
  if (profile.features?.includes('Garden')) {
    const gardenTask = {
      id: `onboarding-garden-${Date.now()}`,
      title: 'Garden Seasonal Care',
      description: 'Prune plants, fertilize soil, and prepare garden for season',
      category: 'seasonal' as const,
      priority: 'medium' as const,
      dueDate: new Date(new Date().getFullYear(), 2, 1).toISOString().split('T')[0], // March 1
      completed: false,
      estimatedTime: 120,
      difficulty: 'medium' as const,
      points: 50,
      recurring: {
        enabled: true,
        frequency: 'quarterly' as const,
        seasonalMonths: [3, 6, 9, 12]
      }
    };
    tasks.push(gardenTask);
  }
  
  // Basement maintenance
  if (profile.features?.includes('Basement')) {
    const basementTask = {
      id: `onboarding-basement-${Date.now()}`,
      title: 'Basement Moisture Check',
      description: 'Check for moisture, mold, and proper ventilation in basement',
      category: 'maintenance' as const,
      priority: 'medium' as const,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 60,
      difficulty: 'easy' as const,
      points: 40,
      recurring: {
        enabled: true,
        frequency: 'biannually' as const
      }
    };
    tasks.push(basementTask);
  }

  return tasks;
};

const TaskRecommendations: React.FC<TaskRecommendationsProps> = ({
  tasks,
  selectedTasks,
  taskHistory,
  setTaskHistory,
  onTaskToggle,
  onConfirm,
  onBack,
  homeProfile
}) => {
  const [showCustomTask, setShowCustomTask] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState<string | null>(null);
  const [customTask, setCustomTask] = useState({
    title: '',
    description: '',
    category: 'maintenance' as const,
    priority: 'medium' as const,
    frequency: 'annually' as const
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'cleaning':
        return 'bg-purple-100 text-purple-800';
      case 'seasonal':
        return 'bg-orange-100 text-orange-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyText = (task: Task) => {
    if (!task.recurring?.enabled) return 'One-time';
    
    const { frequency, seasonalMonths } = task.recurring;
    
    if (frequency === 'biannually' && seasonalMonths) {
      const months = seasonalMonths.map(m => 
        new Date(2000, m - 1).toLocaleDateString('en', { month: 'short' })
      );
      return `${months.join(' & ')}`;
    }
    
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const handleTaskHistoryUpdate = (taskId: string, completed: boolean, lastCompleted?: string) => {
    setTaskHistory(prev => ({
      ...prev,
      [taskId]: { completed, lastCompleted }
    }));
    setShowTaskHistory(null);
  };

  const getNextDueDate = (task: Task, lastCompleted: string): string => {
    if (!task.recurring?.enabled) return task.dueDate;
    
    const lastDate = new Date(lastCompleted);
    const nextDate = new Date(lastDate);
    
    switch (task.recurring.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'biannually':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  const getHomeAge = () => {
    if (!homeProfile.yearBuilt) return 0;
    return new Date().getFullYear() - homeProfile.yearBuilt;
  };

  const addCustomTask = () => {
    // In a real implementation, this would add the custom task to the list
    console.log('Adding custom task:', customTask);
    setShowCustomTask(false);
    setCustomTask({
      title: '',
      description: '',
      category: 'maintenance',
      priority: 'medium',
      frequency: 'annually'
    });
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Personalized Maintenance Plan</h2>
        <p className="text-gray-600">
          Based on your home's characteristics, we've created a custom maintenance schedule. 
          Select the tasks you'd like to track.
        </p>
      </div>

      {/* Home Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-3">
          <Home className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Your Home Profile</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Built:</span>
            <span className="ml-2 font-medium text-gray-900">{homeProfile.yearBuilt} ({getHomeAge()} years old)</span>
          </div>
          <div>
            <span className="text-gray-600">Size:</span>
            <span className="ml-2 font-medium text-gray-900">{homeProfile.squareFootage?.toLocaleString()} sq ft</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium text-gray-900 capitalize">{homeProfile.homeType?.replace('-', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-600">Features:</span>
            <span className="ml-2 font-medium text-gray-900">{homeProfile.features?.length || 0} selected</span>
          </div>
        </div>
      </div>

      {/* Task Selection */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recommended Tasks</h3>
            <p className="text-gray-600 text-sm">
              {selectedTasks.size} of {tasks.length} tasks selected
            </p>
          </div>
          <button
            onClick={() => setShowCustomTask(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add Custom Task</span>
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => {
            const isSelected = selectedTasks.has(task.id);
            
            return (
              <div
                key={task.id}
                className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => onTaskToggle(task.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <CheckSquare className="h-4 w-4 text-white" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getPriorityIcon(task.priority)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTaskHistory(task.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Set completion history"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    {/* Task History Status */}
                    {taskHistory[task.id]?.completed && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 font-medium">
                            Last completed: {taskHistory[task.id].lastCompleted && new Date(taskHistory[task.id].lastCompleted!).toLocaleDateString()}
                          </span>
                        </div>
                        {task.recurring?.enabled && taskHistory[task.id].lastCompleted && (
                          <div className="mt-1 text-xs text-green-700">
                            Next recommended: {new Date(getNextDueDate(task, taskHistory[task.id].lastCompleted!)).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{task.estimatedTime} min</span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                      
                      {task.recurring?.enabled && (
                        <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <RotateCcw className="h-3 w-3" />
                          <span className="text-xs font-medium">{getFrequencyText(task)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Task Modal */}
      {showCustomTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add Custom Task</h3>
              <p className="text-gray-600 mt-1">Create a personalized maintenance task</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                <input
                  type="text"
                  value={customTask.title}
                  onChange={(e) => setCustomTask({ ...customTask, title: e.target.value })}
                  placeholder="e.g., Clean pool filter"
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={customTask.description}
                  onChange={(e) => setCustomTask({ ...customTask, description: e.target.value })}
                  placeholder="Describe what needs to be done..."
                  rows={3}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={customTask.category}
                    onChange={(e) => setCustomTask({ ...customTask, category: e.target.value as any })}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="repair">Repair</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={customTask.priority}
                    onChange={(e) => setCustomTask({ ...customTask, priority: e.target.value as any })}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={customTask.frequency}
                  onChange={(e) => setCustomTask({ ...customTask, frequency: e.target.value as any })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="biannually">Twice a Year</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomTask(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCustomTask}
                disabled={!customTask.title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task History Modal */}
      {showTaskHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {(() => {
              const task = tasks.find(t => t.id === showTaskHistory);
              if (!task) return null;
              
              return (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Task History</h3>
                    <p className="text-gray-600 mt-1">{task.title}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <p className="text-gray-700 text-sm">
                      Have you completed this task recently? This helps us create a more accurate maintenance schedule.
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => handleTaskHistoryUpdate(task.id, false)}
                        className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="font-medium text-gray-900">Never completed</div>
                        <div className="text-sm text-gray-600">This will be my first time doing this task</div>
                      </button>
                      
                      <div className="border-2 border-gray-200 rounded-lg p-4">
                        <div className="font-medium text-gray-900 mb-3">I've done this before</div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              When did you last complete this task?
                            </label>
                            <input
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleTaskHistoryUpdate(task.id, true, e.target.value);
                                }
                              }}
                            />
                          </div>
                          
                          {task.recurring?.enabled && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Recurring task:</strong> We'll calculate your next due date based on the {task.recurring.frequency} schedule.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => setShowTaskHistory(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="font-semibold text-green-900 mb-2">🎉 Your Maintenance Plan is Ready!</h4>
          <p className="text-green-800 text-sm mb-3">
            You've selected {selectedTasks.size} tasks that will help keep your home in excellent condition.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <span className="text-gray-600">Monthly Tasks:</span>
              <span className="ml-2 font-medium text-gray-900">
                {tasks.filter(t => selectedTasks.has(t.id) && t.recurring?.frequency === 'monthly').length}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="text-gray-600">Seasonal Tasks:</span>
              <span className="ml-2 font-medium text-gray-900">
                {tasks.filter(t => selectedTasks.has(t.id) && (t.recurring?.frequency === 'quarterly' || t.recurring?.frequency === 'biannually')).length}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="text-gray-600">Annual Tasks:</span>
              <span className="ml-2 font-medium text-gray-900">
                {tasks.filter(t => selectedTasks.has(t.id) && t.recurring?.frequency === 'annually').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onConfirm}
          disabled={selectedTasks.size === 0}
          className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Complete Setup ({selectedTasks.size} tasks)</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskRecommendations;