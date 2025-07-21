import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  target_audience: "all" | "500 level" | "400 level" | "300 level";
  status: "active" | "inactive" | "expired";
  is_pinned: boolean;
  author_id?: string;
  author_name?: string;
  expiry_date?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  target_audience: "all" | "500 level" | "400 level" | "300 level";
  expiry_date?: string;
  is_pinned: boolean;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      console.log('Fetched announcements:', data, error); // Debug log

      if (error) throw error;

      // Get unique author_ids
      const authorIds = Array.from(new Set((data || []).map(a => a.author_id).filter(Boolean)));
      let authorsMap = {};
      if (authorIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', authorIds);
        if (!usersError && usersData) {
          authorsMap = Object.fromEntries(usersData.map(u => [u.id, u.name]));
        }
      }

      const announcementsWithAuthor = (data || []).map(announcement => ({
        ...announcement,
        author_name: authorsMap[announcement.author_id] || announcement.author_id || 'Unknown Author'
      }));

      setAnnouncements(announcementsWithAuthor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch announcements';
      setError(errorMessage);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcementData: CreateAnnouncementData) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcementData,
          author_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchAnnouncements();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create announcement';
      setError(errorMessage);
      console.error('Error creating announcement:', err);
      throw err;
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchAnnouncements();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update announcement';
      setError(errorMessage);
      console.error('Error updating announcement:', err);
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchAnnouncements();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete announcement';
      setError(errorMessage);
      console.error('Error deleting announcement:', err);
      throw err;
    }
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    return updateAnnouncement(id, { is_pinned: !currentPinned });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    return updateAnnouncement(id, { status: newStatus as "active" | "inactive" });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePin,
    toggleStatus
  };
}; 