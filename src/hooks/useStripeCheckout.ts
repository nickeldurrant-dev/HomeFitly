import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { STRIPE_PUBLISHABLE_KEY } from '../stripe-config';

interface CheckoutOptions {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (options: CheckoutOptions) => {
    setLoading(true);
    setError(null);

    try {
      // Get the current session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Failed to authenticate user');
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Failed to get session token');
      }

      const baseUrl = window.location.origin;
      const successUrl = options.successUrl || `${baseUrl}?success=true`;
      const cancelUrl = options.cancelUrl || `${baseUrl}`;

      console.log('Creating checkout with price_id:', options.priceId);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: options.priceId,
          mode: options.mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout response error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        console.log('Redirecting to checkout URL:', url);
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Checkout error:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error
  };
};