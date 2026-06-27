import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache subscription status locally to prevent loss during updates
  const [cachedSubscription, setCachedSubscription] = useLocalStorage<SubscriptionData | null>('homefitly_subscription_cache', null);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage<number>('homefitly_subscription_sync', 0);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      
      // First get the current user
      let user, userError;
      try {
        const result = await supabase.auth.getUser();
        user = result.data.user;
        userError = result.error;
      } catch (fetchError) {
        console.warn('Supabase connection failed - using cached data or demo mode');
        if (cachedSubscription && Date.now() - lastSyncTime < 24 * 60 * 60 * 1000) {
          setSubscription(cachedSubscription);
        } else {
          setSubscription(null);
        }
        setError(null);
        setLoading(false);
        return;
      }
      
      if (userError) {
        console.warn('Auth error or demo mode:', userError.message);
        setSubscription(null);
        setError(null);
        setLoading(false);
        return;
      }
      
      if (!user) {
        setSubscription(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Get customer data for the user
      let customerData, customerError;
      try {
        const result = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle();
        customerData = result.data;
        customerError = result.error;
      } catch (fetchError) {
        console.warn('Customer data fetch failed or demo mode, using cached subscription');
        if (cachedSubscription && Date.now() - lastSyncTime < 24 * 60 * 60 * 1000) {
          setSubscription(cachedSubscription);
        } else {
          setSubscription(null);
        }
        setError(null);
        setLoading(false);
        return;
      }

      if (customerError) {
        console.warn('Customer fetch error:', customerError.message);
        setError(null); // Don't show error for missing customer data
        setSubscription(null);
        setLoading(false);
        return;
      }

      if (!customerData) {
        setSubscription(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Get subscription data for the customer
      let data, subscriptionError;
      try {
        const result = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('customer_id', customerData.customer_id)
          .is('deleted_at', null)
          .maybeSingle();
        data = result.data;
        subscriptionError = result.error;
      } catch (fetchError) {
        console.warn('Subscription data fetch failed or demo mode, using cached subscription');
        if (cachedSubscription && Date.now() - lastSyncTime < 24 * 60 * 60 * 1000) {
          setSubscription(cachedSubscription);
        } else {
          setSubscription(null);
        }
        setError(null);
        setLoading(false);
        return;
      }

      if (subscriptionError) {
        console.warn('Subscription fetch error:', subscriptionError.message);
        setError(null); // Don't show error for missing subscription data
        setSubscription(null);
      } else {
        setSubscription(data);
        setCachedSubscription(data);
        setLastSyncTime(Date.now());
        setError(null);
      }
    } catch (err) {
      console.warn('Subscription fetch failed:', err);
      setError(null); // Don't show error to user for network issues
      // Use cached subscription if available during network issues
      if (cachedSubscription && Date.now() - lastSyncTime < 24 * 60 * 60 * 1000) { // 24 hours
        setSubscription(cachedSubscription);
        setError(null);
      } else {
        setSubscription(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use cached subscription immediately if available
    if (cachedSubscription && Date.now() - lastSyncTime < 24 * 60 * 60 * 1000) {
      setSubscription(cachedSubscription);
      setLoading(false);
    }
    
    fetchSubscription();
    
    // Set up real-time subscription to listen for subscription changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_subscriptions'
        },
        () => {
          // Refetch subscription data when changes occur
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isPremium = () => {
    return subscription?.subscription_status === 'active' || 
           subscription?.subscription_status === 'trialing';
  };

  const getProductInfo = () => {
    if (subscription?.price_id) {
      return getProductByPriceId(subscription.price_id);
    }
    return null;
  };

  const isExpiringSoon = () => {
    if (!subscription?.current_period_end) return false;
    const expirationDate = new Date(subscription.current_period_end * 1000);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7;
  };

  return {
    subscription,
    loading,
    error,
    isPremium: isPremium(),
    productInfo: getProductInfo(),
    isExpiringSoon: isExpiringSoon(),
    refetch: fetchSubscription
  };
};