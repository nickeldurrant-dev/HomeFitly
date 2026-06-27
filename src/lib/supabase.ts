import { createClient } from '@supabase/supabase-js';
import { SecurityManager } from '../utils/security';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
                            supabaseAnonKey && 
                            supabaseUrl.startsWith('https://') && 
                            supabaseUrl.includes('.supabase.co');

// Create a complete mock client that prevents all network requests
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Demo mode - Please connect to Supabase to enable authentication' } 
    }),
    signUp: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Demo mode - Please connect to Supabase to enable authentication' } 
    }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ 
      data: { 
        subscription: { 
          unsubscribe: () => {} 
        } 
      } 
    })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        is: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } })
        }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } })
      }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
      order: () => ({
        limit: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } })
        })
      })
    }),
    upsert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } })
      }),
      onConflict: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } })
        })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: { message: 'Demo mode' } })
    })
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => {}
    }),
    subscribe: () => {}
  }),
  removeChannel: () => {}
});

let supabase: any;

if (!isSupabaseConfigured) {
  console.warn('Supabase not configured - running in demo mode');
  supabase = createMockClient();
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'homefitly-web-app'
        }
      }
    });

    // Add security monitoring to Supabase client
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      SecurityManager.logSecurityEvent('supabase_auth_event', { 
        event, 
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.warn('Failed to create Supabase client, falling back to demo mode');
    supabase = createMockClient();
  }
}

export { supabase };