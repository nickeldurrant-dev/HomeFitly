import { Task } from '../types';

export class TaskScheduler {
  /**
   * Complete a task and handle recurring task creation
   */
  static completeTask(
    task: Task, 
    completionData: {
      completedBy?: string;
      notes?: string;
      timeSpent?: number;
      difficulty?: 'easier' | 'as_expected' | 'harder';
    } = {}
  ): { completedTask: Task; nextTask?: Task } {
    const completionDate = new Date();
    const completionId = `completion-${Date.now()}`;
    
    // Create completion record
    const completion: TaskCompletion = {
      id: completionId,
      taskId: task.id,
      completedAt: completionDate.toISOString(),
      completedBy: completionData.completedBy,
      notes: completionData.notes,
      timeSpent: completionData.timeSpent,
      difficulty: completionData.difficulty
    };
    
    // Mark current task as completed and archived
    const completedTask: Task = {
      ...task,
      completed: true,
      completedAt: completionDate.toISOString(),
      completedBy: completionData.completedBy,
      notes: completionData.notes,
      archived: true,
      completionHistory: [...(task.completionHistory || []), completion],
      recurring: task.recurring ? {
        ...task.recurring,
        lastCompleted: completionDate.toISOString().split('T')[0],
        completionCount: (task.recurring.completionCount || 0) + 1
      } : task.recurring
    };
    
    // Create next recurring task if applicable
    let nextTask: Task | undefined;
    if (task.recurring?.enabled) {
      const nextDueDate = this.calculateNextDueDate(task, completionDate);
      
      nextTask = {
        ...task,
        id: `${task.id}-${Date.now()}`,
        dueDate: nextDueDate,
        completed: false,
        completedAt: undefined,
        completedBy: undefined,
        notes: undefined,
        archived: false,
        parentTaskId: task.parentTaskId || task.id, // Link to original task
        completionHistory: [], // New task starts with empty history
        recurring: {
          ...task.recurring,
          lastCompleted: completionDate.toISOString().split('T')[0],
          nextDueDate,
          completionCount: (task.recurring.completionCount || 0) + 1
        }
      };
      
      completion.nextDueDate = nextDueDate;
    }
    
    return { completedTask, nextTask };
  }
  
  /**
   * Get task completion statistics
   */
  static getTaskStats(tasks: Task[]) {
    const completedTasks = tasks.filter(task => task.completed);
    const activeTasks = tasks.filter(task => !task.completed && !task.archived);
    const archivedTasks = tasks.filter(task => task.archived);
    
    const totalCompletions = tasks.reduce((sum, task) => 
      sum + (task.completionHistory?.length || 0), 0
    );
    
    const totalTimeSpent = tasks.reduce((sum, task) => 
      sum + (task.completionHistory?.reduce((timeSum, completion) => 
        timeSum + (completion.timeSpent || 0), 0
      ) || 0), 0
    );
    
    const totalPointsEarned = completedTasks.reduce((sum, task) => sum + task.points, 0);
    
    return {
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      archivedTasks: archivedTasks.length,
      totalCompletions,
      totalTimeSpent,
      totalPointsEarned,
      averageTimePerTask: totalCompletions > 0 ? Math.round(totalTimeSpent / totalCompletions) : 0
    };
  }
  
