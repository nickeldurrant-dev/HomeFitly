import { Task, Warranty, ServiceContact, HomeProfile, DIYResource, Receipt, Document, Checklist } from '../types';

export const defaultCategories = [
  // Receipt Categories
  { id: 'appliances', name: 'Appliances', type: 'both', isDefault: true, color: 'bg-blue-100 text-blue-800', icon: 'Zap', createdAt: '2024-01-01' },
  { id: 'electronics', name: 'Electronics', type: 'both', isDefault: true, color: 'bg-purple-100 text-purple-800', icon: 'Smartphone', createdAt: '2024-01-01' },
  { id: 'furniture', name: 'Furniture', type: 'both', isDefault: true, color: 'bg-amber-100 text-amber-800', icon: 'Sofa', createdAt: '2024-01-01' },
  { id: 'hvac', name: 'HVAC & Climate', type: 'both', isDefault: true, color: 'bg-cyan-100 text-cyan-800', icon: 'Wind', createdAt: '2024-01-01' },
  { id: 'plumbing', name: 'Plumbing', type: 'both', isDefault: true, color: 'bg-blue-100 text-blue-800', icon: 'Droplets', createdAt: '2024-01-01' },
  { id: 'electrical', name: 'Electrical', type: 'both', isDefault: true, color: 'bg-yellow-100 text-yellow-800', icon: 'Zap', createdAt: '2024-01-01' },
  { id: 'flooring', name: 'Flooring', type: 'both', isDefault: true, color: 'bg-stone-100 text-stone-800', icon: 'Square', createdAt: '2024-01-01' },
  { id: 'roofing', name: 'Roofing', type: 'both', isDefault: true, color: 'bg-slate-100 text-slate-800', icon: 'Home', createdAt: '2024-01-01' },
  { id: 'landscaping', name: 'Landscaping', type: 'both', isDefault: true, color: 'bg-green-100 text-green-800', icon: 'Trees', createdAt: '2024-01-01' },
  { id: 'security', name: 'Security', type: 'both', isDefault: true, color: 'bg-red-100 text-red-800', icon: 'Shield', createdAt: '2024-01-01' },
  { id: 'lighting', name: 'Lighting', type: 'both', isDefault: true, color: 'bg-yellow-100 text-yellow-800', icon: 'Lightbulb', createdAt: '2024-01-01' },
  { id: 'kitchen', name: 'Kitchen', type: 'both', isDefault: true, color: 'bg-orange-100 text-orange-800', icon: 'ChefHat', createdAt: '2024-01-01' },
  { id: 'bathroom', name: 'Bathroom', type: 'both', isDefault: true, color: 'bg-teal-100 text-teal-800', icon: 'Bath', createdAt: '2024-01-01' },
  { id: 'tools', name: 'Tools & Equipment', type: 'receipt', isDefault: true, color: 'bg-gray-100 text-gray-800', icon: 'Wrench', createdAt: '2024-01-01' },
  { id: 'maintenance', name: 'Maintenance', type: 'receipt', isDefault: true, color: 'bg-indigo-100 text-indigo-800', icon: 'Settings', createdAt: '2024-01-01' },
  { id: 'utilities', name: 'Utilities', type: 'receipt', isDefault: true, color: 'bg-emerald-100 text-emerald-800', icon: 'Zap', createdAt: '2024-01-01' },
  { id: 'insurance', name: 'Insurance', type: 'receipt', isDefault: true, color: 'bg-blue-100 text-blue-800', icon: 'Shield', createdAt: '2024-01-01' },
  { id: 'other', name: 'Other', type: 'both', isDefault: true, color: 'bg-gray-100 text-gray-800', icon: 'Package', createdAt: '2024-01-01' }
];

// Empty arrays for production launch
export const mockHomeProfile: HomeProfile = {
  address: "",
  familyName: "",
  yearBuilt: null,
  squareFootage: null,
  bedrooms: null,
  bathrooms: null,
  homeType: null,
  lotSize: undefined,
  features: [],
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
};

