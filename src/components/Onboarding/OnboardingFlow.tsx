import React, { useState } from 'react';
import { Home, MapPin, Calendar, CheckSquare, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import AddressLookup from './AddressLookup';
import HomeDataReview from './HomeDataReview';
import TaskRecommendations from './TaskRecommendations';
import { HomeProfile, Task } from '../../types';

interface OnboardingFlowProps {
  onComplete: (homeProfile: HomeProfile, tasks: Task[]) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [homeData, setHomeData] = useState<any>(null);
  const [homeProfile, setHomeProfile] = useState<Partial<HomeProfile>>({});
  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [taskHistory, setTaskHistory] = useState<Record<string, { completed: boolean; lastCompleted?: string }>>({});

  const steps = [
    { id: 1, title: 'Find Your Home', icon: MapPin },
    { id: 2, title: 'Review Details', icon: Home },
    { id: 3, title: 'Setup Tasks', icon: CheckSquare },
  ];

  const handleAddressSelect = (address: string, data: any) => {
    setHomeData(data);
    setHomeProfile(prev => ({
      ...prev,
      address,
      yearBuilt: data.yearBuilt,
      squareFootage: data.squareFootage,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      homeType: data.homeType,
      lotSize: data.lotSize,
      features: data.features || []
    }));
    setCurrentStep(2);
  };

  const handleHomeDataConfirm = (updatedProfile: Partial<HomeProfile>) => {
    setHomeProfile(updatedProfile);
    
    // Generate task recommendations based on home data
    const tasks = generateTaskRecommendations(updatedProfile);
    setRecommendedTasks(tasks);
    
    // Pre-select all recommended tasks
    setSelectedTasks(new Set(tasks.map(task => task.id)));
    setCurrentStep(3);
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

  const handleTasksConfirm = () => {
    const finalTasks = recommendedTasks
      .filter(task => selectedTasks.has(task.id))
      .map(task => {
        const history = taskHistory[task.id];
        if (history?.completed && history.lastCompleted) {
          // Update task with completion history
          const updatedTask = {
            ...task,
            recurring: task.recurring ? {
              ...task.recurring,
              lastCompleted: history.lastCompleted,
              nextDueDate: getNextDueDate(task, history.lastCompleted)
            } : undefined
          };
          
          // Set the due date to the calculated next date
          if (task.recurring?.enabled) {
            updatedTask.dueDate = getNextDueDate(task, history.lastCompleted);
          }
          
          return updatedTask;
        }
        return task;
      });
      
    const finalProfile: HomeProfile = {
      ...homeProfile,
      familyName: homeProfile.familyName || 'Your Family',
      notificationSettings: {
        enabled: true,
        taskReminders: true,
        warrantyAlerts: true,
        maintenanceSchedule: true,
        urgentTasks: true,
        emailNotifications: true,
        pushNotifications: true,
        reminderDays: 3
      }
    } as HomeProfile;
    
    onComplete(finalProfile, finalTasks);
  };

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

    // Age-based tasks
    if (homeAge > 15) {
      const roofInspectionTask = {
        id: `onboarding-roof-${Date.now()}`,
        title: 'Schedule Roof Inspection',
        description: 'Professional roof inspection for older home',
        category: 'maintenance' as const,
        priority: 'medium' as const,
        dueDate: getNextSeasonalDate([4]), // April
        completed: false,
        estimatedTime: 30,
        difficulty: 'easy' as const,
        points: 80,
        recurring: {
          enabled: true,
          frequency: 'annually' as const
        }
      };
      tasks.push(roofInspectionTask);
    }

    return tasks;
  };

  const getNextSeasonalDate = (months: number[]): string => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    // Find next month in the list
    let nextMonth = months.find(month => month > currentMonth);
    let year = now.getFullYear();
    
    // If no month found this year, use first month of next year
    if (!nextMonth) {
      nextMonth = months[0];
      year += 1;
    }
    
    const date = new Date(year, nextMonth - 1, 15); // 15th of the month
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">HomeFitly</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HomeFitly!</h1>
          <p className="text-gray-600">Let's set up your home profile and create a personalized maintenance plan</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isActive ? 'bg-blue-100 text-blue-700' :
                  isCompleted ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {currentStep === 1 && (
            <AddressLookup onAddressSelect={handleAddressSelect} />
          )}
          
          {currentStep === 2 && homeData && (
            <HomeDataReview
              homeData={homeData}
              homeProfile={homeProfile}
              onConfirm={handleHomeDataConfirm}
              onBack={() => setCurrentStep(1)}
            />
          )}
          
          {currentStep === 3 && (
            <TaskRecommendations
              tasks={recommendedTasks}
              selectedTasks={selectedTasks}
              taskHistory={taskHistory}
              setTaskHistory={setTaskHistory}
              onTaskToggle={(taskId) => {
                setSelectedTasks(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(taskId)) {
                    newSet.delete(taskId);
                  } else {
                    newSet.add(taskId);
                  }
                  return newSet;
                });
              }}
              onConfirm={handleTasksConfirm}
              onBack={() => setCurrentStep(2)}
              homeProfile={homeProfile}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            <Sparkles className="h-4 w-4 inline mr-1" />
            Smart recommendations powered by your home's unique characteristics
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;