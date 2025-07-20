import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface UploadedCourse {
  id: string;
  name: string;
  code: string;
  description?: string;
  level: string;
  semester: string;
  course_type: string;
  course_program: string;
  status: string;
  created_at: string;
  updated_at: string;
  instructor_id: string;
  resource_count: number;
}

export interface UploadedResource {
  id: string;
  title: string;
  description?: string;
  resource_type: 'material' | 'video';
  course_id: string;
  course_name: string;
  course_code: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  thumbnail_url?: string;
  duration?: number;
  views: number;
  downloads: number;
  status: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  uploaded_by: string;
}

export function useMyUploads() {
  const [courses, setCourses] = useState<UploadedCourse[]>([]);
  const [resources, setResources] = useState<UploadedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  // Fetch user's uploaded courses
  const fetchMyCourses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          resources:resources(count)
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithResourceCount = data?.map(course => ({
        ...course,
        resource_count: course.resources?.[0]?.count || 0
      })) || [];

      setCourses(coursesWithResourceCount);
      return coursesWithResourceCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user's uploaded resources
  const fetchMyResources = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          courses!inner(
            name,
            code
          )
        `)
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const resourcesWithCourseInfo = data?.map(resource => ({
        ...resource,
        course_name: resource.courses?.name || 'Unknown Course',
        course_code: resource.courses?.code || 'Unknown'
      })) || [];

      setResources(resourcesWithCourseInfo);
      return resourcesWithCourseInfo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resources';
      setError(errorMessage);
      console.error('Error fetching resources:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch both courses and resources
  const fetchAllUploads = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch both in parallel
      const [coursesData, resourcesData] = await Promise.all([
        fetchMyCourses(),
        fetchMyResources()
      ]);

      return { courses: coursesData, resources: resourcesData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch uploads';
      setError(errorMessage);
      console.error('Error fetching uploads:', err);
      return { courses: [], resources: [] };
    } finally {
      setLoading(false);
    }
  }, [user, fetchMyCourses, fetchMyResources]);

  // Delete a resource
  const deleteResource = useCallback(async (resourceId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // First get the resource to get the file path
      const { data: resource, error: fetchError } = await supabase
        .from('resources')
        .select('file_path')
        .eq('id', resourceId)
        .eq('uploaded_by', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (resource?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('resources')
          .remove([resource.file_path]);

        if (storageError) {
          console.warn('Failed to delete from storage:', storageError);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('uploaded_by', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setResources(prev => prev.filter(r => r.id !== resourceId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete resource';
      setError(errorMessage);
      console.error('Error deleting resource:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete a course (and all its resources)
  const deleteCourse = useCallback(async (courseId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // First get all resources for this course
      const { data: resources, error: fetchError } = await supabase
        .from('resources')
        .select('file_path')
        .eq('course_id', courseId);

      if (fetchError) throw fetchError;

      // Delete all resource files from storage
      if (resources && resources.length > 0) {
        const filePaths = resources.map(r => r.file_path).filter(Boolean);
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('resources')
            .remove(filePaths);

          if (storageError) {
            console.warn('Failed to delete some files from storage:', storageError);
          }
        }
      }

      // Delete course (resources will be deleted automatically due to CASCADE)
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('instructor_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setResources(prev => prev.filter(r => r.course_id !== courseId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setError(errorMessage);
      console.error('Error deleting course:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update resource
  const updateResource = useCallback(async (resourceId: string, updates: Partial<UploadedResource>) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', resourceId)
        .eq('uploaded_by', user.id);

      if (error) throw error;

      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, ...updates } : r
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update resource';
      setError(errorMessage);
      console.error('Error updating resource:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchAllUploads();
    }
  }, [user, fetchAllUploads]);

  return {
    courses,
    resources,
    loading,
    error,
    fetchMyCourses,
    fetchMyResources,
    fetchAllUploads,
    deleteResource,
    deleteCourse,
    updateResource,
  };
} 