import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { SecurityManager } from '../utils/security';
import { DataBackupManager } from '../utils/dataBackup';
import { supabase } from '../lib/supabase';
import { getDefaultTasks } from '../data/mockData';
import { Task } from '../types';

interface PersistentStateOptions {
  storageKey: string;
  syncAcrossDevices?: boolean;
  encryptData?: boolean;
  backupOnChange?: boolean;
}

export function usePersistentState<T>(
  initialValue: T,
  options: PersistentStateOptions
) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { storageKey, syncAcrossDevices = false, encryptData = false, backupOnChange = true } = options;
  
  // Create user-specific storage key
  const userStorageKey = user ? `${storageKey}_${user.id}` : `${storageKey}_guest`;
  
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(userStorageKey);
      if (!stored) {
        // For tasks, provide default tasks if none exist
        if (storageKey === 'homefitly_tasks' && user) {
          const defaultTasks = getDefaultTasks(isPremium) as T;
          // Save default tasks immediately
          setTimeout(() => {
            const dataToStore = encryptData ? SecurityManager.encryptData(defaultTasks) : JSON.stringify(defaultTasks);
            localStorage.setItem(userStorageKey, dataToStore);
          }, 100);
          return defaultTasks;
        }
        return initialValue;
      }
      
      // Decrypt if data was encrypted
      if (encryptData) {
        try {
          return SecurityManager.decryptData(stored);
        } catch (decryptError) {
          console.warn('Failed to decrypt stored data, using initial value');
          return initialValue;
        }
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Error loading persistent state for ${storageKey}:`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      let dataToStore: string;
      
      if (encryptData) {
        // Encrypt sensitive data before storing
        dataToStore = SecurityManager.encryptData(state);
      } else {
        dataToStore = JSON.stringify(state);
      }
      
      localStorage.setItem(userStorageKey, dataToStore);
      
      // Create backup on state change if enabled
      if (backupOnChange && user) {
        // Debounce backup creation to avoid excessive backups
        setTimeout(() => DataBackupManager.createBackup({ [storageKey]: state } as any), 1000);
      }
    } catch (error) {
      console.error(`Error saving persistent state for ${storageKey}:`, error);
      SecurityManager.logSecurityEvent('persistent_state_save_failed', { storageKey, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [state, userStorageKey, storageKey]);

  // Sync with cloud storage for premium users (if enabled)
  useEffect(() => {
    if (syncAcrossDevices && user) {
      // Implement secure cloud sync for premium users
      const syncToCloud = async () => {
        try {
          const { data: subscription } = await supabase
            .from('stripe_user_subscriptions')
            .select('subscription_status')
            .maybeSingle();
            
          if (subscription?.subscription_status === 'active') {
            await DataBackupManager.syncToCloud(user.id, { [storageKey]: state } as any);
          }
        } catch (error) {
          console.error('Cloud sync failed:', error);
        }
      };
      
      // Debounce cloud sync to avoid excessive API calls
      const timeoutId = setTimeout(syncToCloud, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [syncAcrossDevices, user, state]);

  return [state, setState] as const;
}