import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSubscription } from './useSubscription';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'maintenance' | 'cleaning' | 'seasonal' | 'repair' | 'upgrade';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  completed: boolean;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  archived: boolean;
  parent_task_id?: string;
  estimated_time: number;
  actual_time?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  appliance_id?: string;
  recurring_config?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
    interval?: number;
    next_due_date?: string;
    last_completed?: string;
    completion_count?: number;
    seasonal_months?: number[];
  };
  home_specific_config?: {
    home_age?: number;
    home_types?: string[];
    features?: string[];
    climate_zones?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: string;
  time_spent?: number;
  difficulty_rating?: 'easier' | 'as_expected' | 'harder';
  notes?: string;
  next_due_date?: string;
  created_at: string;
}

export interface TaskSuggestion {
  id: string;
  user_id: string;
  suggested_task: Partial<Task>;
  reason: string;
  priority_score: number;
  accepted: boolean;
  dismissed: boolean;
  created_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isPremium } = useSubscription();

  // Fetch all tasks for the current user
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch task completions for history
  const fetchCompletions = async () => {
    if (!isPremium) return; // Premium feature

    try {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletions(data || []);
    } catch (err) {
      console.error('Failed to fetch task completions:', err);
    }
  };

  // Fetch task suggestions
  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_suggestions')
        .select('*')
        .eq('dismissed', false)
        .eq('accepted', false)
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (err) {
      console.error('Failed to fetch task suggestions:', err);
    }
  };

  // Create a new task
  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Check free plan limits
      if (!isPremium) {
        const activeTasks = tasks.filter(t => !t.completed && !t.archived);
        if (activeTasks.length >= 10) {
          throw new Error('Free plan limited to 10 active tasks. Upgrade to Premium for unlimited tasks.');
        }

        // Block premium features for free users
        if (taskData.recurring_config?.enabled) {
          throw new Error('Recurring tasks are a Premium feature. Upgrade to access this functionality.');
        }

        if (taskData.appliance_id) {
          throw new Error('Appliance-linked tasks are a Premium feature. Upgrade to access this functionality.');
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [...prev, data]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update a task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Check premium features
      if (!isPremium) {
        if (updates.recurring_config?.enabled) {
          throw new Error('Recurring tasks are a Premium feature.');
        }
        if (updates.appliance_id) {
          throw new Error('Appliance-linked tasks are a Premium feature.');
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Complete a task
  const completeTask = async (
    taskId: string, 
    completionData: {
      time_spent?: number;
      difficulty_rating?: 'easier' | 'as_expected' | 'harder';
      notes?: string;
    } = {}
  ) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const completedAt = new Date().toISOString();
      
      // Update task as completed
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          completed: true,
          completed_at: completedAt,
          actual_time: completionData.time_spent,
          notes: completionData.notes
        })
        .eq('id', taskId);

      if (taskError) throw taskError;

      // Create completion record (Premium feature for history)
      if (isPremium) {
        const { error: completionError } = await supabase
          .from('task_completions')
          .insert([{
            task_id: taskId,
            completed_at: completedAt,
            time_spent: completionData.time_spent,
            difficulty_rating: completionData.difficulty_rating,
            notes: completionData.notes
          }]);

        if (completionError) console.error('Failed to create completion record:', completionError);
      }

      // Handle recurring tasks (Premium feature)
      if (isPremium && task.recurring_config?.enabled) {
        const nextDueDate = calculateNextDueDate(task, new Date(completedAt));
        
        // Create next occurrence
        const nextTask = {
          ...task,
          id: undefined,
          user_id: undefined,
          due_date: nextDueDate,
          completed: false,
          completed_at: undefined,
          completed_by: undefined,
          notes: undefined,
          actual_time: undefined,
          parent_task_id: task.parent_task_id || task.id,
          recurring_config: {
            ...task.recurring_config,
            last_completed: completedAt.split('T')[0],
            next_due_date: nextDueDate,
            completion_count: (task.recurring_config.completion_count || 0) + 1
          },
          created_at: undefined,
          updated_at: undefined
        };

        await createTask(nextTask);

        // Update completion record with next due date
        if (isPremium) {
          await supabase
            .from('task_completions')
            .update({ next_due_date: nextDueDate })
            .eq('task_id', taskId)
            .eq('completed_at', completedAt);
        }
      }

      await fetchTasks();
      if (isPremium) await fetchCompletions();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Accept a task suggestion
  const acceptSuggestion = async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) throw new Error('Suggestion not found');

      // Create task from suggestion
      await createTask(suggestion.suggested_task as Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>);

      // Mark suggestion as accepted
      await supabase
        .from('task_suggestions')
        .update({ accepted: true })
        .eq('id', suggestionId);

      await fetchSuggestions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept suggestion';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Dismiss a task suggestion
  const dismissSuggestion = async (suggestionId: string) => {
    try {
      await supabase
        .from('task_suggestions')
        .update({ dismissed: true })
        .eq('id', suggestionId);

      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (err) {
      console.error('Failed to dismiss suggestion:', err);
    }
  };

  // Calculate next due date for recurring tasks
  const calculateNextDueDate = (task: Task, completionDate: Date): string => {
    if (!task.recurring_config?.enabled) return task.due_date;

    const { frequency, seasonal_months } = task.recurring_config;
    const nextDate = new Date(completionDate);

    switch (frequency) {
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
        if (seasonal_months && seasonal_months.length === 2) {
          const currentMonth = nextDate.getMonth() + 1;
          const nextSeasonalMonth = seasonal_months.find(month => month > currentMonth) || seasonal_months[0];
          
          if (nextSeasonalMonth > currentMonth) {
            nextDate.setMonth(nextSeasonalMonth - 1);
          } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            nextDate.setMonth(nextSeasonalMonth - 1);
          }
        } else {
          nextDate.setMonth(nextDate.getMonth() + 6);
        }
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate.toISOString().split('T')[0];
  };

  // Get task statistics
  const getTaskStats = () => {
    const activeTasks = tasks.filter(t => !t.completed && !t.archived);
    const completedTasks = tasks.filter(t => t.completed);
    const overdueTasks = activeTasks.filter(t => new Date(t.due_date) < new Date());
    const todayTasks = activeTasks.filter(t => t.due_date === new Date().toISOString().split('T')[0]);
    const totalPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);

    return {
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      todayTasks: todayTasks.length,
      totalPoints,
      totalCompletions: completions.length
    };
  };

  // Get task history for a specific task (Premium feature)
  const getTaskHistory = (taskId: string): TaskCompletion[] => {
    if (!isPremium) return [];
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];

    // Get completions for this task and its recurring instances
    return completions.filter(completion => {
      const completionTask = tasks.find(t => t.id === completion.task_id);
      return completion.task_id === taskId || 
             completionTask?.parent_task_id === taskId ||
             (task.parent_task_id && completionTask?.parent_task_id === task.parent_task_id);
    });
  };

  useEffect(() => {
    fetchTasks();
    fetchSuggestions();
    if (isPremium) {
      fetchCompletions();
    }
  }, [isPremium]);

  // Set up real-time subscriptions
  useEffect(() => {
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    const suggestionsChannel = supabase
      .channel('suggestions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_suggestions'
        },
        () => {
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(suggestionsChannel);
    };
  }, []);

  return {
    tasks,
    completions,
    suggestions,
    loading,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    acceptSuggestion,
    dismissSuggestion,
    getTaskStats,
    getTaskHistory,
    refetch: fetchTasks
  };
};