import { useState, useCallback } from 'react';
import { supabase } from './supabase';

// Resource interface matching our database schema
export type Resource = {
  id: string;
  title: string;
  description?: string;
  resource_type: 'material' | 'video';
  course_id: string;
  uploaded_by: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  thumbnail_url?: string;
  duration?: number;
  views: number;
  downloads: number;
  status: 'active' | 'inactive' | 'processing';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload file to Supabase storage
  const uploadFile = useCallback(async (file: File, courseId: string, resourceType: 'material' | 'video') => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${courseId}/${resourceType}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  }, []);

  // Get public URL for file
  const getFileUrl = useCallback((filePath: string) => {
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }, []);

  // Create resource record in database
  const createResource = useCallback(async (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'views' | 'downloads'>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('resources')
      .insert(resourceData)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    // Update local state
    setResources(prev => [data, ...prev]);
    return { data, error: null };
  }, []);

  // Upload file and create resource record
  const uploadResource = useCallback(async (
    file: File,
    courseId: string,
    resourceType: 'material' | 'video',
    title: string,
    uploadedBy: string,
    description?: string,
  ) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Upload file to storage
      const uploadResult = await uploadFile(file, courseId, resourceType);
      if (uploadResult.error) {
        setError(uploadResult.error.message);
        setLoading(false);
        return { data: null, error: uploadResult.error };
      }

      // 2. Create resource record
      const resourceData = {
        title,
        description,
        resource_type: resourceType,
        course_id: courseId,
        uploaded_by: uploadedBy,
        file_path: uploadResult.data.path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: 'active' as const,
        is_pinned: false,
      };

      const createResult = await createResource(resourceData);
      
      setLoading(false);
      return createResult;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Upload failed');
      return { data: null, error: err instanceof Error ? err : new Error('Upload failed') };
    }
  }, [uploadFile, createResource]);

  // Fetch resources by course
  const fetchResourcesByCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('course_id', courseId)
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setResources(data || []);
    return { data, error: null };
  }, []);

  // Fetch all resources
  const fetchAllResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setResources(data || []);
    return { data, error: null };
  }, []);

  // Fetch resources by type
  const fetchResourcesByType = useCallback(async (resourceType: 'material' | 'video') => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setResources(data || []);
    return { data, error: null };
  }, []);

  // Update resource
  const updateResource = useCallback(async (resourceId: string, updates: Partial<Resource>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    // Update local state
    setResources(prev => prev.map(resource => 
      resource.id === resourceId ? data : resource
    ));
    return { data, error: null };
  }, []);

  // Delete resource (soft delete)
  const deleteResource = useCallback(async (resourceId: string) => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('resources')
      .update({ status: 'inactive' })
      .eq('id', resourceId);

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    // Update local state
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
    return { error: null };
  }, []);

  // Increment resource views
  const incrementViews = useCallback(async (resourceId: string) => {
    const { error } = await supabase
      .from('resources')
      .update({ views: supabase.rpc('increment', { row_id: resourceId, column_name: 'views' }) })
      .eq('id', resourceId);

    if (error) {
      console.error('Failed to increment views:', error);
    }
  }, []);

  // Get resources by uploader
  const getResourcesByUploader = useCallback(async (uploadedBy: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('uploaded_by', uploadedBy)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  }, []);

  // Fetch count of all active resources
  const fetchResourceCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { count, error } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { count: null, error };
    }
    return { count, error: null };
  }, []);

  // Fetch count of all materials
  const fetchMaterialCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { count, error } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('resource_type', 'material')
      .eq('status', 'active');
    setLoading(false);
    if (error) {
      setError(error.message);
      return { count: null, error };
    }
    return { count, error: null };
  }, []);

  // Fetch count of all videos
  const fetchVideoCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { count, error } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('resource_type', 'video')
      .eq('status', 'active');
    setLoading(false);
    if (error) {
      setError(error.message);
      return { count: null, error };
    }
    return { count, error: null };
  }, []);

  // Fetch all materials with course_program from courses table
  const fetchMaterialsWithCourseProgram = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('resources')
      .select(`*, courses:course_id(course_program)`) // join courses table
      .eq('resource_type', 'material')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    // Map to flatten course_program
    const mapped = (data || []).map((item: Resource & { courses?: { course_program?: string } }) => ({
      ...item,
      course_program: item.courses?.course_program || '',
    }));
    return { data: mapped, error: null };
  }, []);

  // Fetch all videos with course_program from courses table
  const fetchVideosWithCourseProgram = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('resources')
      .select(`*, courses:course_id(course_program)`) // join courses table
      .eq('resource_type', 'video')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    // Map to flatten course_program
    const mapped = (data || []).map((item: Resource & { courses?: { course_program?: string } }) => ({
      ...item,
      course_program: item.courses?.course_program || '',
    }));
    return { data: mapped, error: null };
  }, []);

  return {
    resources,
    loading,
    error,
    uploadResource,
    uploadFile,
    getFileUrl,
    createResource,
    fetchResourcesByCourse,
    fetchAllResources,
    fetchResourcesByType,
    updateResource,
    deleteResource,
    incrementViews,
    getResourcesByUploader,
    fetchResourceCount,
    fetchMaterialCount,
    fetchVideoCount,
    fetchMaterialsWithCourseProgram,
    fetchVideosWithCourseProgram, // <-- add this to the return object
  };
} 