// Default tasks that all users should have (respects free/premium limits)
export const getDefaultTasks = (isPremium: boolean = false, homeProfile?: HomeProfile): Task[] => {
  const tasks: Task[] = [];
  const homeAge = homeProfile?.yearBuilt ? new Date().getFullYear() - homeProfile.yearBuilt : 10;
  
  // Essential tasks for all users (free and premium)
  const essentialTasks = [
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

  // Add essential tasks with staggered due dates
  essentialTasks.forEach((taskTemplate, index) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (index + 1) * 7); // Spread tasks over weeks
    
    tasks.push({
      id: `essential-${Date.now()}-${index}`,
      ...taskTemplate,
      dueDate: dueDate.toISOString().split('T')[0],
      completed: false
    });
  });

  // Additional tasks for premium users
  if (isPremium) {
    const premiumTasks = [
      {
        title: 'Deep Clean Kitchen Appliances',
        description: 'Clean inside and outside of refrigerator, oven, and dishwasher',
        category: 'cleaning' as const,
        priority: 'medium' as const,
        estimatedTime: 120,
        difficulty: 'medium' as const,
        points: 50,
        recurring: {
          enabled: true,
          frequency: 'quarterly' as const
        }
      },
      {
        title: 'Inspect and Clean Gutters',
        description: 'Remove debris from gutters and check for damage',
        category: 'seasonal' as const,
        priority: 'medium' as const,
        estimatedTime: 90,
        difficulty: 'medium' as const,
        points: 60,
        recurring: {
          enabled: true,
          frequency: 'biannually' as const,
          seasonalMonths: [4, 10]
        }
      },
      {
        title: 'Test Water Pressure and Faucets',
        description: 'Check water pressure in all faucets and look for leaks',
        category: 'maintenance' as const,
        priority: 'medium' as const,
        estimatedTime: 45,
        difficulty: 'easy' as const,
        points: 35,
        recurring: {
          enabled: true,
          frequency: 'biannually' as const
        }
      },
      {
        title: 'Inspect Electrical Outlets and Switches',
        description: 'Test all outlets and switches, check for loose connections',
        category: 'maintenance' as const,
        priority: 'medium' as const,
        estimatedTime: 60,
        difficulty: 'medium' as const,
        points: 45,
        recurring: {
          enabled: true,
          frequency: 'annually' as const
        }
      },
      {
        title: 'Caulk and Weatherstrip Check',
        description: 'Inspect and replace caulking around windows and doors',
        category: 'maintenance' as const,
        priority: 'medium' as const,
        estimatedTime: 90,
        difficulty: 'medium' as const,
        points: 55,
        recurring: {
          enabled: true,
          frequency: 'annually' as const
        }
      },
      {
        title: 'Check and Test Garage Door',
        description: 'Test garage door safety features and lubricate moving parts',
        category: 'maintenance' as const,
        priority: 'medium' as const,
        estimatedTime: 45,
        difficulty: 'easy' as const,
        points: 40,
        recurring: {
          enabled: true,
          frequency: 'biannually' as const
        }
      },
      {
        title: 'Seasonal HVAC Service',
        description: 'Schedule professional HVAC inspection and maintenance',
        category: 'maintenance' as const,
        priority: 'high' as const,
        estimatedTime: 30,
        difficulty: 'easy' as const,
        points: 70,
        recurring: {
          enabled: true,
          frequency: 'biannually' as const,
          seasonalMonths: [3, 9]
        }
      }
    ];

    // Add premium tasks with staggered due dates
    premiumTasks.forEach((taskTemplate, index) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (index + 4) * 7); // Start after essential tasks
      
      tasks.push({
        id: `premium-${Date.now()}-${index}`,
        ...taskTemplate,
        dueDate: dueDate.toISOString().split('T')[0],
        completed: false
      });
    });
  }

  // Add home-type specific tasks
  if (homeProfile?.homeType === 'single-family' || homeProfile?.homeType === 'townhouse') {
    const homeTypeTasks = [
      {
        title: 'Inspect Roof and Gutters',
        description: 'Check roof for damage and clean gutters',
        category: 'seasonal' as const,
        priority: 'medium' as const,
        estimatedTime: 120,
        difficulty: 'medium' as const,
        points: 65,
        recurring: {
          enabled: true,
          frequency: 'biannually' as const,
          seasonalMonths: [4, 10]
        }
      }
    ];

    homeTypeTasks.forEach((taskTemplate, index) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (index + 10) * 7);
      
      tasks.push({
        id: `hometype-${Date.now()}-${index}`,
        ...taskTemplate,
        dueDate: dueDate.toISOString().split('T')[0],
        completed: false
      });
    });
  }

  return tasks;
};

