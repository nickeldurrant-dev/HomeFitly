import React from 'react';
import { Lightbulb, Check, X, Crown, Home, Calendar, Zap } from 'lucide-react';
import { TaskSuggestion } from '../hooks/useTasks';

interface TaskSuggestionsProps {
  suggestions: TaskSuggestion[];
  onAccept: (suggestionId: string) => Promise<void>;
  onDismiss: (suggestionId: string) => Promise<void>;
  isPremium: boolean;
}

const TaskSuggestions: React.FC<TaskSuggestionsProps> = ({
  suggestions,
  onAccept,
  onDismiss,
  isPremium
}) => {
  if (suggestions.length === 0) return null;

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('home age') || reason.includes('feature')) return <Home className="h-4 w-4" />;
    if (reason.includes('seasonal') || reason.includes('weather')) return <Calendar className="h-4 w-4" />;
    if (reason.includes('appliance') || reason.includes('equipment')) return <Zap className="h-4 w-4" />;
    return <Lightbulb className="h-4 w-4" />;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Lightbulb className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Task Suggestions</h3>
          <p className="text-gray-600 text-sm">
            Based on your home profile and maintenance history, we recommend these tasks
          </p>
        </div>
        {!isPremium && (
          <div className="ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Crown className="h-4 w-4" />
            <span>Enhanced with Premium</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {suggestions.slice(0, isPremium ? suggestions.length : 2).map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-blue-600">
                    {getReasonIcon(suggestion.reason)}
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {suggestion.suggested_task.title}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority_score)}`}>
                    {suggestion.priority_score >= 80 ? 'High Priority' :
                     suggestion.priority_score >= 60 ? 'Medium Priority' :
                     suggestion.priority_score >= 40 ? 'Low Priority' : 'Optional'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{suggestion.suggested_task.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>Category: {suggestion.suggested_task.category}</span>
                  <span>Est. Time: {suggestion.suggested_task.estimated_time} min</span>
                  <span>Points: {suggestion.suggested_task.points}</span>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Why we suggest this:</strong> {suggestion.reason}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onDismiss(suggestion.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Dismiss suggestion"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onAccept(suggestion.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isPremium && suggestions.length > 2 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-900">
                  {suggestions.length - 2} More Suggestions Available
                </h4>
                <p className="text-yellow-800 text-sm mt-1">
                  Upgrade to Premium to see all personalized task suggestions based on your home's unique characteristics.
                </p>
                <button className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSuggestions;