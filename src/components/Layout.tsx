import React from 'react';
import { Home, CheckSquare, Shield, Users, BookOpen, User, Settings, Crown, ListChecks, Receipt, FileText, LogOut, TrendingUp } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Task, Warranty, NotificationSettings } from '../types';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tasks: Task[];
  warranties: Warranty[];
  notificationSettings: NotificationSettings;
  onShowPricing: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  activeTab, 
  setActiveTab, 
  tasks, 
  warranties, 
  notificationSettings,
  onShowPricing
}) => {
  const { user, signOut } = useAuth();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const { subscription } = useSubscription();
  
  // Track premium status to prevent loss during updates
  const [premiumStatusCache, setPremiumStatusCache] = useLocalStorage('homefitly_premium_status', false);
  
  // Update cache when premium status changes
  React.useEffect(() => {
    if (!subscriptionLoading) {
      setPremiumStatusCache(isPremium);
    }
  }, [isPremium, subscriptionLoading, setPremiumStatusCache]);
  
  // Use cached status during loading to prevent UI flicker
  const displayPremiumStatus = subscriptionLoading ? premiumStatusCache : isPremium;

  const {
    notifications,
    unreadCount,
    requestPermission,
    markAsRead,
    clearAll,
    permission
  } = useNotifications(tasks, warranties, notificationSettings);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'checklists', label: 'Checklists', icon: ListChecks },
    { id: 'warranties', label: 'Warranties', icon: Shield },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'diy', label: 'DIY Resources', icon: BookOpen },
    { id: 'profile', label: 'Home Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-2xl font-bold text-gray-900">HomeFitly</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onClearAll={clearAll}
              onRequestPermission={requestPermission}
              permission={permission}
            />
            
            {/* Upgrade Button for Free Users */}
            {!subscriptionLoading && !displayPremiumStatus && (
              <button
                onClick={onShowPricing}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 shadow-sm"
              >
                <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Upgrade</span>
                <span className="sm:hidden">Pro</span>
              </button>
            )}
            
            {/* Premium Badge for Premium Users */}
            {!subscriptionLoading && displayPremiumStatus && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 shadow-sm">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Premium</span>
                <span className="sm:hidden">Pro</span>
              </div>
            )}
          
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.email}
              </span>
              <button onClick={signOut} className="text-gray-400 hover:text-gray-600 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
          <div className="hidden lg:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isPremiumTab = tab.premium && !displayPremiumStatus;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isPremiumTab) {
                      onShowPricing();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : isPremiumTab
                      ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {isPremiumTab && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => {
                const selectedTab = tabs.find(tab => tab.id === e.target.value);
                if (selectedTab?.premium && !displayPremiumStatus) {
                  onShowPricing();
                } else {
                  setActiveTab(e.target.value);
                }
              }}
              className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}{tab.premium && !displayPremiumStatus ? ' (Premium)' : ''}
                </option>
              ))}
            </select>
          </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-5 gap-1">
            {tabs.slice(0, 5).map((tab) => {
              const Icon = tab.icon;
              const isPremiumTab = tab.premium && !displayPremiumStatus;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isPremiumTab) {
                      onShowPricing();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50'
                      : isPremiumTab
                      ? 'text-gray-400 hover:text-gray-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="truncate">{tab.label.split(' ')[0]}</span>
                  {isPremiumTab && (
                    <Crown className="h-2 w-2 text-yellow-500 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {tabs.slice(5).map((tab) => {
              const Icon = tab.icon;
              const isPremiumTab = tab.premium && !displayPremiumStatus;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isPremiumTab) {
                      onShowPricing();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50'
                      : isPremiumTab
                      ? 'text-gray-400 hover:text-gray-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="truncate">{tab.label.split(' ')[0]}</span>
                  {isPremiumTab && (
                    <Crown className="h-2 w-2 text-yellow-500 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Layout;