export const mockTasks: Task[] = getDefaultTasks(false);
export const mockWarranties: Warranty[] = [];
export const mockServiceContacts: ServiceContact[] = [];
export const mockDIYResources: DIYResource[] = [];
export const mockReceipts: Receipt[] = [];
export const mockDocuments: Document[] = [];

// Pre-built checklists
export const mockChecklists: Checklist[] = [
  // FREE VERSION - Move-in Checklist
  {
    id: 'move-in-basic',
    title: 'New Home Move-In Essentials',
    description: 'Essential tasks to complete when moving into your new home',
    category: 'move-in',
    customizable: false,
    premium: false,
    baseItems: [
      {
        id: 'change-locks',
        title: 'Change or rekey all locks',
        description: 'Replace or rekey exterior door locks for security',
        completed: false,
        category: 'Security',
        priority: 'high',
        estimatedTime: 60
      },
      {
        id: 'test-smoke-detectors',
        title: 'Test all smoke detectors',
        description: 'Test smoke detectors and replace batteries if needed',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 20
      },
      {
        id: 'locate-main-shutoffs',
        title: 'Locate main water and gas shutoffs',
        description: 'Find and test main utility shutoff valves',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 30
      },
      {
        id: 'test-electrical-outlets',
        title: 'Test all electrical outlets',
        description: 'Check that all outlets work and test GFCI outlets',
        completed: false,
        category: 'Electrical',
        priority: 'medium',
        estimatedTime: 45
      },
      {
        id: 'check-hvac-filter',
        title: 'Check and replace HVAC filter',
        description: 'Inspect HVAC filter and replace if dirty',
        completed: false,
        category: 'HVAC',
        priority: 'medium',
        estimatedTime: 15
      },
      {
        id: 'update-address',
        title: 'Update address with utilities',
        description: 'Contact utility companies to transfer or set up service',
        completed: false,
        category: 'Administrative',
        priority: 'high',
        estimatedTime: 60
      },
      {
        id: 'check-water-pressure',
        title: 'Test water pressure in all faucets',
        description: 'Check water pressure and look for leaks',
        completed: false,
        category: 'Plumbing',
        priority: 'medium',
        estimatedTime: 30
      },
      {
        id: 'inspect-windows-doors',
        title: 'Inspect all windows and doors',
        description: 'Check that windows and doors open, close, and lock properly',
        completed: false,
        category: 'Security',
        priority: 'medium',
        estimatedTime: 45
      }
    ],
    items: [
      {
        id: 'change-locks',
        title: 'Change or rekey all locks',
        description: 'Replace or rekey exterior door locks for security',
        completed: false,
        category: 'Security',
        priority: 'high',
        estimatedTime: 60
      },
      {
        id: 'test-smoke-detectors',
        title: 'Test all smoke detectors',
        description: 'Test smoke detectors and replace batteries if needed',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 20
      },
      {
        id: 'locate-main-shutoffs',
        title: 'Locate main water and gas shutoffs',
        description: 'Find and test main utility shutoff valves',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 30
      },
      {
        id: 'test-electrical-outlets',
        title: 'Test all electrical outlets',
        description: 'Check that all outlets work and test GFCI outlets',
        completed: false,
        category: 'Electrical',
        priority: 'medium',
        estimatedTime: 45
      },
      {
        id: 'check-hvac-filter',
        title: 'Check and replace HVAC filter',
        description: 'Inspect HVAC filter and replace if dirty',
        completed: false,
        category: 'HVAC',
        priority: 'medium',
        estimatedTime: 15
      },
      {
        id: 'update-address',
        title: 'Update address with utilities',
        description: 'Contact utility companies to transfer or set up service',
        completed: false,
        category: 'Administrative',
        priority: 'high',
        estimatedTime: 60
      },
      {
        id: 'check-water-pressure',
        title: 'Test water pressure in all faucets',
        description: 'Check water pressure and look for leaks',
        completed: false,
        category: 'Plumbing',
        priority: 'medium',
        estimatedTime: 30
      },
      {
        id: 'inspect-windows-doors',
        title: 'Inspect all windows and doors',
        description: 'Check that windows and doors open, close, and lock properly',
        completed: false,
        category: 'Security',
        priority: 'medium',
        estimatedTime: 45
      }
    ]
  },

  // PREMIUM VERSION - Comprehensive Seasonal Checklists
  {
    id: 'spring-maintenance',
    title: 'Spring Home Maintenance',
    description: 'Complete spring preparation and maintenance checklist',
    category: 'seasonal',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'inspect-roof-gutters',
        title: 'Inspect roof and clean gutters',
        description: 'Check for winter damage and clean out debris',
        completed: false,
        category: 'Exterior',
        priority: 'high',
        estimatedTime: 120,
        homeTypes: ['single-family', 'townhouse']
      },
      {
        id: 'service-hvac-spring',
        title: 'Schedule HVAC spring service',
        description: 'Professional tune-up before cooling season',
        completed: false,
        category: 'HVAC',
        priority: 'high',
        estimatedTime: 30
      },
      {
        id: 'check-outdoor-faucets',
        title: 'Check outdoor faucets and irrigation',
        description: 'Turn on water and check for freeze damage',
        completed: false,
        category: 'Plumbing',
        priority: 'high',
        estimatedTime: 45
      },
      {
        id: 'clean-windows-screens',
        title: 'Clean windows and screens',
        description: 'Wash windows and repair/replace damaged screens',
        completed: false,
        category: 'Cleaning',
        priority: 'medium',
        estimatedTime: 180
      },
      {
        id: 'fertilize-lawn',
        title: 'Fertilize and seed lawn',
        description: 'Apply spring fertilizer and overseed bare spots',
        completed: false,
        category: 'Landscaping',
        priority: 'medium',
        estimatedTime: 90,
        conditions: ['Has lawn or garden']
      },
      {
        id: 'inspect-deck-patio',
        title: 'Inspect deck and patio',
        description: 'Check for winter damage and plan repairs',
        completed: false,
        category: 'Exterior',
        priority: 'medium',
        estimatedTime: 60,
        conditions: ['Has deck or patio']
      },
      {
        id: 'test-sprinkler-system',
        title: 'Test sprinkler system',
        description: 'Turn on and test all zones for proper operation',
        completed: false,
        category: 'Landscaping',
        priority: 'medium',
        estimatedTime: 45,
        conditions: ['Has sprinkler system']
      },
      {
        id: 'clean-outdoor-furniture',
        title: 'Clean and inspect outdoor furniture',
        description: 'Clean and check condition of outdoor furniture',
        completed: false,
        category: 'Cleaning',
        priority: 'low',
        estimatedTime: 60
      }
    ],
    items: [],
    customizationQuestions: [
      {
        id: 'has-lawn',
        question: 'Do you have a lawn or garden?',
        type: 'boolean',
        triggersItems: ['fertilize-lawn']
      },
      {
        id: 'has-deck',
        question: 'Do you have a deck or patio?',
        type: 'boolean',
        triggersItems: ['inspect-deck-patio']
      },
      {
        id: 'has-sprinklers',
        question: 'Do you have a sprinkler system?',
        type: 'boolean',
        triggersItems: ['test-sprinkler-system']
      }
    ]
  },

  {
    id: 'summer-maintenance',
    title: 'Summer Home Maintenance',
    description: 'Keep your home cool and efficient during summer months',
    category: 'seasonal',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'clean-ac-coils',
        title: 'Clean air conditioning coils',
        description: 'Clean outdoor AC unit coils and clear debris',
        completed: false,
        category: 'HVAC',
        priority: 'high',
        estimatedTime: 45
      },
      {
        id: 'check-attic-ventilation',
        title: 'Check attic ventilation',
        description: 'Ensure proper airflow to reduce cooling costs',
        completed: false,
        category: 'HVAC',
        priority: 'medium',
        estimatedTime: 30
      },
      {
        id: 'inspect-pool-equipment',
        title: 'Inspect pool equipment',
        description: 'Check pumps, filters, and chemical levels',
        completed: false,
        category: 'Pool',
        priority: 'high',
        estimatedTime: 60,
        conditions: ['Has pool']
      },
      {
        id: 'trim-trees-shrubs',
        title: 'Trim trees and shrubs',
        description: 'Prune overgrown vegetation away from house',
        completed: false,
        category: 'Landscaping',
        priority: 'medium',
        estimatedTime: 120
      },
      {
        id: 'check-irrigation',
        title: 'Check irrigation system efficiency',
        description: 'Adjust watering schedules and check for leaks',
        completed: false,
        category: 'Landscaping',
        priority: 'medium',
        estimatedTime: 45,
        conditions: ['Has sprinkler system']
      },
      {
        id: 'seal-driveway',
        title: 'Seal driveway cracks',
        description: 'Fill cracks and apply sealant if needed',
        completed: false,
        category: 'Exterior',
        priority: 'medium',
        estimatedTime: 90
      }
    ],
    items: [],
    customizationQuestions: [
      {
        id: 'has-pool-summer',
        question: 'Do you have a pool or spa?',
        type: 'boolean',
        triggersItems: ['inspect-pool-equipment']
      },
      {
        id: 'has-irrigation-summer',
        question: 'Do you have an irrigation system?',
        type: 'boolean',
        triggersItems: ['check-irrigation']
      }
    ]
  },

  {
    id: 'fall-maintenance',
    title: 'Fall Home Preparation',
    description: 'Prepare your home for winter weather',
    category: 'seasonal',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'clean-gutters-fall',
        title: 'Clean gutters and downspouts',
        description: 'Remove leaves and debris before winter',
        completed: false,
        category: 'Exterior',
        priority: 'high',
        estimatedTime: 120,
        homeTypes: ['single-family', 'townhouse']
      },
      {
        id: 'winterize-outdoor-plumbing',
        title: 'Winterize outdoor plumbing',
        description: 'Disconnect hoses and drain outdoor faucets',
        completed: false,
        category: 'Plumbing',
        priority: 'high',
        estimatedTime: 45
      },
      {
        id: 'service-heating-system',
        title: 'Service heating system',
        description: 'Professional tune-up before heating season',
        completed: false,
        category: 'HVAC',
        priority: 'high',
        estimatedTime: 30
      },
      {
        id: 'seal-windows-doors',
        title: 'Check weatherstripping and caulking',
        description: 'Seal gaps around windows and doors',
        completed: false,
        category: 'Insulation',
        priority: 'high',
        estimatedTime: 90
      },
      {
        id: 'clean-chimney',
        title: 'Clean and inspect chimney',
        description: 'Professional cleaning and safety inspection',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 30,
        conditions: ['Has fireplace']
      },
      {
        id: 'rake-leaves',
        title: 'Rake leaves and clear yard debris',
        description: 'Remove fallen leaves to prevent lawn damage',
        completed: false,
        category: 'Landscaping',
        priority: 'medium',
        estimatedTime: 120
      },
      {
        id: 'store-outdoor-furniture',
        title: 'Store or cover outdoor furniture',
        description: 'Protect furniture from winter weather',
        completed: false,
        category: 'Maintenance',
        priority: 'medium',
        estimatedTime: 60
      },
      {
        id: 'test-heating-system',
        title: 'Test heating system',
        description: 'Turn on heat and check all zones/vents',
        completed: false,
        category: 'HVAC',
        priority: 'high',
        estimatedTime: 30
      }
    ],
    items: [],
    customizationQuestions: [
      {
        id: 'has-fireplace-fall',
        question: 'Do you have a fireplace or wood stove?',
        type: 'boolean',
        triggersItems: ['clean-chimney']
      }
    ]
  },

  {
    id: 'winter-maintenance',
    title: 'Winter Home Care',
    description: 'Maintain your home during the cold months',
    category: 'seasonal',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'check-insulation',
        title: 'Check attic insulation',
        description: 'Ensure adequate insulation for energy efficiency',
        completed: false,
        category: 'Insulation',
        priority: 'medium',
        estimatedTime: 45
      },
      {
        id: 'prevent-ice-dams',
        title: 'Prevent ice dams',
        description: 'Keep gutters clear and check roof for ice buildup',
        completed: false,
        category: 'Exterior',
        priority: 'high',
        estimatedTime: 60,
        seasonal: true
      },
      {
        id: 'check-heating-efficiency',
        title: 'Monitor heating system efficiency',
        description: 'Check energy usage and system performance',
        completed: false,
        category: 'HVAC',
        priority: 'medium',
        estimatedTime: 30
      },
      {
        id: 'inspect-fireplace',
        title: 'Inspect fireplace and chimney',
        description: 'Check for proper operation and safety',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 45,
        conditions: ['Has fireplace']
      },
      {
        id: 'check-carbon-monoxide',
        title: 'Test carbon monoxide detectors',
        description: 'Extra important during heating season',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 15
      },
      {
        id: 'maintain-humidity',
        title: 'Monitor indoor humidity',
        description: 'Maintain 30-50% humidity to prevent issues',
        completed: false,
        category: 'HVAC',
        priority: 'medium',
        estimatedTime: 20
      }
    ],
    items: [],
    customizationQuestions: [
      {
        id: 'has-fireplace-winter',
        question: 'Do you have a fireplace or wood stove?',
        type: 'boolean',
        triggersItems: ['inspect-fireplace']
      }
    ]
  },

  // PREMIUM - Specialized Checklists
  {
    id: 'new-homeowner-complete',
    title: 'Complete New Homeowner Guide',
    description: 'Comprehensive checklist for first-time homeowners',
    category: 'move-in',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'create-home-inventory',
        title: 'Create home inventory for insurance',
        description: 'Document belongings and home features',
        completed: false,
        category: 'Administrative',
        priority: 'high',
        estimatedTime: 120
      },
      {
        id: 'locate-property-lines',
        title: 'Locate property boundaries',
        description: 'Understand your property lines and easements',
        completed: false,
        category: 'Administrative',
        priority: 'medium',
        estimatedTime: 60
      },
      {
        id: 'understand-electrical-panel',
        title: 'Label electrical panel',
        description: 'Identify and label all circuit breakers',
        completed: false,
        category: 'Electrical',
        priority: 'high',
        estimatedTime: 60
      },
      {
        id: 'test-all-systems',
        title: 'Test all home systems',
        description: 'HVAC, plumbing, electrical, security systems',
        completed: false,
        category: 'Systems',
        priority: 'high',
        estimatedTime: 180
      },
      {
        id: 'schedule-inspections',
        title: 'Schedule professional inspections',
        description: 'HVAC, roof, pest, and other system inspections',
        completed: false,
        category: 'Administrative',
        priority: 'medium',
        estimatedTime: 90
      }
    ],
    items: []
  },

  {
    id: 'energy-efficiency',
    title: 'Energy Efficiency Audit',
    description: 'Optimize your home for energy savings',
    category: 'maintenance',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'seal-air-leaks',
        title: 'Seal air leaks',
        description: 'Caulk and weatherstrip around windows and doors',
        completed: false,
        category: 'Insulation',
        priority: 'high',
        estimatedTime: 120
      },
      {
        id: 'upgrade-insulation',
        title: 'Check and upgrade insulation',
        description: 'Ensure adequate insulation in attic and walls',
        completed: false,
        category: 'Insulation',
        priority: 'medium',
        estimatedTime: 180
      },
      {
        id: 'install-programmable-thermostat',
        title: 'Install programmable thermostat',
        description: 'Upgrade to smart or programmable thermostat',
        completed: false,
        category: 'HVAC',
        priority: 'medium',
        estimatedTime: 90
      },
      {
        id: 'upgrade-to-led',
        title: 'Replace bulbs with LED',
        description: 'Switch to energy-efficient LED lighting',
        completed: false,
        category: 'Electrical',
        priority: 'low',
        estimatedTime: 60
      },
      {
        id: 'insulate-water-heater',
        title: 'Insulate water heater and pipes',
        description: 'Add insulation to reduce heat loss',
        completed: false,
        category: 'Plumbing',
        priority: 'medium',
        estimatedTime: 90
      }
    ],
    items: []
  },

  {
    id: 'home-security-audit',
    title: 'Home Security Assessment',
    description: 'Comprehensive security evaluation and improvements',
    category: 'maintenance',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'upgrade-door-locks',
        title: 'Upgrade to deadbolt locks',
        description: 'Install high-quality deadbolts on all exterior doors',
        completed: false,
        category: 'Security',
        priority: 'high',
        estimatedTime: 120
      },
      {
        id: 'install-security-lighting',
        title: 'Install motion-sensor lighting',
        description: 'Add motion lights around entry points',
        completed: false,
        category: 'Security',
        priority: 'medium',
        estimatedTime: 90
      },
      {
        id: 'secure-sliding-doors',
        title: 'Secure sliding doors',
        description: 'Add security bars or pins to sliding doors',
        completed: false,
        category: 'Security',
        priority: 'medium',
        estimatedTime: 45
      },
      {
        id: 'trim-landscaping',
        title: 'Trim landscaping near windows',
        description: 'Remove hiding spots around entry points',
        completed: false,
        category: 'Landscaping',
        priority: 'medium',
        estimatedTime: 90
      },
      {
        id: 'install-security-system',
        title: 'Consider security system installation',
        description: 'Evaluate and install home security system',
        completed: false,
        category: 'Security',
        priority: 'low',
        estimatedTime: 180
      }
    ],
    items: []
  },

  {
    id: 'deep-cleaning-checklist',
    title: 'Seasonal Deep Cleaning',
    description: 'Thorough cleaning checklist for spring and fall',
    category: 'cleaning',
    customizable: false,
    premium: true,
    baseItems: [
      {
        id: 'clean-baseboards',
        title: 'Clean all baseboards and trim',
        description: 'Dust and wipe down all baseboards throughout house',
        completed: false,
        category: 'Cleaning',
        priority: 'medium',
        estimatedTime: 90
      },
      {
        id: 'clean-light-fixtures',
        title: 'Clean light fixtures and ceiling fans',
        description: 'Remove dust and grime from all lighting',
        completed: false,
        category: 'Cleaning',
        priority: 'medium',
        estimatedTime: 120
      },
      {
        id: 'deep-clean-appliances',
        title: 'Deep clean all appliances',
        description: 'Clean inside and outside of all major appliances',
        completed: false,
        category: 'Cleaning',
        priority: 'medium',
        estimatedTime: 180
      },
      {
        id: 'clean-air-vents',
        title: 'Clean air vents and registers',
        description: 'Remove and wash all vent covers',
        completed: false,
        category: 'HVAC',
        priority: 'medium',
        estimatedTime: 90
      },
      {
        id: 'wash-windows-inside',
        title: 'Wash all interior windows',
        description: 'Clean windows and window sills throughout house',
        completed: false,
        category: 'Cleaning',
        priority: 'low',
        estimatedTime: 120
      },
      {
        id: 'organize-storage-areas',
        title: 'Organize closets and storage areas',
        description: 'Declutter and organize all storage spaces',
        completed: false,
        category: 'Organization',
        priority: 'low',
        estimatedTime: 240
      }
    ],
    items: []
  },

  {
    id: 'monthly-maintenance',
    title: 'Monthly Home Maintenance',
    description: 'Essential monthly tasks to keep your home running smoothly',
    category: 'maintenance',
    customizable: true,
    premium: true,
    baseItems: [
      {
        id: 'test-smoke-co-monthly',
        title: 'Test smoke and CO detectors',
        description: 'Press test button on all detectors',
        completed: false,
        category: 'Safety',
        priority: 'high',
        estimatedTime: 15
      },
      {
        id: 'check-hvac-filter-monthly',
        title: 'Check HVAC filter',
        description: 'Inspect and replace if dirty',
        completed: false,
        category: 'HVAC',
        priority: 'high',
        estimatedTime: 10
      },
      {
        id: 'run-water-unused-drains',
        title: 'Run water in unused drains',
        description: 'Prevent trap seals from drying out',
        completed: false,
        category: 'Plumbing',
        priority: 'medium',
        estimatedTime: 10
      },
      {
        id: 'check-garage-door-safety',
        title: 'Test garage door safety features',
        description: 'Test auto-reverse and emergency release',
        completed: false,
        category: 'Safety',
        priority: 'medium',
        estimatedTime: 15,
        conditions: ['Has garage']
      },
      {
        id: 'inspect-fire-extinguisher',
        title: 'Inspect fire extinguisher',
        description: 'Check pressure gauge and expiration date',
        completed: false,
        category: 'Safety',
        priority: 'medium',
        estimatedTime: 5
      }
    ],
    items: [],
    customizationQuestions: [
      {
        id: 'has-garage-monthly',
        question: 'Do you have a garage?',
        type: 'boolean',
        triggersItems: ['check-garage-door-safety']
      }
    ]
  }
];

// Keep subscription plans and user subscription for functionality
export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'monthly',
    features: [
      'Basic task management',
      'Up to 10 tasks',
      'Basic home profile',
      'Community support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Service',
    price: 4.99,
    interval: 'monthly',
    features: [
      'Unlimited tasks',
      'Smart reminders & notifications',
      'Complete task history',
      'Advanced checklists',
      'Premium DIY guides',
      'Warranty tracking',
      'Priority support',
      'Export data'
    ],
    popular: true
  }
];

export const mockUserSubscription = {
  plan: 'free',
  cancelAtPeriodEnd: false,
  features: {
    reminders: false,
    history: false,
    advancedChecklists: false,
    premiumGuides: false,
    warrantyTracking: false
  }
};