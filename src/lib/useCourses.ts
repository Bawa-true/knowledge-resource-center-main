import { useState, useCallback } from 'react';
import { supabase } from './supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface CourseData {
  id?: string;
  name: string;
  code: string;
  description?: string;
  level: string;
  semester: string;
  course_type: string;
  course_program: string;
}

export interface ResourceData {
  title: string;
  description?: string;
  resource_type: 'material' | 'video';
  course_id: string;
  file: File;
}

export function useCourses() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  // Create a new course
  const createCourse = useCallback(async (courseData: CourseData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating course with data:', courseData);
      
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          instructor_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Course creation error:', error);
        throw error;
      }
      
      console.log('Course created successfully:', data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      console.error('Course creation failed:', err);
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if storage bucket exists
  const checkStorageBucket = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('Error listing buckets:', error);
        return false;
      }
      
      const resourcesBucket = data?.find(bucket => bucket.name === 'resources');
      console.log('Available buckets:', data?.map(b => b.name));
      console.log('Resources bucket exists:', !!resourcesBucket);
      
      return !!resourcesBucket;
    } catch (err) {
      console.error('Error checking storage bucket:', err);
      return false;
    }
  }, []);

  // Upload a resource file to Supabase Storage
  const uploadResourceFile = useCallback(async (file: File, courseId: string, resourceType: 'material' | 'video') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if storage bucket exists
      const bucketExists = await checkStorageBucket();
      if (!bucketExists) {
        throw new Error('Storage bucket "resources" does not exist. Please create it in your Supabase dashboard.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${courseId}/${resourceType}/${fileName}`;

      console.log('Uploading file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: filePath
      });

      const { data, error } = await supabase.storage
        .from('resources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('File upload error:', error);
        throw error;
      }

      console.log('File uploaded successfully:', data);
      return { data, filePath };
    } catch (err) {
      console.error('File upload failed:', err);
      throw err;
    }
  }, [user, checkStorageBucket]);

  // Create a resource record in the database
  const createResource = useCallback(async (resourceData: ResourceData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Creating resource for file:', resourceData.file.name);

      // First upload the file to storage
      const { filePath } = await uploadResourceFile(
        resourceData.file,
        resourceData.course_id,
        resourceData.resource_type
      );

      // Determine resource type based on file type
      const fileType = resourceData.file.type;
      const isVideo = fileType.startsWith('video/');
      const finalResourceType = isVideo ? 'video' : 'material';

      console.log('Resource type determined:', finalResourceType);

      // Create the resource record
      const resourceRecord = {
        title: resourceData.title,
        description: resourceData.description,
        resource_type: finalResourceType,
        course_id: resourceData.course_id,
        uploaded_by: user.id,
        file_path: filePath,
        file_name: resourceData.file.name,
        file_size: resourceData.file.size,
        file_type: resourceData.file.type,
      };

      console.log('Creating resource record:', resourceRecord);

      const { data, error } = await supabase
        .from('resources')
        .insert(resourceRecord)
        .select()
        .single();

      if (error) {
        console.error('Resource creation error:', error);
        throw error;
      }

      console.log('Resource created successfully:', data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create resource';
      console.error('Resource creation failed:', err);
      return { data: null, error: { message: errorMessage } };
    }
  }, [user, uploadResourceFile]);

  // Upload course with multiple resources
  const uploadCourseWithResources = useCallback(async (
    courseData: CourseData,
    files: File[]
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting upload process for course:', courseData.name);
      console.log('Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

      // First create the course
      const { data: course, error: courseError } = await createCourse(courseData);
      if (courseError) {
        console.error('Course creation failed:', courseError);
        throw courseError;
      }

      if (!course) {
        throw new Error('Failed to create course');
      }

      console.log('Course created, now uploading resources...');

      // Then upload each resource sequentially to avoid overwhelming the server
      const uploadedResources = [];
      const failedResources = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name);

        const fileType = file.type;
        const isVideo = fileType.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'material';

        const result = await createResource({
          title: file.name,
          description: `Uploaded resource for ${courseData.name}`,
          resource_type: resourceType,
          course_id: course.id,
          file: file,
        });

        if (result.error) {
          console.error(`Failed to upload ${file.name}:`, result.error);
          failedResources.push({ file: file.name, error: result.error.message });
        } else {
          console.log(`Successfully uploaded ${file.name}`);
          uploadedResources.push(result.data);
        }
      }

      console.log('Upload process completed:', {
        course: course,
        uploadedResources: uploadedResources.length,
        failedResources: failedResources.length
      });

      if (failedResources.length > 0) {
        console.warn('Some resources failed to upload:', failedResources);
      }

      return {
        course,
        resources: uploadedResources,
        failedResources: failedResources.length,
        error: null
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload course with resources';
      console.error('Upload process failed:', err);
      setError(errorMessage);
      return { course: null, resources: [], failedResources: 0, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, [user, createCourse, createResource]);

  // Fetch count of all courses
  const fetchCourseCount = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { count, error } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { count: null, error };
    }
    return { count, error: null };
  }, []);

  // Fetch all courses
  const fetchAllCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    return { data, error: null };
  }, []);

  return {
    loading,
    error,
    createCourse,
    createResource,
    uploadCourseWithResources,
    checkStorageBucket,
    fetchCourseCount,
    fetchAllCourses, // <-- add this to the return object
  };
} 