  /**
   * Get task completion history for a specific task or task family
   */
  static getTaskHistory(tasks: Task[], taskId: string): TaskCompletion[] {
    const task = tasks.find(t => t.id === taskId || t.parentTaskId === taskId);
    if (!task) return [];
    
    // Get all tasks in the same family (original + recurring instances)
    const familyTasks = tasks.filter(t => 
      t.id === taskId || 
      t.parentTaskId === taskId || 
      (task.parentTaskId && (t.id === task.parentTaskId || t.parentTaskId === task.parentTaskId))
    );
    
    // Collect all completion history
    const allCompletions = familyTasks.reduce((completions, t) => {
      return [...completions, ...(t.completionHistory || [])];
    }, [] as TaskCompletion[]);
    
    // Sort by completion date (newest first)
    return allCompletions.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  /**
   * Calculate the next due date for a recurring task
   */
  static calculateNextDueDate(task: Task, completionDate: Date = new Date()): string {
    if (!task.recurring?.enabled) {
      return task.dueDate;
    }

    const { frequency, interval, seasonalMonths } = task.recurring;
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
        if (seasonalMonths && seasonalMonths.length === 2) {
          // For seasonal tasks, schedule for the next seasonal month
          const currentMonth = nextDate.getMonth() + 1; // 1-12
          const nextSeasonalMonth = seasonalMonths.find(month => month > currentMonth) || seasonalMonths[0];
          
          if (nextSeasonalMonth > currentMonth) {
            nextDate.setMonth(nextSeasonalMonth - 1);
          } else {
            // Next year
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
      
      case 'custom':
        if (interval) {
          nextDate.setDate(nextDate.getDate() + interval);
        }
        break;
    }

    return nextDate.toISOString().split('T')[0];
  }

  /**
   * Create a new task instance for the next occurrence
   */
  static createNextOccurrence(task: Task, completionDate: Date = new Date()): Task {
    const nextDueDate = this.calculateNextDueDate(task, completionDate);
    
    return {
      ...task,
      id: `${task.id}-${Date.now()}`, // Generate new ID
      dueDate: nextDueDate,
      completed: false,
      recurring: {
        ...task.recurring!,
        lastCompleted: completionDate.toISOString().split('T')[0],
        nextDueDate
      }
    };
  }

  /**
   * Get recommended frequency for a task based on category and home characteristics
   */
  static getRecommendedFrequency(
    category: string, 
    homeAge: number, 
    homeType: string,
    features: string[]
  ): { frequency: string; reasoning: string } {
    const recommendations: Record<string, any> = {
      'hvac-filter': {
        frequency: homeAge > 10 ? 'monthly' : 'quarterly',
        reasoning: `Older homes (${homeAge} years) need more frequent filter changes`
      },
      'smoke-detector': {
        frequency: 'monthly',
        reasoning: 'Safety critical - monthly testing recommended'
      },
      'gutter-cleaning': {
        frequency: features.includes('Trees') ? 'quarterly' : 'biannually',
        reasoning: features.includes('Trees') ? 'Trees require more frequent cleaning' : 'Standard maintenance schedule'
      },
      'hvac-service': {
        frequency: homeAge > 15 ? 'biannually' : 'annually',
        reasoning: `${homeAge > 15 ? 'Older' : 'Newer'} HVAC systems need ${homeAge > 15 ? 'more' : 'less'} frequent service`
      }
    };

    return recommendations[category] || {
      frequency: 'annually',
      reasoning: 'Standard annual maintenance recommended'
    };
  }

  /**
   * Generate smart task suggestions based on home profile
   */
  static generateSmartSuggestions(
    homeProfile: any,
    existingTasks: Task[]
  ): Task[] {
    const suggestions: Task[] = [];
    const { yearBuilt, homeType, features, city, state, coordinates } = homeProfile;
    const homeAge = new Date().getFullYear() - yearBuilt;

    // Regional considerations
    const isNorthernClimate = ['MN', 'WI', 'MI', 'NY', 'VT', 'NH', 'ME', 'ND', 'SD', 'MT', 'ID', 'WA', 'OR', 'AK'].includes(state) ||
                             ['ON', 'QC', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'].includes(state);
    const isHumidClimate = ['FL', 'LA', 'MS', 'AL', 'GA', 'SC', 'NC', 'VA', 'HI'].includes(state);
    const isDryClimate = ['AZ', 'NV', 'UT', 'NM', 'CO', 'WY'].includes(state);

    // HVAC Filter replacement
    if (features.includes('Central Air') && !existingTasks.some(t => t.title.includes('HVAC Filter'))) {
      // More frequent changes in dusty/humid climates or older homes
      let frequency = 'quarterly';
      if (homeAge > 10 || isDryClimate || isHumidClimate) {
        frequency = 'monthly';
      }
      
      suggestions.push({
        id: `suggestion-hvac-${Date.now()}`,
        title: 'Replace HVAC Filter',
        description: `${frequency === 'monthly' ? 'Monthly' : 'Quarterly'} filter replacement for optimal air quality`,
        category: 'maintenance',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        estimatedTime: 15,
        difficulty: 'easy',
        points: 25,
        recurring: {
          enabled: true,
          frequency: frequency as any
        },
        homeSpecific: {
          homeAge,
          homeTypes: [homeType],
          features: ['Central Air']
        }
      });
    }

    // Seasonal gutter cleaning
    if (['single-family', 'townhouse'].includes(homeType) && !existingTasks.some(t => t.title.includes('Gutter'))) {
      // More frequent cleaning in areas with trees/leaves
      const frequency = features.includes('Trees') || isNorthernClimate ? 'quarterly' : 'biannually';
      const seasonalMonths = isNorthernClimate ? [4, 6, 9, 11] : [4, 10]; // More frequent in fall climates
      
      suggestions.push({
        id: `suggestion-gutters-${Date.now()}`,
        title: 'Clean Gutters',
        description: 'Remove debris and check for damage',
        category: 'seasonal',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        estimatedTime: 90,
        difficulty: 'medium',
        points: 40,
        recurring: {
          enabled: true,
          frequency: frequency as any,
          seasonalMonths
        },
        homeSpecific: {
          homeTypes: ['single-family', 'townhouse']
        }
      });
    }

    // Winter preparation for northern climates
    if (isNorthernClimate && ['single-family', 'townhouse'].includes(homeType) && !existingTasks.some(t => t.title.includes('Winterize'))) {
      suggestions.push({
        id: `suggestion-winterize-${Date.now()}`,
        title: 'Winterize Outdoor Plumbing',
        description: 'Disconnect hoses, drain outdoor faucets, and shut off outdoor water valves',
        category: 'seasonal',
        priority: 'high',
        dueDate: new Date(new Date().getFullYear(), 9, 15).toISOString().split('T')[0], // October 15
        completed: false,
        estimatedTime: 45,
        difficulty: 'easy',
        points: 35,
        recurring: {
          enabled: true,
          frequency: 'annually',
          seasonalMonths: [10]
        },
        homeSpecific: {
          homeTypes: ['single-family', 'townhouse'],
          climateZones: ['northern']
        }
      });
    }

    // Pool maintenance for warm climates
    if ((features.includes('Pool') || features.includes('Hot Tub')) && !existingTasks.some(t => t.title.includes('Pool'))) {
      suggestions.push({
        id: `suggestion-pool-${Date.now()}`,
        title: 'Pool Chemical Balance Check',
        description: 'Test and balance pool chemicals, clean skimmer baskets',
        category: 'maintenance',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        estimatedTime: 30,
        difficulty: 'easy',
        points: 25,
        recurring: {
          enabled: true,
          frequency: 'weekly'
        },
        homeSpecific: {
          features: ['Pool', 'Hot Tub']
        }
      });
    }

    // Humidity control for humid climates
    if (isHumidClimate && !existingTasks.some(t => t.title.includes('Dehumidifier'))) {
      suggestions.push({
        id: `suggestion-humidity-${Date.now()}`,
        title: 'Check Dehumidifier and Ventilation',
        description: 'Inspect dehumidifier, clean vents, check for mold in humid areas',
        category: 'maintenance',
        priority: 'medium',
        dueDate: new Date(new Date().getFullYear(), 4, 1).toISOString().split('T')[0], // May 1
        completed: false,
        estimatedTime: 60,
        difficulty: 'easy',
        points: 30,
        recurring: {
          enabled: true,
          frequency: 'biannually',
          seasonalMonths: [5, 8] // May and August
        },
        homeSpecific: {
          climateZones: ['humid']
        }
      });
    }

    return suggestions;
  }
}