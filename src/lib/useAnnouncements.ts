import { useState, useCallback } from 'react';
import { supabase } from './supabase';

// Announcement interface matching our database schema
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: 'all' | '500 level' | '400 level' | '300 level';
  status: 'active' | 'inactive' | 'expired';
  is_pinned: boolean;
  author_id?: string;
  expiry_date?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all active announcements
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setAnnouncements(data || []);
    return { data, error: null };
  }, []);

  // Fetch announcements by target audience
  const fetchAnnouncementsByAudience = useCallback(async (targetAudience: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('target_audience', targetAudience)
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setAnnouncements(data || []);
    return { data, error: null };
  }, []);

  // Create new announcement
  const createAnnouncement = useCallback(async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcementData)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    // Update local state
    setAnnouncements(prev => [data, ...prev]);
    return { data, error: null };
  }, []);

  // Update announcement
  const updateAnnouncement = useCallback(async (announcementId: string, updates: Partial<Announcement>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', announcementId)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    // Update local state
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === announcementId ? data : announcement
    ));
    return { data, error: null };
  }, []);

  // Delete announcement (soft delete)
  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('announcements')
      .update({ status: 'inactive' })
      .eq('id', announcementId);

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    // Update local state
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
    return { error: null };
  }, []);

  // Toggle pin status
  const togglePin = useCallback(async (announcementId: string, isPinned: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ is_pinned: !isPinned })
      .eq('id', announcementId);

    if (error) {
      setError(error.message);
      return { error };
    }
    
    // Update local state
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === announcementId 
        ? { ...announcement, is_pinned: !isPinned }
        : announcement
    ));
    return { error: null };
  }, []);

  // Toggle status (active/inactive)
  const toggleStatus = useCallback(async (announcementId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const { error } = await supabase
      .from('announcements')
      .update({ status: newStatus })
      .eq('id', announcementId);

    if (error) {
      setError(error.message);
      return { error };
    }
    
    // Update local state
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === announcementId 
        ? { ...announcement, status: newStatus }
        : announcement
    ));
    return { error: null };
  }, []);

  // Increment views
  const incrementViews = useCallback(async (announcementId: string) => {
    const { error } = await supabase
      .from('announcements')
      .update({ views: supabase.rpc('increment', { row_id: announcementId, column_name: 'views' }) })
      .eq('id', announcementId);

    if (error) {
      console.error('Failed to increment views:', error);
    }
  }, []);

  // Get announcements by author
  const getAnnouncementsByAuthor = useCallback(async (authorId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  }, []);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    fetchAnnouncementsByAudience,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePin,
    toggleStatus,
    incrementViews,
    getAnnouncementsByAuthor,
  };
} 