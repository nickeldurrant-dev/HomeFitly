import React, { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNativeFeatures } from '../hooks/useNativeFeatures';
import { Task, Warranty } from '../types';

interface NativeNotificationsProps {
  tasks: Task[];
  warranties: Warranty[];
  enabled: boolean;
}

const NativeNotifications: React.FC<NativeNotificationsProps> = ({
  tasks,
  warranties,
  enabled
}) => {
  const { isNative, scheduleNotification } = useNativeFeatures();
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    if (isNative && enabled) {
      scheduleTaskNotifications();
      scheduleWarrantyNotifications();
    }
  }, [tasks, warranties, enabled, isNative]);

  const scheduleTaskNotifications = async () => {
    if (!enabled || !isNative) return;

    try {
      // Schedule notifications for upcoming tasks
      const upcomingTasks = tasks.filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3 && daysUntilDue >= 0;
      });

      for (const task of upcomingTasks) {
        const dueDate = new Date(task.dueDate);
        const reminderDate = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000)); // 1 day before
        
        if (reminderDate > new Date()) {
          await scheduleNotification(
            'Task Reminder',
            `${task.title} is due ${dueDate.toLocaleDateString()}`,
            reminderDate
          );
        }
      }
    } catch (error) {
      console.error('Error scheduling task notifications:', error);
    }
  };

  const scheduleWarrantyNotifications = async () => {
    if (!enabled || !isNative) return;

    try {
      // Schedule notifications for expiring warranties
      const expiringWarranties = warranties.filter(warranty => {
        const expirationDate = new Date(warranty.expirationDate);
        const now = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
      });

      for (const warranty of expiringWarranties) {
        const expirationDate = new Date(warranty.expirationDate);
        const reminderDate = new Date(expirationDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 week before
        
        if (reminderDate > new Date()) {
          await scheduleNotification(
            'Warranty Expiring',
            `${warranty.item} warranty expires on ${expirationDate.toLocaleDateString()}`,
            reminderDate
          );
        }
      }
    } catch (error) {
      console.error('Error scheduling warranty notifications:', error);
    }
  };

  if (!isNative) {
    return null; // Don't render anything for web version
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <Bell className="h-5 w-5 text-blue-600" />
        <div>
          <h4 className="font-medium text-blue-900">Native Notifications Active</h4>
          <p className="text-blue-800 text-sm">
            You'll receive push notifications for task reminders and warranty alerts
          </p>
        </div>
      </div>
    </div>
  );
};

export default NativeNotifications;