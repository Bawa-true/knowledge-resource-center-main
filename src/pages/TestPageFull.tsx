import { useEffect, useState } from "react";
import { testAuth, testUserProfile, testCourses, testAnnouncements, testResources } from "../lib/supabaseTest";
import { useSupabaseAuth } from "../lib/useSupabaseAuth";
import { useUserProfile } from "../lib/useUserProfile";
import { useCourses } from "../lib/useCourses";
import { useResources } from "../lib/useResources";
import { useAnnouncements } from "../lib/useAnnouncements";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function TestPageFull() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const supabaseAuth = useSupabaseAuth();
  const userProfile = useUserProfile();
  const courses = useCourses();
  const resources = useResources();
  const announcements = useAnnouncements();
  const { user } = supabaseAuth;

  // Override console.log to capture test results
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      setTestResults(prev => [...prev, args.join(' ')]);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  // Accepts a test function and its arguments
  const runTest = async (testFunction: (...args: unknown[]) => Promise<void>, testName: string, ...args: unknown[]) => {
    setIsRunning(true);
    setTestResults(prev => [...prev, `\n=== Starting ${testName} ===`]);
    try {
      await testFunction(...args);
      setTestResults(prev => [...prev, `✅ ${testName} completed successfully`]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ ${testName} failed: ${error}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    try {
      // Test 1: Authentication
      await runTest(testAuth, "Authentication Test", supabaseAuth);
      // Test 2: User Profile (only if user is logged in)
      if (user?.id) {
        await runTest(testUserProfile, "User Profile Test", userProfile, user.id);
      } else {
        setTestResults(prev => [...prev, "⚠️ Skipping User Profile Test - No user logged in"]);
      }
      // Test 3: Courses
      await runTest(testCourses, "Courses Test", courses);
      // Test 4: Announcements (only if user is logged in)
      if (user?.id) {
        await runTest(testAnnouncements, "Announcements Test", announcements, user.id);
      } else {
        setTestResults(prev => [...prev, "⚠️ Skipping Announcements Test - No user logged in"]);
      }
      // Test 5: Resources (only if user is logged in)
      if (user?.id) {
        await runTest(async (resources: typeof resources, userId: string) => {
          const { supabase } = await import("../lib/supabase");
          const { data: course } = await supabase
            .from('courses')
            .insert({
              name: 'Test Course for Resources',
              code: 'TST102',
              level: '500',
              semester: 'first',
              course_type: 'core',
              course_program: 'general',
              status: 'active',
            })
            .select()
            .single();
          if (course) {
            await testResources(resources, course.id, userId);
            await supabase
              .from('courses')
              .update({ status: 'archived' })
              .eq('id', course.id);
          }
        }, "Resources Test", resources, user.id);
      } else {
        setTestResults(prev => [...prev, "⚠️ Skipping Resources Test - No user logged in"]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Test suite failed: ${error}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Supabase Backend Test Suite
            <Badge variant={user ? "default" : "secondary"}>
              {user ? "Logged In" : "Not Logged In"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Test all Supabase backend functionality. Check the console for detailed logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => runAllTests()} 
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>
            
            <Button 
              onClick={() => runTest(testAuth, "Authentication", supabaseAuth)}
              disabled={isRunning}
              variant="outline"
            >
              Test Auth Only
            </Button>
            
            <Button 
              onClick={() => runTest(testCourses, "Courses", courses)}
              disabled={isRunning}
              variant="outline"
            >
              Test Courses Only
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="destructive"
            >
              Clear Results
            </Button>
          </div>

          {user && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Current User:</h3>
              <p className="text-sm text-blue-600">ID: {user.id}</p>
              <p className="text-sm text-blue-600">Email: {user.email}</p>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {testResults.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <strong>Authentication Test:</strong> Creates a test user, signs in, and signs out</p>
          <p>2. <strong>User Profile Test:</strong> Fetches and updates user profile (requires login)</p>
          <p>3. <strong>Courses Test:</strong> Creates, fetches, updates, and deletes a test course</p>
          <p>4. <strong>Announcements Test:</strong> Creates, fetches, updates, and deletes a test announcement (requires login)</p>
          <p>5. <strong>Resources Test:</strong> Creates, fetches, updates, and deletes a test resource (requires login)</p>
          <p className="text-orange-600">⚠️ Check your Supabase dashboard to see the test data being created and deleted</p>
        </CardContent>
      </Card>
    </div>
  );
} 