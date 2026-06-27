import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { SecurityManager } from '../utils/security';

interface UserWithMetadata extends User {
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    family_name?: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithMetadata | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        let session, error;
        try {
          const result = await supabase.auth.getSession();
          session = result.data.session;
          error = result.error;
        } catch (fetchError) {
          console.warn('Supabase connection failed or demo mode');
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (error) {
          console.error('Session retrieval error:', error);
          SecurityManager.logSecurityEvent('session_retrieval_failed', { error: error.message });
        }
        
        setUser(session?.user ?? null);
        setSession(session);
        
        if (session?.user) {
          SecurityManager.logSecurityEvent('session_restored', { userId: session.user.id });
        }
      } catch (error) {
        console.error('Unexpected session error:', error);
        SecurityManager.logSecurityEvent('session_unexpected_error', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        SecurityManager.logSecurityEvent('auth_state_change', { 
          event, 
          userId: session?.user?.id 
        });
        
        setUser(session?.user ?? null);
        setSession(session);
        setLoading(false);
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            SecurityManager.logSecurityEvent('user_signed_in', { userId: session?.user?.id });
            break;
          case 'SIGNED_OUT':
            SecurityManager.logSecurityEvent('user_signed_out');
            // Clear sensitive data on sign out
            localStorage.removeItem('homefitly_tasks_' + session?.user?.id);
            localStorage.removeItem('homefitly_contacts_' + session?.user?.id);
            break;
          case 'TOKEN_REFRESHED':
            SecurityManager.logSecurityEvent('token_refreshed', { userId: session?.user?.id });
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const currentUserId = user?.id;
      await supabase.auth.signOut();
      
      // Clear all user-specific data from localStorage
      if (currentUserId) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes(currentUserId)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      SecurityManager.logSecurityEvent('user_signed_out_success', { userId: currentUserId });
    } catch (error) {
      console.error('Sign out error:', error);
      SecurityManager.logSecurityEvent('sign_out_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const getFamilyName = () => {
    const familyName = user?.user_metadata?.family_name || user?.user_metadata?.last_name || 'Your Family';
    return SecurityManager.sanitizeInput(familyName);
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
    getFamilyName
  };
};