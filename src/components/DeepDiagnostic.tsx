import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

interface DiagnosticResults {
  envVars: {
    url: string;
    key: string;
    urlValid: boolean;
    keyValid: boolean;
  };
  auth: {
    user: unknown;
    session: unknown;
    error: string | null;
  };
  storage: {
    buckets: unknown[];
    bucketExists: boolean;
    canListBuckets: boolean;
    canUpload: boolean;
    error: string | null;
  };
  rpc: {
    canCallRPC: boolean;
    error: string | null;
  };
}

const DeepDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runDeepDiagnostic = async () => {
    setLoading(true);
    setResults(null);

    try {
      const diagnostic: DiagnosticResults = {
        envVars: {
          url: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
          key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'NOT_SET',
          urlValid: false,
          keyValid: false
        },
        auth: {
          user: null,
          session: null,
          error: null
        },
        storage: {
          buckets: [],
          bucketExists: false,
          canListBuckets: false,
          canUpload: false,
          error: null
        },
        rpc: {
          canCallRPC: false,
          error: null
        }
      };

      // Check environment variables
      diagnostic.envVars.urlValid = diagnostic.envVars.url !== 'NOT_SET' && diagnostic.envVars.url.includes('supabase.co');
      diagnostic.envVars.keyValid = diagnostic.envVars.key !== 'NOT_SET' && diagnostic.envVars.key.length > 50;

      console.log('Environment Variables:', {
        url: diagnostic.envVars.url,
        keyLength: diagnostic.envVars.key.length,
        urlValid: diagnostic.envVars.urlValid,
        keyValid: diagnostic.envVars.keyValid
      });

      // Check authentication
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        diagnostic.auth.user = user;
        diagnostic.auth.error = authError?.message || null;
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        diagnostic.auth.session = session;
        if (sessionError) {
          diagnostic.auth.error = diagnostic.auth.error || sessionError.message;
        }
      } catch (authErr) {
        diagnostic.auth.error = authErr instanceof Error ? authErr.message : 'Unknown auth error';
      }

      // Check storage access
      try {
        console.log('Testing storage access...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          diagnostic.storage.error = bucketsError.message;
          console.error('Storage buckets error:', bucketsError);
        } else {
          diagnostic.storage.buckets = buckets || [];
          diagnostic.storage.canListBuckets = true;
          diagnostic.storage.bucketExists = buckets?.some(b => b.name === 'resources') || false;
          
          console.log('Available buckets:', buckets);
          console.log('Resources bucket exists:', diagnostic.storage.bucketExists);
        }

        // Test upload capability
        if (diagnostic.storage.bucketExists) {
          try {
            const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('resources')
              .upload('diagnostic-test.txt', testFile, { upsert: true });

            if (uploadError) {
              console.error('Upload test failed:', uploadError);
              diagnostic.storage.error = diagnostic.storage.error || uploadError.message;
            } else {
              diagnostic.storage.canUpload = true;
              console.log('Upload test successful:', uploadData);
              
              // Clean up test file
              await supabase.storage.from('resources').remove(['diagnostic-test.txt']);
            }
          } catch (uploadErr) {
            console.error('Upload test exception:', uploadErr);
            diagnostic.storage.error = diagnostic.storage.error || (uploadErr instanceof Error ? uploadErr.message : 'Upload test failed');
          }
        }
      } catch (storageErr) {
        console.error('Storage access error:', storageErr);
        diagnostic.storage.error = storageErr instanceof Error ? storageErr.message : 'Storage access failed';
      }

      // Test RPC capability
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('version');
        if (rpcError) {
          diagnostic.rpc.error = rpcError.message;
        } else {
          diagnostic.rpc.canCallRPC = true;
        }
      } catch (rpcErr) {
        diagnostic.rpc.error = rpcErr instanceof Error ? rpcErr.message : 'RPC test failed';
      }

      setResults(diagnostic);
    } catch (err) {
      console.error('Diagnostic error:', err);
      setResults({
        envVars: { url: 'ERROR', key: 'ERROR', urlValid: false, keyValid: false },
        auth: { user: null, session: null, error: err instanceof Error ? err.message : 'Unknown error' },
        storage: { buckets: [], bucketExists: false, canListBuckets: false, canUpload: false, error: 'Diagnostic failed' },
        rpc: { canCallRPC: false, error: 'Diagnostic failed' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Deep Supabase Diagnostic</CardTitle>
        <CardDescription>
          Comprehensive check of Supabase configuration, environment variables, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDeepDiagnostic} disabled={loading}>
          {loading ? 'Running Deep Diagnostic...' : 'Run Deep Diagnostic'}
        </Button>

        {results && (
          <div className="space-y-4">
            {/* Environment Variables */}
            <Alert variant={results.envVars.urlValid && results.envVars.keyValid ? "default" : "destructive"}>
              <AlertDescription>
                <strong>Environment Variables:</strong><br/>
                URL: {results.envVars.urlValid ? '✅ Valid' : '❌ Invalid'} ({results.envVars.url.substring(0, 30)}...)<br/>
                Key: {results.envVars.keyValid ? '✅ Valid' : '❌ Invalid'} ({results.envVars.key.substring(0, 20)}...)
              </AlertDescription>
            </Alert>

            {/* Authentication */}
            <Alert variant={results.auth.error ? "destructive" : "default"}>
              <AlertDescription>
                <strong>Authentication:</strong><br/>
                User: {results.auth.user ? `✅ ${(results.auth.user as { email: string }).email}` : '❌ No user'}<br/>
                Session: {results.auth.session ? '✅ Active' : '❌ No session'}<br/>
                {results.auth.error && <span className="text-red-500">Error: {results.auth.error}</span>}
              </AlertDescription>
            </Alert>

            {/* Storage */}
            <Alert variant={results.storage.error ? "destructive" : "default"}>
              <AlertDescription>
                <strong>Storage Access:</strong><br/>
                Can List Buckets: {results.storage.canListBuckets ? '✅ Yes' : '❌ No'}<br/>
                Bucket Count: {results.storage.buckets.length}<br/>
                Resources Bucket: {results.storage.bucketExists ? '✅ Exists' : '❌ Missing'}<br/>
                Can Upload: {results.storage.canUpload ? '✅ Yes' : '❌ No'}<br/>
                {results.storage.error && <span className="text-red-500">Error: {results.storage.error}</span>}
              </AlertDescription>
            </Alert>

            {/* Available Buckets */}
            {results.storage.buckets.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Available Buckets:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {results.storage.buckets.map((bucket, index) => (
                    <li key={index}>
                      {(bucket as { name: string; public: boolean }).name} (public: {(bucket as { name: string; public: boolean }).public ? 'yes' : 'no'})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* RPC */}
            <Alert variant={results.rpc.error ? "destructive" : "default"}>
              <AlertDescription>
                <strong>RPC Access:</strong> {results.rpc.canCallRPC ? '✅ Yes' : '❌ No'}<br/>
                {results.rpc.error && <span className="text-red-500">Error: {results.rpc.error}</span>}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeepDiagnostic; 