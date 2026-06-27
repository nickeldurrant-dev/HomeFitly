import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, Clock, CheckCircle, AlertTriangle, Star, RotateCcw, History, Trophy, TrendingUp, Target, Archive, Eye, X, Check } from 'lucide-react';
import { Task, HomeProfile, TaskCompletion } from '../types';
import { TaskScheduler } from '../utils/taskScheduler';
import UpgradePrompt from './UpgradePrompt';
import AddTaskModal from './AddTaskModal';

interface TasksProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddTask: (task: Task) => void;
  userPlan: 'free' | 'premium';
  onShowPricing: () => void;
  homeProfile: HomeProfile;
}

const Tasks: React.FC<TasksProps> = ({ 
  tasks, 
  onUpdateTask, 
  onAddTask, 
  userPlan, 
  onShowPricing,
  homeProfile 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskHistory, setShowTaskHistory] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<string | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    notes: '',
    timeSpent: '',
    difficulty: 'as_expected' as const
  });

  // Filter tasks based on current view
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by archive/completion status
    if (showArchived) {
      filtered = filtered.filter(task => task.archived);
    } else if (showCompleted) {
      filtered = filtered.filter(task => task.completed && !task.archived);
    } else {
      filtered = filtered.filter(task => !task.completed && !task.archived);
    }

    // Apply search and filters
    filtered = filtered.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });

    return filtered;
  }, [tasks, searchTerm, selectedCategory, selectedPriority, showCompleted, showArchived]);

  // Get task statistics
  const taskStats = useMemo(() => TaskScheduler.getTaskStats(tasks), [tasks]);

  const categories = Array.from(new Set(tasks.map(task => task.category)));
  const priorities = ['low', 'medium', 'high', 'urgent'];

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (userPlan === 'free' && taskStats.completedTasks >= 10) {
      onShowPricing();
      return;
    }

    setShowCompletionModal(taskId);
  };

  const handleConfirmCompletion = () => {
    const taskId = showCompletionModal;
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const { completedTask, nextTask } = TaskScheduler.completeTask(task, {
      notes: completionData.notes || undefined,
      timeSpent: completionData.timeSpent ? parseInt(completionData.timeSpent) : undefined,
      difficulty: completionData.difficulty
    });

    // Update the completed task
    onUpdateTask(taskId, completedTask);

    // Add next recurring task if applicable
    if (nextTask) {
      onAddTask(nextTask);
    }

    // Reset modal
    setShowCompletionModal(null);
    setCompletionData({
      notes: '',
      timeSpent: '',
      difficulty: 'as_expected'
    });
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

  const getTaskStatus = (task: Task) => {
    if (task.completed) return 'completed';
    
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff === 0) return 'due-today';
    if (daysDiff <= 3) return 'due-soon';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'border-l-red-500 bg-red-50';
      case 'due-today':
        return 'border-l-orange-500 bg-orange-50';
      case 'due-soon':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'completed':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-white';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''}`;
    if (daysDiff === 0) return 'Due today';
    if (daysDiff === 1) return 'Due tomorrow';
    if (daysDiff <= 7) return `Due in ${daysDiff} days`;
    return taskDate.toLocaleDateString();
  };

  const TaskHistoryModal = ({ taskId }: { taskId: string }) => {
    const history = TaskScheduler.getTaskHistory(tasks, taskId);
    const task = tasks.find(t => t.id === taskId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Task History</h3>
                <p className="text-gray-600 mt-1">{task?.title}</p>
              </div>
              <button
                onClick={() => setShowTaskHistory(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h4>
                <p className="text-gray-500">This task hasn't been completed yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Completion Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total Completions:</span>
                      <span className="ml-2 font-medium">{history.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Average Time:</span>
                      <span className="ml-2 font-medium">
                        {history.filter(h => h.timeSpent).length > 0 
                          ? Math.round(history.reduce((sum, h) => sum + (h.timeSpent || 0), 0) / history.filter(h => h.timeSpent).length)
                          : 'N/A'} min
                      </span>
                    </div>
                  </div>
                </div>

                {history.map((completion, index) => (
                  <div key={completion.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          Completion #{history.length - index}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {new Date(completion.completedAt).toLocaleDateString()} at{' '}
                          {new Date(completion.completedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      {completion.timeSpent && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{completion.timeSpent} min</div>
                          <div className="text-xs text-gray-500">Time spent</div>
                        </div>
                      )}
                    </div>
                    
                    {completion.difficulty && (
                      <div className="mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          completion.difficulty === 'easier' ? 'bg-green-100 text-green-800' :
                          completion.difficulty === 'harder' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {completion.difficulty === 'as_expected' ? 'As Expected' : 
                           completion.difficulty === 'easier' ? 'Easier than Expected' : 
                           'Harder than Expected'}
                        </span>
                      </div>
                    )}
                    
                    {completion.notes && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-sm text-gray-700">{completion.notes}</p>
                      </div>
                    )}
                    
                    {completion.nextDueDate && (
                      <div className="mt-2 text-xs text-blue-600">
                        Next due: {new Date(completion.nextDueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CompletionModal = ({ taskId }: { taskId: string }) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Complete Task</h3>
            <p className="text-gray-600 mt-1">{task.title}</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How long did it take? (optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={completionData.timeSpent}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, timeSpent: e.target.value }))}
                  placeholder={`Estimated: ${task.estimatedTime} min`}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  minutes
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was the difficulty?
              </label>
              <select
                value={completionData.difficulty}
                onChange={(e) => setCompletionData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easier">Easier than expected</option>
                <option value="as_expected">As expected</option>
                <option value="harder">Harder than expected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={completionData.notes}
                onChange={(e) => setCompletionData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any notes about completing this task..."
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {task.recurring?.enabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <RotateCcw className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Recurring Task</span>
                </div>
                <p className="text-sm text-blue-800">
                  This task will be automatically scheduled for your next {task.recurring.frequency} maintenance cycle.
                </p>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowCompletionModal(null)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCompletion}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Complete Task</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upgrade Prompt for Free Users */}
      {userPlan === 'free' && showUpgradePrompt && (
        <UpgradePrompt
          feature="Unlimited Task Management"
          description="Track unlimited tasks, get smart reminders, and access advanced task analytics with detailed completion history."
          onUpgrade={onShowPricing}
          onDismiss={() => setShowUpgradePrompt(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage your home maintenance tasks and track your progress</p>
        </div>
        <button 
          onClick={() => setShowAddTaskModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{taskStats.activeTasks}</div>
              <div className="text-sm text-gray-500">Active Tasks</div>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{taskStats.completedTasks}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{taskStats.totalPointsEarned}</div>
              <div className="text-sm text-gray-500">Points Earned</div>
            </div>
            <Trophy className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{taskStats.totalCompletions}</div>
              <div className="text-sm text-gray-500">Total Completions</div>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setShowCompleted(false);
                setShowArchived(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showCompleted && !showArchived
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Tasks ({taskStats.activeTasks})
            </button>
            <button
              onClick={() => {
                setShowCompleted(true);
                setShowArchived(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showCompleted && !showArchived
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({taskStats.completedTasks})
            </button>
            <button
              onClick={() => {
                setShowCompleted(false);
                setShowArchived(true);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showArchived
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Archive className="h-4 w-4 inline mr-1" />
              History ({taskStats.archivedTasks})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority} className="capitalize">
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const status = getTaskStatus(task);
          const statusColor = getStatusColor(status);
          
          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${statusColor} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {task.recurring?.enabled && (
                        <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <RotateCcw className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {task.recurring.frequency}
                            {task.recurring.completionCount && ` (${task.recurring.completionCount}x)`}
                          </span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{task.estimatedTime} min</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDueDate(task.dueDate)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-blue-600">
                      <Star className="h-4 w-4 mr-1" />
                      <span>{task.points} points</span>
                    </div>
                  </div>

                  {task.completedAt && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Completed on {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {task.notes && (
                        <p className="text-green-700 text-sm mt-2">{task.notes}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {!task.completed && !task.archived && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Complete</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowTaskHistory(task.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <History className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {task.completionHistory?.length ? `History (${task.completionHistory.length})` : 'History'}
                        </span>
                      </button>
                    </div>
                    
                    {task.difficulty && (
                      <span className="text-sm text-gray-500 capitalize">
                        {task.difficulty} difficulty
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {showArchived ? <Archive className="h-8 w-8 text-gray-400" /> :
             showCompleted ? <CheckCircle className="h-8 w-8 text-gray-400" /> :
             <CheckCircle className="h-8 w-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showArchived ? 'No archived tasks' :
             showCompleted ? 'No completed tasks' :
             'No active tasks'}
          </h3>
          <p className="text-gray-500">
            {showArchived ? 'Completed tasks will appear here after archival.' :
             showCompleted ? 'Tasks you complete will appear here.' :
             searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
               ? 'Try adjusting your search criteria.'
               : 'Add your first task to get started.'}
          </p>
        </div>
      )}

      {/* Modals */}
      {showTaskHistory && (
        <TaskHistoryModal taskId={showTaskHistory} />
      )}

      {showCompletionModal && (
        <CompletionModal taskId={showCompletionModal} />
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAddTask={onAddTask}
        userPlan={userPlan}
        onShowPricing={onShowPricing}
        taskCount={tasks.length}
      />
    </div>
  );
};

export default Tasks;