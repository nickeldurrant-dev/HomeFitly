import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import { useHomeProfile } from './hooks/useHomeProfile';
import { usePersistentState } from './hooks/usePersistentState';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DataBackupManager } from './utils/dataBackup';
import { SecurityManager } from './utils/security';
import { TaskScheduler } from './utils/taskScheduler';
import { getDefaultTasks, mockChecklists, mockServiceContacts, mockWarranties, mockReceipts, mockDocuments, subscriptionPlans, mockUserSubscription } from './data/mockData';

// Components
import LandingPage from './components/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import SuccessPage from './components/Auth/SuccessPage';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Checklists from './components/Checklists';
import Warranties from './components/Warranties';
import Receipts from './components/Receipts';
import Documents from './components/Documents';
import Services from './components/Services';
import DIYResources from './components/DIYResources';
import HomeProfile from './components/HomeProfile';
import NotificationSettings from './components/NotificationSettings';
import PricingModal from './components/PricingModal';

// Types
import { Task, HomeProfile as IHomeProfile, ServiceContact, Warranty, Receipt, Document, Checklist, NotificationSettings as INotificationSettings } from './types';

function App() {
  const { user, loading: authLoading, getFamilyName } = useAuth();
  const { isPremium, subscription, loading: subscriptionLoading } = useSubscription();
  
  // App state
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup' | 'success'>('landing');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Check for success parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setAuthMode('success');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Data state with persistent storage
  const [tasks, setTasks] = usePersistentState<Task[]>([], {
    storageKey: 'homefitly_tasks',
    syncAcrossDevices: isPremium,
    encryptData: true,
    backupOnChange: true
  });

  const [checklists, setChecklists] = usePersistentState<Checklist[]>(mockChecklists, {
    storageKey: 'homefitly_checklists',
    syncAcrossDevices: isPremium
  });

  const [serviceContacts, setServiceContacts] = usePersistentState<ServiceContact[]>(mockServiceContacts, {
    storageKey: 'homefitly_contacts',
    syncAcrossDevices: isPremium,
    encryptData: true
  });

  const [warranties, setWarranties] = usePersistentState<Warranty[]>(mockWarranties, {
    storageKey: 'homefitly_warranties',
    syncAcrossDevices: isPremium
  });

  const [receipts, setReceipts] = usePersistentState<Receipt[]>(mockReceipts, {
    storageKey: 'homefitly_receipts',
    syncAcrossDevices: isPremium
  });

  const [documents, setDocuments] = usePersistentState<Document[]>(mockDocuments, {
    storageKey: 'homefitly_documents',
    syncAcrossDevices: isPremium
  });

  const [notificationSettings, setNotificationSettings] = useLocalStorage<INotificationSettings>('homefitly_notifications', {
    enabled: true,
    taskReminders: true,
    warrantyAlerts: true,
    maintenanceSchedule: true,
    urgentTasks: true,
    emailNotifications: true,
    pushNotifications: true,
    reminderDays: 3
  });

  // Home profile from Supabase
  const { homeProfile, loading: profileLoading, saveHomeProfile, updateHomeProfile } = useHomeProfile(user?.id);

  // Initialize default tasks for new users
  useEffect(() => {
    if (user && tasks.length === 0 && homeProfile) {
      const defaultTasks = getDefaultTasks(isPremium, homeProfile);
      setTasks(defaultTasks);
    }
  }, [user, homeProfile, isPremium, tasks.length]);

  // Setup auto-backup for premium users
  useEffect(() => {
    if (user && isPremium) {
      DataBackupManager.setupAutoBackup(() => ({
        tasks,
        checklists,
        serviceContacts,
        warranties,
        receipts,
        documents,
        notificationSettings,
        homeProfile,
        preferences: {}
      }));
    }
  }, [user, isPremium, tasks, checklists, serviceContacts, warranties, receipts, documents, notificationSettings, homeProfile]);

  // Check if user needs onboarding
  const needsOnboarding = user && !homeProfile;

  // Handle authentication success
  const handleAuthSuccess = () => {
    if (needsOnboarding) {
      setShowOnboarding(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (profile: IHomeProfile, selectedTasks: Task[]) => {
    try {
      // Save home profile to Supabase
      await saveHomeProfile(profile);
      
      // Set tasks
      setTasks(selectedTasks);
      
      // Complete onboarding
      setShowOnboarding(false);
      setActiveTab('dashboard');
      
      // Log successful onboarding
      SecurityManager.logSecurityEvent('onboarding_completed', { 
        userId: user?.id,
        tasksSelected: selectedTasks.length,
        homeType: profile.homeType
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      SecurityManager.logSecurityEvent('onboarding_failed', { 
        userId: user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Handle profile updates
  const handleProfileUpdate = async (updatedProfile: IHomeProfile) => {
    try {
      await updateHomeProfile(updatedProfile);
      
      // Generate new tasks if new features were added
      const previousFeatures = homeProfile?.features || [];
      const newFeatures = updatedProfile.features || [];
      const addedFeatures = newFeatures.filter(feature => !previousFeatures.includes(feature));
      
      if (addedFeatures.length > 0) {
        const newTasks = getDefaultTasks(isPremium, updatedProfile);
        const existingTaskTitles = tasks.map(task => task.title);
        const tasksToAdd = newTasks.filter(task => !existingTaskTitles.includes(task.title));
        
        if (tasksToAdd.length > 0) {
          setTasks(prev => [...prev, ...tasksToAdd]);
          SecurityManager.logSecurityEvent('tasks_generated_from_profile', { 
            userId: user?.id,
            addedFeatures,
            newTasksCount: tasksToAdd.length
          });
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Task management functions
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, ...updates } : task));
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Checklist management
  const handleUpdateChecklistItem = (checklistId: string, itemId: string, completed: boolean) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId 
        ? {
            ...checklist,
            items: checklist.items.map(item => 
              item.id === itemId ? { ...item, completed } : item
            )
          }
        : checklist
    ));
  };

  const handleAddChecklist = (newChecklist: Checklist) => {
    setChecklists(prev => [...prev, newChecklist]);
  };

  // Service contact management
  const handleAddContact = (contact: ServiceContact) => {
    setServiceContacts(prev => [...prev, contact]);
  };

  const handleUpdateContact = (updatedContact: ServiceContact) => {
    setServiceContacts(prev => prev.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    ));
  };

  const handleDeleteContact = (contactId: string) => {
    setServiceContacts(prev => prev.filter(contact => contact.id !== contactId));
  };

  // Show loading while checking authentication
  if (authLoading || subscriptionLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading HomeFitly</h2>
          <p className="text-gray-600">Setting up your home management platform...</p>
        </div>
      </div>
    );
  }

  // Show success page after payment
  if (authMode === 'success' && user) {
    return (
      <SuccessPage 
        onContinue={() => {
          setAuthMode('landing');
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  // Show onboarding for new users
  if (showOnboarding && user) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show authentication pages for non-authenticated users
  if (!user) {
    switch (authMode) {
      case 'login':
        return (
          <LoginPage 
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setAuthMode('signup')}
          />
        );
      case 'signup':
        return (
          <SignupPage 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        );
      default:
        return (
          <LandingPage 
            onGetStarted={() => setAuthMode('signup')}
            onSignIn={() => setAuthMode('login')}
          />
        );
    }
  }

  // Show onboarding if user hasn't completed profile setup
  if (needsOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Main application for authenticated users with profile
  const familyName = getFamilyName();
  const userPlan = isPremium ? 'premium' : 'free';

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasks}
            warranties={warranties}
            familyName={familyName}
            homeProfile={homeProfile}
          />
        );
      case 'tasks':
        return (
          <Tasks 
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onAddTask={handleAddTask}
            userPlan={userPlan}
            onShowPricing={() => setShowPricingModal(true)}
            homeProfile={homeProfile!}
          />
        );
      case 'checklists':
        return (
          <Checklists 
            checklists={checklists}
            userPlan={userPlan}
            onShowPricing={() => setShowPricingModal(true)}
            onUpdateChecklistItem={handleUpdateChecklistItem}
            onAddChecklist={handleAddChecklist}
          />
        );
      case 'warranties':
        return (
          <Warranties 
            warranties={warranties}
            userPlan={userPlan}
            onShowPricing={() => setShowPricingModal(true)}
          />
        );
      case 'receipts':
        return (
          <Receipts 
            receipts={receipts}
            userPlan={userPlan}
            onShowPricing={() => setShowPricingModal(true)}
          />
        );
      case 'documents':
        return (
          <Documents 
            documents={documents}
            userPlan={userPlan}
            onShowPricing={() => setShowPricingModal(true)}
          />
        );
      case 'contacts':
        return (
          <Services 
            serviceContacts={serviceContacts}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
          />
        );
      case 'diy':
        return (
          <DIYResources 
            resources={[]}
            userPlan={userPlan}
            onShowPricing={() => setShowPricingModal(true)}
          />
        );
      case 'profile':
        return (
          <HomeProfile 
            homeProfile={homeProfile!}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case 'settings':
        return (
          <NotificationSettings 
            settings={notificationSettings}
            onUpdateSettings={setNotificationSettings}
            tasks={tasks}
            warranties={warranties}
          />
        );
      default:
        return (
          <Dashboard 
            tasks={tasks}
            warranties={warranties}
            familyName={familyName}
            homeProfile={homeProfile}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasks={tasks}
        warranties={warranties}
        notificationSettings={notificationSettings}
        onShowPricing={() => setShowPricingModal(true)}
      />
      
      <main className="pb-16 lg:pb-0">
        {renderActiveTab()}
      </main>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        isPremium={isPremium}
        accessToken={user?.access_token}
      />
    </div>
  );
}

export default App;