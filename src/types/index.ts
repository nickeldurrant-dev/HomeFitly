export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'cleaning' | 'seasonal' | 'repair' | 'upgrade';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  archived?: boolean;
  parentTaskId?: string; // For recurring tasks, links to original task
  completionHistory?: TaskCompletion[];
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  recurring?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'custom';
    interval?: number; // for custom frequency (in days)
    nextDueDate?: string;
    lastCompleted?: string;
    completionCount?: number;
    seasonalMonths?: number[]; // for seasonal tasks (1-12)
  };
  homeSpecific?: {
    homeAge?: number; // years old when task becomes relevant
    homeTypes?: string[]; // which home types this applies to
    features?: string[]; // required home features
    climateZones?: string[]; // climate-specific tasks
  };
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  completedAt: string;
  completedBy?: string;
  notes?: string;
  timeSpent?: number; // actual time spent in minutes
  difficulty?: 'easier' | 'as_expected' | 'harder';
  nextDueDate?: string; // for recurring tasks
}
export interface Warranty {
  id: string;
  item: string;
  brand: string;
  model: string;
  category: string;
  purchaseDate: string;
  expirationDate: string;
  warrantyType: string;
  documentUrl?: string;
  notes?: string;
}

export interface ServiceContact {
  id: string;
  name: string;
  company?: string;
  category: string;
  phone: string;
  email?: string;
  website?: string;
  address?: string;
  notes?: string;
  services: ServiceRecord[];
  tags: string[];
  isFavorite: boolean;
  addedDate: string;
  lastUsed?: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  taskId?: string; // Link to related task
  rating?: number; // 1-5 stars
  notes?: string;
  receiptUrl?: string;
}

export interface HomeProfile {
  address: string;
  familyName: string;
  homePhoto?: string;
  yearBuilt: number | null;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  homeType: string | null;
  lotSize?: number;
  features: string[];
  notificationSettings: NotificationSettings;
}

export interface DIYResource {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tools: string[];
  materials: string[];
  videoUrl?: string;
  steps: string[];
}

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  warrantyAlerts: boolean;
  maintenanceSchedule: boolean;
  urgentTasks: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderDays: number; // Days before due date to send reminder
}

export interface AppNotification {
  id: string;
  type: 'task' | 'warranty' | 'maintenance' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  plan: 'free' | 'premium';
  expiresAt?: string;
  cancelAtPeriodEnd?: boolean;
  features: {
    reminders: boolean;
    history: boolean;
    advancedChecklists: boolean;
    premiumGuides: boolean;
    warrantyTracking: boolean;
  };
}

export interface Receipt {
  id: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  purchaseDate: string;
  vendor: string;
  imageUrl?: string;
  pdfUrl?: string;
  tags: string[];
  warranty?: {
    duration: string;
    expirationDate: string;
    type: string;
  };
}

export interface Document {
  id: string;
  title: string;
  type: 'warranty' | 'manual' | 'receipt' | 'inspection' | 'other';
  category: string;
  uploadDate: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'document';
  relatedItem?: string; // ID of related appliance/item
  expirationDate?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'receipt' | 'warranty' | 'both';
  isDefault: boolean;
  color: string;
  icon: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  isDefault: boolean;
  lastFour?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string; // For PayPal
  createdAt: string;
}

export interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number;
  dueDate?: string;
  homeTypes?: string[]; // Which home types this applies to
  conditions?: string[]; // Conditions that trigger this item
  seasonal?: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  category: 'move-in' | 'seasonal' | 'maintenance' | 'custom';
  items: ChecklistItem[];
  homeType?: string;
  customizable: boolean;
  premium: boolean;
  baseItems: ChecklistItem[]; // Original template items
  customizationQuestions?: CustomizationQuestion[];
}

export interface CustomizationQuestion {
  id: string;
  question: string;
  type: 'boolean' | 'select' | 'multiselect';
  options?: string[];
  triggersItems?: string[]; // Item IDs that get added if answered positively
}