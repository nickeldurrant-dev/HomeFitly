import React from 'react';
import { CheckCircle, Clock, Calendar, Crown, TrendingUp, AlertTriangle, Target, Zap, Home as HomeIcon, Award } from 'lucide-react';
import { Task, Warranty } from '../types';
import { useSubscription } from '../hooks/useSubscription';

interface DashboardProps {
  tasks: Task[];
  warranties: Warranty[];
  familyName: string;
  homeProfile?: any;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, warranties, familyName, homeProfile }) => {
  const { isPremium, subscription } = useSubscription();
  
  // Only count tasks that are actually due this month for the home health score
  const currentMonth = new Date();
  const currentMonthTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const isCurrentMonth = taskDate.getMonth() === currentMonth.getMonth() && 
                          taskDate.getFullYear() === currentMonth.getFullYear();
    
    // For recurring tasks, check if they should be counted this month
    if (task.recurring?.enabled) {
      const { frequency, seasonalMonths } = task.recurring;
      const monthNumber = currentMonth.getMonth() + 1; // 1-12
      
      switch (frequency) {
        case 'monthly':
          return true; // Monthly tasks always count
        case 'quarterly':
          return [1, 4, 7, 10].includes(monthNumber);
        case 'biannually':
          if (seasonalMonths) {
            return seasonalMonths.includes(monthNumber);
          }
          return [4, 10].includes(monthNumber);
        case 'annually':
          if (seasonalMonths) {
            return seasonalMonths.includes(monthNumber);
          }
          return monthNumber === new Date(task.dueDate).getMonth() + 1;
        default:
          return isCurrentMonth;
      }
    }
    
    return isCurrentMonth;
  });
  
  const completedTasks = currentMonthTasks.filter(task => task.completed);
  const pendingTasks = currentMonthTasks.filter(task => !task.completed);
  const urgentTasks = currentMonthTasks.filter(task => !task.completed && task.priority === 'urgent');
  const overdueTasks = currentMonthTasks.filter(task => {
    if (task.completed) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate < today;
  });
  
  const totalPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);
  const maxPossiblePoints = currentMonthTasks.reduce((sum, task) => sum + task.points, 0);
  const homeScore = maxPossiblePoints > 0 ? Math.min(100, Math.round((totalPoints / maxPossiblePoints) * 100)) : 0;
  
  const todaysTasks = currentMonthTasks.filter(task => {
    if (task.completed) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  const upcomingTasks = currentMonthTasks.filter(task => {
    if (task.completed) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= 7;
  });

  const getTimeUntilDue = (dueDate: string) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    const daysDiff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) return 'Due tomorrow';
    if (daysDiff <= 7) return `Due in ${daysDiff} days`;
    if (daysDiff <= 30) return `Due in ${Math.ceil(daysDiff / 7)} weeks`;
    return `Due ${taskDate.toLocaleDateString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            {homeProfile?.homePhoto && (
              <div className="flex-shrink-0">
                <img 
                  src={homeProfile.homePhoto} 
                  alt="Your home" 
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-4 border-white shadow-lg"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Welcome back, {familyName} family!
              </h1>
              <p className="text-lg text-gray-600">Here's your home maintenance overview</p>
              {homeProfile?.address && (
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <HomeIcon className="h-4 w-4 mr-1" />
                  {homeProfile.address}
                </p>
              )}
            </div>
          </div>
          {isPremium && (
            <div className="mt-4 sm:mt-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg">
              <Crown className="h-4 w-4" />
              <span>Premium</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-200" />
          </div>
          <div className="text-3xl font-bold mb-1">{completedTasks.length}</div>
          <div className="text-emerald-100 text-sm font-medium">Tasks Completed</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <Target className="h-5 w-5 text-blue-200" />
          </div>
          <div className="text-3xl font-bold mb-1">{pendingTasks.length}</div>
          <div className="text-blue-100 text-sm font-medium">Pending Tasks</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <Zap className="h-5 w-5 text-amber-200" />
          </div>
          <div className="text-3xl font-bold mb-1">{urgentTasks.length}</div>
          <div className="text-amber-100 text-sm font-medium">Urgent Tasks</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <HomeIcon className="h-5 w-5 text-purple-200" />
          </div>
          <div className="text-3xl font-bold mb-1">{homeScore}</div>
          <div className="text-purple-100 text-sm font-medium">Home Health Score</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span>Today's Focus</span>
              </h2>
              <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                {todaysTasks.length} tasks
              </span>
            </div>
            
            <div className="space-y-4">
          {todaysTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No tasks due today. Great job staying on top of your home maintenance!</p>
              </div>
            ) : (
              todaysTasks.slice(0, 4).map((task, index) => (
                <div key={task.id} className="group bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-lg group-hover:border-blue-500 transition-colors"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{task.title}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-sm text-gray-500">{task.estimatedTime} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {task.points} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>

            {todaysTasks.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={() => window.location.hash = 'tasks'}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>View All Tasks</span>
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span>Coming Up</span>
              </h2>
              <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
                {upcomingTasks.length} tasks
              </span>
            </div>
            
            <div className="space-y-4">
              {upcomingTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="group bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-lg group-hover:border-amber-500 transition-colors"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-amber-900 transition-colors">{task.title}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-sm text-gray-500">{task.estimatedTime} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600 mb-1">{getTimeUntilDue(task.dueDate)}</div>
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {task.points} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingTasks.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-gray-100 to-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No upcoming tasks this week</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Home Health & Quick Actions */}
        <div className="space-y-8">
          {/* Home Health Score */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Home Health Score</h3>
              
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#healthGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(homeScore / 100) * 440} 440`}
                    className="transition-all duration-2000 ease-out"
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{homeScore}</span>
                  <span className="text-sm text-gray-600 font-medium">Health Score</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="font-semibold text-emerald-700">{completedTasks.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Points</span>
                  <span className="font-semibold text-blue-700">{totalPoints}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.hash = 'tasks'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Calendar className="h-5 w-5" />
                <span>View All Tasks</span>
              </button>
              
              <button 
                onClick={() => window.location.hash = 'checklists'}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Checklists</span>
              </button>
              
              <button 
                onClick={() => window.location.hash = 'warranties'}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Crown className="h-5 w-5" />
                <span>Warranties</span>
              </button>
            </div>
          </div>
          
          {/* Alerts & Notifications */}
          {(urgentTasks.length > 0 || overdueTasks.length > 0) && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-2 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-red-900">Attention Needed</h3>
              </div>
              
              <div className="space-y-3">
                {urgentTasks.length > 0 && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-sm font-semibold text-red-800">{urgentTasks.length} Urgent Tasks</div>
                    <div className="text-xs text-red-600">Require immediate attention</div>
                  </div>
                )}
                {overdueTasks.length > 0 && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-sm font-semibold text-red-800">{overdueTasks.length} Overdue Tasks</div>
                    <div className="text-xs text-red-600">Past due date</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;