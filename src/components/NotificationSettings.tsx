import React from 'react';
import { Bell, Mail, Smartphone, Clock, Shield, CheckSquare, AlertTriangle } from 'lucide-react';
import { NotificationSettings as INotificationSettings } from '../types';
import NativeNotifications from './NativeNotifications';
import { useNativeFeatures } from '../hooks/useNativeFeatures';
import SecurityStatus from './SecurityStatus';

interface NotificationSettingsProps {
  settings: INotificationSettings;
  onUpdateSettings: (settings: INotificationSettings) => void;
  tasks?: any[];
  warranties?: any[];
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdateSettings,
  tasks = [],
  warranties = []
}) => {
  const { isNative } = useNativeFeatures();

  const handleToggle = (key: keyof INotificationSettings, value: boolean | number) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
        <p className="text-gray-600">Customize how and when you receive notifications about your home</p>
      </div>

      <div className="space-y-6">
        {/* Security Status */}
        <SecurityStatus />
        
        {/* Master Toggle */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enable Notifications</h3>
                <p className="text-sm text-gray-600">Turn all notifications on or off</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleToggle('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <CheckSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Task Reminders</p>
                  <p className="text-sm text-gray-600">Get notified about upcoming and overdue tasks</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taskReminders}
                  onChange={(e) => handleToggle('taskReminders', e.target.checked)}
                  disabled={!settings.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Warranty Alerts</p>
                  <p className="text-sm text-gray-600">Alerts when warranties are about to expire</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.warrantyAlerts}
                  onChange={(e) => handleToggle('warrantyAlerts', e.target.checked)}
                  disabled={!settings.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Maintenance Schedule</p>
                  <p className="text-sm text-gray-600">Regular maintenance reminders based on your home</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceSchedule}
                  onChange={(e) => handleToggle('maintenanceSchedule', e.target.checked)}
                  disabled={!settings.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">Urgent Tasks</p>
                  <p className="text-sm text-gray-600">Immediate alerts for urgent maintenance issues</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.urgentTasks}
                  onChange={(e) => handleToggle('urgentTasks', e.target.checked)}
                  disabled={!settings.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        {isNative && (
          <NativeNotifications 
            tasks={tasks}
            warranties={warranties}
            enabled={settings.enabled}
          />
        )}
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {isNative ? 'Push Notifications' : 'Browser Notifications'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isNative ? 'Native iOS push notifications' : 'Browser notifications on this device'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleToggle('pushNotifications', e.target.checked)}
                  disabled={!settings.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Send notifications to your email address</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleToggle('emailNotifications', e.target.checked)}
                  disabled={!settings.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Days Before Due Date
              </label>
              <select
                value={settings.reminderDays}
                onChange={(e) => handleToggle('reminderDays', parseInt(e.target.value))}
                disabled={!settings.enabled}
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>1 week before</option>
                <option value={14}>2 weeks before</option>
              </select>
              <p className="text-sm text-gray-600 mt-1">
                How many days before a task is due should we remind you?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;