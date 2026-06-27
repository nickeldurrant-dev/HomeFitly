import { useState, useEffect } from 'react';
import { AppNotification, Task, Warranty, NotificationSettings } from '../types';

export const useNotifications = (
  tasks: Task[],
  warranties: Warranty[],
  settings: NotificationSettings
) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  // Generate notifications based on tasks and warranties
  const generateNotifications = () => {
    if (!settings.enabled) return [];

    const newNotifications: AppNotification[] = [];
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(now.getDate() + settings.reminderDays);

    // Task reminders
    if (settings.taskReminders) {
      tasks.forEach(task => {
        if (!task.completed && new Date(task.dueDate) <= reminderDate) {
          const isOverdue = new Date(task.dueDate) < now;
          newNotifications.push({
            id: `task-${task.id}`,
            type: task.priority === 'urgent' ? 'urgent' : 'task',
            title: isOverdue ? 'Overdue Task' : 'Task Reminder',
            message: `${task.title} is ${isOverdue ? 'overdue' : `due ${new Date(task.dueDate).toLocaleDateString()}`}`,
            timestamp: now.toISOString(),
            read: false,
            actionUrl: '/tasks'
          });
        }
      });
    }

    // Warranty alerts
    if (settings.warrantyAlerts) {
      warranties.forEach(warranty => {
        const expirationDate = new Date(warranty.expirationDate);
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
          newNotifications.push({
            id: `warranty-${warranty.id}`,
            type: 'warranty',
            title: 'Warranty Expiring Soon',
            message: `${warranty.item} warranty expires in ${daysUntilExpiration} days`,
            timestamp: now.toISOString(),
            read: false,
            actionUrl: '/warranties'
          });
        }
      });
    }

    // Urgent task alerts
    if (settings.urgentTasks) {
      const urgentTasks = tasks.filter(task => !task.completed && task.priority === 'urgent');
      if (urgentTasks.length > 0) {
        newNotifications.push({
          id: 'urgent-tasks',
          type: 'urgent',
          title: 'Urgent Tasks Need Attention',
          message: `You have ${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''} pending`,
          timestamp: now.toISOString(),
          read: false,
          actionUrl: '/tasks'
        });
      }
    }

    return newNotifications;
  };

  // Send browser notification
  const sendBrowserNotification = (notification: AppNotification) => {
    if (permission === 'granted' && settings.pushNotifications) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Update notifications when tasks or warranties change
  useEffect(() => {
    const newNotifications = generateNotifications();
    setNotifications(newNotifications);
    
    // Send browser notifications for new urgent items
    newNotifications
      .filter(n => n.type === 'urgent')
      .forEach(sendBrowserNotification);
  }, [tasks, warranties, settings]);

  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    requestPermission,
    markAsRead,
    clearAll,
    permission
  };
};