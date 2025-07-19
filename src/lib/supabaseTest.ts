import { supabase } from './supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useUserProfile } from './useUserProfile';
import { useCourses } from './useCourses';
import { useResources } from './useResources';
import { useAnnouncements } from './useAnnouncements';

// Note: These are standalone async test functions. Call them from a test component or browser console.

// Refactored test functions to accept hook objects as arguments

// 1. Test Authentication
export async function testAuth(auth: {
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}) {
  // Use a real email domain for testing
  const email = `example${Date.now()}@gmail.com`;
  const password = 'TestPassword123!';
  const { signUp, signIn, signOut } = auth;

  console.log('Signing up...');
  const signUpResult = await signUp(email, password);
  console.log('Sign up result:', signUpResult);

  console.log('Signing in...');
  const signInResult = await signIn(email, password);
  console.log('Sign in result:', signInResult);

  console.log('Signing out...');
  const signOutResult = await signOut();
  console.log('Sign out result:', signOutResult);
}

// 2. Test User Profile
export async function testUserProfile(userProfile: {
  fetchProfile: (userId: string) => Promise<any>;
  updateProfile: (userId: string, updates: any) => Promise<any>;
}, userId: string) {
  const { fetchProfile, updateProfile } = userProfile;
  console.log('Fetching profile...');
  const profileResult = await fetchProfile(userId);
  console.log('Profile:', profileResult);

  console.log('Updating profile name...');
  const updateResult = await updateProfile(userId, { name: 'Test User Updated' });
  console.log('Update result:', updateResult);
}

// 3. Test Courses
export async function testCourses(courses: {
  createCourse: (courseData: any) => Promise<any>;
  fetchCourses: () => Promise<any>;
  updateCourse: (courseId: string, updates: any) => Promise<any>;
  deleteCourse: (courseId: string) => Promise<any>;
}) {
  const { createCourse, fetchCourses, updateCourse, deleteCourse } = courses;
  console.log('Creating course...');
  const createResult = await createCourse({
    name: 'Test Course',
    code: `TST${Date.now()}`, // Unique code for each test
    level: '500',
    semester: 'first',
    course_type: 'core',
    course_program: 'general',
    status: 'active',
  });
  console.log('Create course result:', createResult);

  const courseId = createResult.data?.id;
  if (!courseId) return;

  console.log('Fetching all courses...');
  const fetchResult = await fetchCourses();
  console.log('Courses:', fetchResult);

  console.log('Updating course...');
  const updateResult = await updateCourse(courseId, { name: 'Test Course Updated' });
  console.log('Update result:', updateResult);

  console.log('Deleting course...');
  const deleteResult = await deleteCourse(courseId);
  console.log('Delete result:', deleteResult);
}

// 4. Test Announcements
export async function testAnnouncements(announcements: {
  createAnnouncement: (data: any) => Promise<any>;
  fetchAnnouncements: () => Promise<any>;
  updateAnnouncement: (id: string, updates: any) => Promise<any>;
  deleteAnnouncement: (id: string) => Promise<any>;
}, authorId: string) {
  const { createAnnouncement, fetchAnnouncements, updateAnnouncement, deleteAnnouncement } = announcements;
  console.log('Creating announcement...');
  const createResult = await createAnnouncement({
    title: 'Test Announcement',
    content: 'This is a test announcement.',
    priority: 'normal',
    target_audience: 'all',
    status: 'active',
    is_pinned: false,
    author_id: authorId,
  });
  console.log('Create announcement result:', createResult);

  const announcementId = createResult.data?.id;
  if (!announcementId) return;

  console.log('Fetching all announcements...');
  const fetchResult = await fetchAnnouncements();
  console.log('Announcements:', fetchResult);

  console.log('Updating announcement...');
  const updateResult = await updateAnnouncement(announcementId, { title: 'Test Announcement Updated' });
  console.log('Update result:', updateResult);

  console.log('Deleting announcement...');
  const deleteResult = await deleteAnnouncement(announcementId);
  console.log('Delete result:', deleteResult);
}

// 5. Test Resources (file upload is not tested here; use UI for real file uploads)
export async function testResources(resources: {
  createResource: (data: any) => Promise<any>;
  fetchResourcesByCourse: (courseId: string) => Promise<any>;
  updateResource: (resourceId: string, updates: any) => Promise<any>;
  deleteResource: (resourceId: string) => Promise<any>;
}, courseId: string, uploadedBy: string) {
  const { createResource, fetchResourcesByCourse, updateResource, deleteResource } = resources;
  console.log('Creating resource...');
  const createResult = await createResource({
    title: 'Test Material',
    resource_type: 'material',
    course_id: courseId,
    uploaded_by: uploadedBy,
    file_path: 'test/path/file.pdf',
    file_name: 'file.pdf',
    file_size: 12345,
    file_type: 'application/pdf',
    status: 'active',
    is_pinned: false,
  });
  console.log('Create resource result:', createResult);

  const resourceId = createResult.data?.id;
  if (!resourceId) return;

  console.log('Fetching resources by course...');
  const fetchResult = await fetchResourcesByCourse(courseId);
  console.log('Resources:', fetchResult);

  console.log('Updating resource...');
  const updateResult = await updateResource(resourceId, { title: 'Test Material Updated' });
  console.log('Update result:', updateResult);

  console.log('Deleting resource...');
  const deleteResult = await deleteResource(resourceId);
  console.log('Delete result:', deleteResult);
} 