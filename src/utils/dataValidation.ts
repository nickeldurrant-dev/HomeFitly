import { Task, ServiceContact, HomeProfile, NotificationSettings } from '../types';
import { SecurityManager } from './security';

export class DataValidator {
  /**
   * Validate task data structure and content
   */
  static validateTask(task: any): task is Task {
    if (!task || typeof task !== 'object') return false;
    
    const requiredFields = ['id', 'title', 'description', 'category', 'priority', 'dueDate'];
    const validCategories = ['maintenance', 'cleaning', 'seasonal', 'repair', 'upgrade'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in task) || task[field] === null || task[field] === undefined) {
        return false;
      }
    }
    
    // Validate field types and values
    if (typeof task.id !== 'string' || task.id.length === 0) return false;
    if (typeof task.title !== 'string' || task.title.length === 0) return false;
    if (typeof task.description !== 'string') return false;
    if (!validCategories.includes(task.category)) return false;
    if (!validPriorities.includes(task.priority)) return false;
    if (typeof task.completed !== 'boolean') return false;
    if (typeof task.estimatedTime !== 'number' || task.estimatedTime < 0) return false;
    if (typeof task.points !== 'number' || task.points < 0) return false;
    
    // Validate date format
    if (isNaN(Date.parse(task.dueDate))) return false;
    
    return true;
  }
  
  /**
   * Validate service contact data
   */
  static validateServiceContact(contact: any): contact is ServiceContact {
    if (!contact || typeof contact !== 'object') return false;
    
    const requiredFields = ['id', 'name', 'category', 'phone', 'services', 'tags', 'isFavorite', 'addedDate'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in contact)) return false;
    }
    
    // Validate field types and values
    if (typeof contact.id !== 'string' || contact.id.length === 0) return false;
    if (typeof contact.name !== 'string' || contact.name.length === 0) return false;
    if (typeof contact.category !== 'string' || contact.category.length === 0) return false;
    if (typeof contact.phone !== 'string' || !SecurityManager.isValidPhone(contact.phone)) return false;
    if (!Array.isArray(contact.services)) return false;
    if (!Array.isArray(contact.tags)) return false;
    if (typeof contact.isFavorite !== 'boolean') return false;
    
    // Validate email if provided
    if (contact.email && !SecurityManager.isValidEmail(contact.email)) return false;
    
    // Validate date format
    if (isNaN(Date.parse(contact.addedDate))) return false;
    
    return true;
  }
  
  /**
   * Validate home profile data
   */
  static validateHomeProfile(profile: any): profile is HomeProfile {
    if (!profile || typeof profile !== 'object') return false;
    
    const requiredFields = ['address', 'familyName', 'features', 'notificationSettings'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in profile)) return false;
    }
    
    // Validate field types
    if (typeof profile.address !== 'string' || profile.address.length === 0) return false;
    if (typeof profile.familyName !== 'string' || profile.familyName.length === 0) return false;
    if (!Array.isArray(profile.features)) return false;
    
    // Validate optional numeric fields
    if (profile.yearBuilt !== null && (typeof profile.yearBuilt !== 'number' || profile.yearBuilt < 1800 || profile.yearBuilt > new Date().getFullYear())) return false;
    if (profile.squareFootage !== null && (typeof profile.squareFootage !== 'number' || profile.squareFootage < 0)) return false;
    if (profile.bedrooms !== null && (typeof profile.bedrooms !== 'number' || profile.bedrooms < 0)) return false;
    if (profile.bathrooms !== null && (typeof profile.bathrooms !== 'number' || profile.bathrooms < 0)) return false;
    
    // Validate home type if provided
    const validHomeTypes = ['single-family', 'townhouse', 'condo', 'apartment'];
    if (profile.homeType !== null && !validHomeTypes.includes(profile.homeType)) return false;
    
    // Validate notification settings
    if (!this.validateNotificationSettings(profile.notificationSettings)) return false;
    
    return true;
  }
  
  /**
   * Validate notification settings
   */
  static validateNotificationSettings(settings: any): settings is NotificationSettings {
    if (!settings || typeof settings !== 'object') return false;
    
    const requiredBooleanFields = [
      'enabled', 'taskReminders', 'warrantyAlerts', 'maintenanceSchedule',
      'urgentTasks', 'emailNotifications', 'pushNotifications'
    ];
    
    // Check boolean fields
    for (const field of requiredBooleanFields) {
      if (typeof settings[field] !== 'boolean') return false;
    }
    
    // Validate reminder days
    if (typeof settings.reminderDays !== 'number' || settings.reminderDays < 1 || settings.reminderDays > 30) return false;
    
    return true;
  }
  
  /**
   * Sanitize and validate user input data
   */
  static sanitizeUserData<T>(data: T): T {
    if (typeof data === 'string') {
      return SecurityManager.sanitizeInput(data) as T;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeUserData(item)) as T;
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeUserData(value);
      }
      return sanitized as T;
    }
    
    return data;
  }
  
  /**
   * Validate data size to prevent storage abuse
   */
  static validateDataSize(data: any, maxSizeKB: number = 1024): boolean {
    try {
      const jsonString = JSON.stringify(data);
      const sizeKB = new Blob([jsonString]).size / 1024;
      
      if (sizeKB > maxSizeKB) {
        SecurityManager.logSecurityEvent('data_size_exceeded', { 
          sizeKB: Math.round(sizeKB), 
          maxSizeKB 
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Data size validation failed:', error);
      return false;
    }
  }
  
  /**
   * Check for potentially malicious data patterns
   */
  static detectMaliciousPatterns(data: any): boolean {
    const jsonString = JSON.stringify(data);
    
    // Check for script injection attempts
    const scriptPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /function\(/i,
      /setTimeout/i,
      /setInterval/i
    ];
    
    for (const pattern of scriptPatterns) {
      if (pattern.test(jsonString)) {
        SecurityManager.logSecurityEvent('malicious_pattern_detected', { 
          pattern: pattern.toString() 
        });
        return true;
      }
    }
    
    return false;
  }
}