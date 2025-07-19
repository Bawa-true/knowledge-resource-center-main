import { useState, useCallback } from 'react';
import { supabase } from './supabase';

// Course interface matching our database schema
interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  instructor_id?: string;
  level: '100' | '200' | '300' | '400' | '500' | 'graduate';
  semester: 'first' | 'second' | 'summer';
  course_type: 'core' | 'elective';
  course_program: 'general' | 'ai' | 'networking' | 'control';
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all active courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    setCourses(data || []);
    return { data, error: null };
  }, []);

  // Fetch course by ID
  const fetchCourseById = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  }, []);

  // Create new course
  const createCourse = useCallback(async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    // Update local state
    setCourses(prev => [data, ...prev]);
    return { data, error: null };
  }, []);

  // Update course
  const updateCourse = useCallback(async (courseId: string, updates: Partial<Course>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    // Update local state
    setCourses(prev => prev.map(course => 
      course.id === courseId ? data : course
    ));
    return { data, error: null };
  }, []);

  // Delete course (soft delete by setting status to archived)
  const deleteCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase
      .from('courses')
      .update({ status: 'archived' })
      .eq('id', courseId);

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    // Update local state
    setCourses(prev => prev.filter(course => course.id !== courseId));
    return { error: null };
  }, []);

  // Get courses by instructor
  const getCoursesByInstructor = useCallback(async (instructorId: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setLoading(false);
    
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    
    return { data, error: null };
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByInstructor,
  };
} 