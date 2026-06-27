import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HomeProfile } from '../types';

export const useHomeProfile = (userId?: string) => {
  const [homeProfile, setHomeProfile] = useState<HomeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('home_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setHomeProfile(null);
      } else {
        setHomeProfile(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch home profile');
      setHomeProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const saveHomeProfile = async (profile: HomeProfile) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const profileData = {
        user_id: userId,
        address: profile.address,
        family_name: profile.familyName,
        year_built: profile.yearBuilt,
        square_footage: profile.squareFootage,
        bedrooms: profile.bedrooms,
        bathrooms: profile.bathrooms,
        home_type: profile.homeType,
        lot_size: profile.lotSize,
        features: profile.features,
        notification_settings: profile.notificationSettings
      };

      const { data, error } = await supabase
        .from('home_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setHomeProfile(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save home profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateHomeProfile = async (updates: Partial<HomeProfile>) => {
    if (!userId || !homeProfile) {
      throw new Error('User ID and existing profile are required');
    }

    try {
      const { data, error } = await supabase
        .from('home_profiles')
        .update({
          address: updates.address ?? homeProfile.address,
          family_name: updates.familyName ?? homeProfile.familyName,
          year_built: updates.yearBuilt ?? homeProfile.yearBuilt,
          square_footage: updates.squareFootage ?? homeProfile.squareFootage,
          bedrooms: updates.bedrooms ?? homeProfile.bedrooms,
          bathrooms: updates.bathrooms ?? homeProfile.bathrooms,
          home_type: updates.homeType ?? homeProfile.homeType,
          lot_size: updates.lotSize ?? homeProfile.lotSize,
          features: updates.features ?? homeProfile.features,
          notification_settings: updates.notificationSettings ?? homeProfile.notificationSettings
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setHomeProfile(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update home profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchHomeProfile();
  }, [userId]);

  return {
    homeProfile,
    loading,
    error,
    saveHomeProfile,
    updateHomeProfile,
    refetch: fetchHomeProfile
  };
};