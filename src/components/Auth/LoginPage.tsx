import React, { useState } from 'react';
import { Eye, EyeOff, Home, Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SecurityManager } from '../../utils/security';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onBackToHome?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToSignup, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for too many failed attempts
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      setError('Too many failed attempts. Please wait 15 minutes before trying again.');
      SecurityManager.logSecurityEvent('login_blocked', { email, attempts: loginAttempts });
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Validate input
      if (!SecurityManager.isValidEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      // Sanitize input
      const sanitizedEmail = SecurityManager.sanitizeInput(email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        setLoginAttempts(prev => prev + 1);
        SecurityManager.logSecurityEvent('login_failed', { 
          email: sanitizedEmail, 
          error: error.message,
          attempts: loginAttempts + 1
        });
        // Provide user-friendly messages for common errors
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('type error') || msg === 'typeerror') {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else if (msg.includes('invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(error.message);
        }
      } else {
        setLoginAttempts(0);
        SecurityManager.logSecurityEvent('login_success', { email: sanitizedEmail });
        onSuccess();
      }
    } catch (err) {
      setLoginAttempts(prev => prev + 1);
      SecurityManager.logSecurityEvent('login_error', { 
        email, 
        error: 'Unexpected error',
        attempts: loginAttempts + 1
      });
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');
    if (!email.trim()) {
      setError('Please enter your email address first so we can send the reset link.');
      return;
    }
    if (!SecurityManager.isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        SecurityManager.sanitizeInput(email)
      );
      if (error) {
        setError(error.message);
      } else {
        setResetMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Reset block after 15 minutes
  React.useEffect(() => {
    if (isBlocked) {
      const timer = setTimeout(() => {
        setIsBlocked(false);
        setLoginAttempts(0);
      }, 15 * 60 * 1000); // 15 minutes
      
      return () => clearTimeout(timer);
    }
  }, [isBlocked]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-clay-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to home */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors mb-6"
          >
            ← Back to home
          </button>
        )}
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Home className="h-8 w-8 text-brand-600" />
            <span className="text-2xl font-bold text-gray-900">HomeFitly</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
                {loginAttempts > 2 && !isBlocked && (
                  <p className="text-red-600 text-xs mt-1">
                    {5 - loginAttempts} attempts remaining before temporary lockout
                  </p>
                )}
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">{resetMessage}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(SecurityManager.sanitizeInput(e.target.value))}
                  required
                  disabled={isBlocked}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isBlocked}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSendingReset || isBlocked}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors disabled:opacity-50"
                >
                  {isSendingReset ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isBlocked}
              className="w-full bg-brand-600 text-white py-3 px-4 rounded-lg hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isBlocked ? (
                <span>Account Temporarily Locked</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            🔒 Secure login with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;