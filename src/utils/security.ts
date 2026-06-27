import { supabase } from '../lib/supabase';

export class SecurityManager {
  /**
   * Simple base64 encoding for basic data obfuscation
   */
  static encryptData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.error('Encoding failed:', error);
      throw new Error('Failed to encode data');
    }
  }

  /**
   * Simple base64 decoding
   */
  static decryptData(encodedData: string): any {
    try {
      const jsonString = atob(encodedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decoding failed:', error);
      throw new Error('Failed to decode data');
    }
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Generate secure random ID
   */
  static generateSecureId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `${timestamp}-${randomPart}`;
  }

  /**
   * Hash sensitive data for comparison
   */
  static hashData(data: string): string {
    // Simple hash function for data integrity checking
    let hash = 0;
    if (data.length === 0) return hash.toString();
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Validate session token
   */
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Log security events for monitoring
   */
  static logSecurityEvent(event: string, details: any = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: this.sanitizeLogData(details),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, send to security monitoring service
    console.log('Security Event:', logEntry);
  }

  /**
   * Sanitize log data to prevent sensitive information leakage
   */
  private static sanitizeLogData(data: any): any {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'email', 'phone'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Check for suspicious activity patterns
   */
  static detectSuspiciousActivity(actions: string[]): boolean {
    // Check for rapid successive actions (potential bot)
    if (actions.length > 10) {
      const timestamps = actions.map(() => Date.now());
      const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
      if (timeSpan < 5000) { // 10 actions in 5 seconds
        this.logSecurityEvent('suspicious_rapid_actions', { actionCount: actions.length, timeSpan });
        return true;
      }
    }
    
    return false;
  }
}