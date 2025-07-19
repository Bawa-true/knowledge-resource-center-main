import { useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// User profile interface matching new database schema
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  join_date: string;
  last_login?: string;
  is_logged_in: boolean;
  created_at: string;
  updated_at: string;
}

// Profile interface for the profiles table
interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  staff_pin?: string;
  role: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setProfile(data);
    return { data, error: null };
  }, []);

  // Create user profile (for new users)
  const createProfile = useCallback(async (user: User, profileData: { name: string; role: string; email?: string; staff_pin?: string }) => {
    setLoading(true);
    setError(null);
    
    // The trigger should have already created the user entry, so we just need to update it
    // and create the profile entry if it doesn't exist
    const userUpdate = {
      name: profileData.name,
      role: profileData.role,
    };

    const { data: userData, error: userError } = await supabase
      .from('users')
      .update(userUpdate)
      .eq('id', user.id)
      .select()
      .single();

    if (userError) {
      setLoading(false);
      setError(userError.message);
      return { data: null, error: userError };
    }

    // Create profile entry
    const newProfile = {
      user_id: user.id,
      full_name: profileData.name,
      role: profileData.role,
      email: user.email!,
      staff_pin: profileData.staff_pin || null,
    };

    const { data: profileResult, error: profileError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    setLoading(false);
    
    if (profileError) {
      setError(profileError.message);
      return { data: null, error: profileError };
    }
    
    setProfile(userData);
    return { data: userData, error: null };
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setProfile(data);
    return { data, error: null };
  }, []);

  // Update last login
  const updateLastLogin = useCallback(async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        is_logged_in: true 
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update last login:', error);
    }
  }, []);

  // Get all users (admin only)
  const getAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  }, []);

  // Get user profile data
  const getUserProfile = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  }, []);

  // Update profile data
  const updateUserProfile = useCallback(async (userId: string, updates: Partial<Profile>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    updateLastLogin,
    getAllUsers,
    getUserProfile,
    updateUserProfile,
  };
} 