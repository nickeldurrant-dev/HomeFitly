import { Task, Checklist, ServiceContact, NotificationSettings, HomeProfile } from '../types';
import { supabase } from '../lib/supabase';
import { SecurityManager } from './security';

interface UserData {
  tasks: Task[];
  checklists: Checklist[];
  serviceContacts: ServiceContact[];
  notificationSettings: NotificationSettings;
  homeProfile: HomeProfile | null;
  preferences: any;
  version: string;
  lastBackup: string;
}

interface BackupMetadata {
  version: string;
  timestamp: string;
  checksum: string;
  encrypted: boolean;
}

interface UserData {
  tasks: Task[];
  checklists: Checklist[];
  serviceContacts: ServiceContact[];
  notificationSettings: NotificationSettings;
  homeProfile: HomeProfile | null;
  preferences: any;
  version: string;
  lastBackup: string;
}

interface BackupMetadata {
  version: string;
  timestamp: string;
  checksum: string;
  encrypted: boolean;
}

export class DataBackupManager {
  private static readonly BACKUP_KEY = 'homefitly_backup';
  private static readonly BACKUP_METADATA_KEY = 'homefitly_backup_metadata';
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_LOCAL_BACKUPS = 5;
  private static readonly BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Create a complete backup of user data
   */
  static createBackup(data: Omit<UserData, 'version' | 'lastBackup'>): boolean {
    try {
      const backup: UserData = {
        ...data,
        version: this.VERSION,
        lastBackup: new Date().toISOString()
      };

      // Create checksum for data integrity
      const checksum = SecurityManager.hashData(JSON.stringify(backup));
      
      // Encrypt sensitive data
      const encryptedBackup = SecurityManager.encryptData(backup);
      
      // Store backup with metadata
      const metadata: BackupMetadata = {
        version: this.VERSION,
        timestamp: backup.lastBackup,
        checksum,
        encrypted: true
      };
      
      // Manage backup rotation (keep only last 5 backups)
      this.rotateBackups();
      
      localStorage.setItem(this.BACKUP_KEY, encryptedBackup);
      localStorage.setItem(this.BACKUP_METADATA_KEY, JSON.stringify(metadata));
      
      console.log('Data backup created successfully');
      SecurityManager.logSecurityEvent('backup_created', { version: this.VERSION });
      return true;
    } catch (error) {
      console.error('Failed to create data backup:', error);
      SecurityManager.logSecurityEvent('backup_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  /**
   * Restore data from backup
   */
  static restoreBackup(): UserData | null {
    try {
      const encryptedBackup = localStorage.getItem(this.BACKUP_KEY);
      const metadataString = localStorage.getItem(this.BACKUP_METADATA_KEY);
      
      if (!encryptedBackup || !metadataString) {
        console.log('No backup found');
        return null;
      }
      
      const metadata: BackupMetadata = JSON.parse(metadataString);
      
      // Decrypt backup data
      const backup: UserData = SecurityManager.decryptData(encryptedBackup);
      
      // Verify data integrity
      const currentChecksum = SecurityManager.hashData(JSON.stringify(backup));
      if (currentChecksum !== metadata.checksum) {
        console.error('Backup data integrity check failed');
        SecurityManager.logSecurityEvent('backup_integrity_failed', { 
          expected: metadata.checksum, 
          actual: currentChecksum 
        });
        return null;
      }

      // Validate backup version compatibility
      if (this.isCompatibleVersion(backup.version)) {
        console.log('Data restored from backup successfully');
        SecurityManager.logSecurityEvent('backup_restored', { version: backup.version });
        return backup;
      } else {
        console.warn('Backup version incompatible, skipping restore');
        SecurityManager.logSecurityEvent('backup_version_incompatible', { 
          backupVersion: backup.version, 
          currentVersion: this.VERSION 
        });
        return null;
      }
    } catch (error) {
      console.error('Failed to restore data backup:', error);
      SecurityManager.logSecurityEvent('backup_restore_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Rotate backups to prevent storage overflow
   */
  private static rotateBackups(): void {
    try {
      const backupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('homefitly_backup_')) {
          backupKeys.push(key);
        }
      }
      
      // Sort by timestamp and remove oldest if we have too many
      if (backupKeys.length >= this.MAX_LOCAL_BACKUPS) {
        backupKeys.sort();
        const toRemove = backupKeys.slice(0, backupKeys.length - this.MAX_LOCAL_BACKUPS + 1);
        toRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Failed to rotate backups:', error);
    }
  }

  /**
   * Check if backup version is compatible
   */
  private static isCompatibleVersion(backupVersion: string): boolean {
    const [backupMajor, backupMinor] = backupVersion.split('.').map(Number);
    const [currentMajor, currentMinor] = this.VERSION.split('.').map(Number);
    
    // Accept same major version or newer minor versions
    if (backupMajor === currentMajor) {
      return backupMinor <= currentMinor;
    }
    
    // For major version differences, implement migration logic
    return this.migrateData(backupVersion);
  }
  
  /**
   * Migrate data between versions
   */
  private static migrateData(fromVersion: string): boolean {
    // Implement version-specific migration logic here
    console.log(`Migrating data from version ${fromVersion} to ${this.VERSION}`);
    SecurityManager.logSecurityEvent('data_migration', { fromVersion, toVersion: this.VERSION });
    return true;
  }

  /**
   * Sync data to cloud for premium users
   */
  static async syncToCloud(userId: string, data: UserData): Promise<boolean> {
    try {
      // Validate session before cloud sync
      const isValidSession = await SecurityManager.validateSession();
      if (!isValidSession) {
        throw new Error('Invalid session for cloud sync');
      }
      
      // Encrypt data before cloud storage
      const encryptedData = SecurityManager.encryptData(data);
      const checksum = SecurityManager.hashData(JSON.stringify(data));
      
      const { error } = await supabase
        .from('user_data_backups')
        .upsert({
          user_id: userId,
          data: encryptedData,
          checksum,
          version: this.VERSION,
          encrypted: true,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Cloud sync failed:', error);
        SecurityManager.logSecurityEvent('cloud_sync_failed', { error: error.message });
        return false;
      }

      console.log('Data synced to cloud successfully');
      SecurityManager.logSecurityEvent('cloud_sync_success', { userId });
      return true;
    } catch (error) {
      console.error('Cloud sync error:', error);
      SecurityManager.logSecurityEvent('cloud_sync_error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  /**
   * Restore data from cloud for premium users
   */
  static async restoreFromCloud(userId: string): Promise<UserData | null> {
    try {
      // Validate session before cloud restore
      const isValidSession = await SecurityManager.validateSession();
      if (!isValidSession) {
        throw new Error('Invalid session for cloud restore');
      }
      
      const { data, error } = await supabase
        .from('user_data_backups')
        .select('data, checksum, encrypted')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.log('No cloud backup found');
        return null;
      }

      // Decrypt data if encrypted
      let restoredData: UserData;
      if (data.encrypted) {
        restoredData = SecurityManager.decryptData(data.data);
      } else {
        restoredData = data.data as UserData;
      }
      
      // Verify data integrity if checksum available
      if (data.checksum) {
        const currentChecksum = SecurityManager.hashData(JSON.stringify(restoredData));
        if (currentChecksum !== data.checksum) {
          console.error('Cloud backup data integrity check failed');
          SecurityManager.logSecurityEvent('cloud_backup_integrity_failed', { userId });
          return null;
        }
      }
      
      console.log('Data restored from cloud successfully');
      SecurityManager.logSecurityEvent('cloud_restore_success', { userId });
      return restoredData;
    } catch (error) {
      console.error('Cloud restore error:', error);
      SecurityManager.logSecurityEvent('cloud_restore_error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Auto-backup data periodically
   */
  static setupAutoBackup(getData: () => Omit<UserData, 'version' | 'lastBackup'>) {
    // Backup every 5 minutes with security checks
    setInterval(() => {
      try {
        const data = getData();
        this.createBackup(data);
      } catch (error) {
        console.error('Auto-backup failed:', error);
        SecurityManager.logSecurityEvent('auto_backup_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }, this.BACKUP_INTERVAL);

    // Backup on page unload
    window.addEventListener('beforeunload', () => {
      try {
        const data = getData();
        this.createBackup(data);
      } catch (error) {
        console.error('Unload backup failed:', error);
      }
    });
    
    // Backup on visibility change (app backgrounded)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        try {
          const data = getData();
          this.createBackup(data);
        } catch (error) {
          console.error('Visibility backup failed:', error);
        }
      }
    });
  }
  
  /**
   * Create emergency backup before critical operations
   */
  static createEmergencyBackup(data: Omit<UserData, 'version' | 'lastBackup'>, reason: string): boolean {
    try {
      const emergencyKey = `${this.BACKUP_KEY}_emergency_${Date.now()}`;
      const backup: UserData = {
        ...data,
        version: this.VERSION,
        lastBackup: new Date().toISOString()
      };
      
      const encryptedBackup = SecurityManager.encryptData(backup);
      localStorage.setItem(emergencyKey, encryptedBackup);
      
      SecurityManager.logSecurityEvent('emergency_backup_created', { reason });
      return true;
    } catch (error) {
      console.error('Emergency backup failed:', error);
      SecurityManager.logSecurityEvent('emergency_backup_failed', { reason, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }
  
  /**
   * Verify data integrity across all storage locations
   */
  static async verifyDataIntegrity(userId: string): Promise<boolean> {
    try {
      const localBackup = this.restoreBackup();
      const cloudBackup = await this.restoreFromCloud(userId);
      
      if (!localBackup && !cloudBackup) {
        return true; // No data to verify
      }
      
      if (localBackup && cloudBackup) {
        // Compare checksums
        const localChecksum = SecurityManager.hashData(JSON.stringify(localBackup));
        const cloudChecksum = SecurityManager.hashData(JSON.stringify(cloudBackup));
        
        if (localChecksum !== cloudChecksum) {
          SecurityManager.logSecurityEvent('data_integrity_mismatch', { 
            localChecksum, 
            cloudChecksum 
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Data integrity verification failed:', error);
      SecurityManager.logSecurityEvent('integrity_verification_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }
}