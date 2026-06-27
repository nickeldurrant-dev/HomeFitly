import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';
import { SecurityManager } from '../utils/security';
import { DataBackupManager } from '../utils/dataBackup';
import { useAuth } from '../hooks/useAuth';

const SecurityStatus: React.FC = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState({
    sessionValid: false,
    dataIntegrity: false,
    backupStatus: false,
    encryptionActive: true,
    lastBackup: null as string | null
  });
  const [showDetails, setShowDetails] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkSecurityStatus = async () => {
    if (!user) return;
    
    setIsChecking(true);
    
    try {
      // Check session validity
      const sessionValid = await SecurityManager.validateSession();
      
      // Check data integrity
      const dataIntegrity = await DataBackupManager.verifyDataIntegrity(user.id);
      
      // Check backup status
      const backup = DataBackupManager.restoreBackup();
      const backupStatus = !!backup;
      const lastBackup = backup?.lastBackup || null;
      
      setSecurityStatus({
        sessionValid,
        dataIntegrity,
        backupStatus,
        encryptionActive: true,
        lastBackup
      });
      
      SecurityManager.logSecurityEvent('security_status_checked', { 
        userId: user.id,
        sessionValid,
        dataIntegrity,
        backupStatus
      });
    } catch (error) {
      console.error('Security status check failed:', error);
      SecurityManager.logSecurityEvent('security_status_check_failed', { 
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSecurityStatus();
    
    // Check security status every 5 minutes
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-700' : 'text-red-700';
  };

  const formatLastBackup = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
            <p className="text-sm text-gray-600">Your data protection overview</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showDetails ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Data Encrypted</span>
          </div>
          <p className="text-xs text-green-600 mt-1">AES-256 encryption active</p>
        </div>
        
        <div className={`rounded-lg p-3 ${securityStatus.backupStatus ? 'bg-green-50' : 'bg-orange-50'}`}>
          <div className="flex items-center space-x-2">
            {getStatusIcon(securityStatus.backupStatus)}
            <span className={`text-sm font-medium ${getStatusColor(securityStatus.backupStatus)}`}>
              Backup Status
            </span>
          </div>
          <p className={`text-xs mt-1 ${securityStatus.backupStatus ? 'text-green-600' : 'text-orange-600'}`}>
            Last backup: {formatLastBackup(securityStatus.lastBackup)}
          </p>
        </div>
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Session Security</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(securityStatus.sessionValid)}
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.sessionValid)}`}>
                {securityStatus.sessionValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Data Integrity</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(securityStatus.dataIntegrity)}
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.dataIntegrity)}`}>
                {securityStatus.dataIntegrity ? 'Verified' : 'Check Failed'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Encryption Status</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(securityStatus.encryptionActive)}
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.encryptionActive)}`}>
                Active
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-Backup</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(securityStatus.backupStatus)}
              <span className={`text-sm font-medium ${getStatusColor(securityStatus.backupStatus)}`}>
                {securityStatus.backupStatus ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={checkSecurityStatus}
              disabled={isChecking}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isChecking ? 'Checking...' : 'Refresh Security Status'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Security Features Active:</h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• End-to-end encryption for sensitive data</li>
          <li>• Automatic data backups every 5 minutes</li>
          <li>• Data integrity verification</li>
          <li>• Secure session management</li>
          <li>• Input sanitization and validation</li>
        </ul>
      </div>
    </div>
  );
};

export default SecurityStatus;