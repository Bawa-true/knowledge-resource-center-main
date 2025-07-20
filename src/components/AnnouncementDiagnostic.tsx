import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Database, User, AlertTriangle } from 'lucide-react';

const AnnouncementDiagnostic = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    auth: { success: boolean; message: string; user?: any };
    tableExists: { success: boolean; message: string };
    insertTest: { success: boolean; message: string };
    policies: { success: boolean; message: string };
  } | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults(null);

    const diagnosticResults = {
      auth: { success: false, message: '' },
      tableExists: { success: false, message: '' },
      insertTest: { success: false, message: '' },
      policies: { success: false, message: '' }
    };

    try {
      // Test 1: Authentication
      console.log('Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        diagnosticResults.auth = { success: false, message: `Auth error: ${authError.message}` };
      } else if (!user) {
        diagnosticResults.auth = { success: false, message: 'No authenticated user found' };
      } else {
        diagnosticResults.auth = { 
          success: true, 
          message: `Authenticated as: ${user.email} (${user.id})`,
          user 
        };
      }

      // Test 2: Check if table exists
      console.log('Testing table existence...');
      const { data: tableData, error: tableError } = await supabase
        .from('announcements')
        .select('count')
        .limit(1);

      if (tableError) {
        diagnosticResults.tableExists = { success: false, message: `Table error: ${tableError.message}` };
      } else {
        diagnosticResults.tableExists = { success: true, message: 'Announcements table exists and accessible' };
      }

      // Test 3: Check user role
      console.log('Testing user role...');
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userError) {
          diagnosticResults.policies = { success: false, message: `User role check failed: ${userError.message}` };
        } else {
          diagnosticResults.policies = { 
            success: userData?.role === 'admin', 
            message: `User role in database: ${userData?.role || 'unknown'} (admin required for announcements)` 
          };
        }

        // Also check auth metadata
        const authRole = user.user_metadata?.role;
        if (authRole && authRole !== userData?.role) {
          diagnosticResults.policies.message += ` | Auth metadata role: ${authRole} (mismatch with database)`;
        }
      } else {
        diagnosticResults.policies = { success: false, message: 'Cannot check role - no authenticated user' };
      }

      // Test 4: Try to insert a test announcement (only if user is admin)
      console.log('Testing insert capability...');
      if (user && diagnosticResults.policies.success) {
        const testAnnouncement = {
          title: 'Test Announcement',
          content: 'This is a test announcement for diagnostic purposes.',
          priority: 'normal',
          target_audience: 'all',
          is_pinned: false,
          author_id: user.id,
          status: 'active'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('announcements')
          .insert(testAnnouncement)
          .select()
          .single();

        if (insertError) {
          diagnosticResults.insertTest = { success: false, message: `Insert failed: ${insertError.message}` };
        } else {
          diagnosticResults.insertTest = { success: true, message: `Test announcement created with ID: ${insertData.id}` };
          
          // Clean up test announcement
          await supabase
            .from('announcements')
            .delete()
            .eq('id', insertData.id);
        }
      } else {
        diagnosticResults.insertTest = { success: false, message: 'Cannot test insert - user not admin or not authenticated' };
      }

    } catch (error) {
      console.error('Diagnostic error:', error);
      diagnosticResults.auth = { success: false, message: `Unexpected error: ${error}` };
    }

    setResults(diagnosticResults);
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Announcement System Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Authentication:</span>
              {results.auth.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={results.auth.success ? "default" : "destructive"}>
                {results.auth.success ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{results.auth.message}</p>

            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Table Access:</span>
              {results.tableExists.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={results.tableExists.success ? "default" : "destructive"}>
                {results.tableExists.success ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{results.tableExists.message}</p>

            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">User Permissions:</span>
              {results.policies.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={results.policies.success ? "default" : "destructive"}>
                {results.policies.success ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{results.policies.message}</p>

            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Insert Test:</span>
              {results.insertTest.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={results.insertTest.success ? "default" : "destructive"}>
                {results.insertTest.success ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{results.insertTest.message}</p>

            {results.auth.user && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">User Details:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(results.auth.user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementDiagnostic; 