// API Connection Test Component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHealthCheck } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

export default function ApiTest() {
  const [testResults, setTestResults] = useState<{
    health: 'pending' | 'success' | 'error';
    users: 'pending' | 'success' | 'error';
    runs: 'pending' | 'success' | 'error';
  }>({
    health: 'pending',
    users: 'pending',
    runs: 'pending',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Test health check
  const { data: healthData, error: healthError, isLoading: healthLoading } = useHealthCheck();

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResults({ health: 'pending', users: 'pending', runs: 'pending' });

    try {
      // Test 1: Health Check
      try {
        const healthResponse = await api.health();
        if (healthResponse.success) {
          setTestResults(prev => ({ ...prev, health: 'success' }));
          toast.success('✅ Health check passed');
        } else {
          setTestResults(prev => ({ ...prev, health: 'error' }));
          toast.error('❌ Health check failed');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, health: 'error' }));
        toast.error('❌ Health check error');
      }

      // Test 2: Get Active Runs
      try {
        const runsResponse = await api.runs.getActive();
        if (runsResponse.success) {
          setTestResults(prev => ({ ...prev, runs: 'success' }));
          toast.success('✅ Active runs fetched');
        } else {
          setTestResults(prev => ({ ...prev, runs: 'error' }));
          toast.error('❌ Failed to fetch runs');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, runs: 'error' }));
        toast.error('❌ Runs fetch error');
      }

      // Test 3: Get Leaderboard (Users)
      try {
        const usersResponse = await api.users.getLeaderboard(5);
        if (usersResponse.success) {
          setTestResults(prev => ({ ...prev, users: 'success' }));
          toast.success('✅ Leaderboard fetched');
        } else {
          setTestResults(prev => ({ ...prev, users: 'error' }));
          toast.error('❌ Failed to fetch leaderboard');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, users: 'error' }));
        toast.error('❌ Users fetch error');
      }

    } catch (error) {
      console.error('API test error:', error);
      toast.error('❌ API connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

  const allTestsPassed = Object.values(testResults).every(status => status === 'success');
  const anyTestFailed = Object.values(testResults).some(status => status === 'error');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            API Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Health Check Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults.health)}
              <div>
                <h3 className="font-medium">Health Check</h3>
                <p className="text-sm text-muted-foreground">
                  {healthLoading ? 'Testing...' : 
                   healthError ? 'Connection failed' : 
                   healthData?.success ? 'API is running' : 'Unknown status'}
                </p>
              </div>
            </div>
            {getStatusBadge(testResults.health)}
          </div>

          {/* Active Runs Test */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults.runs)}
              <div>
                <h3 className="font-medium">Active Runs</h3>
                <p className="text-sm text-muted-foreground">
                  Test fetching active trading runs
                </p>
              </div>
            </div>
            {getStatusBadge(testResults.runs)}
          </div>

          {/* Users/Leaderboard Test */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults.users)}
              <div>
                <h3 className="font-medium">User Data</h3>
                <p className="text-sm text-muted-foreground">
                  Test fetching user leaderboard
                </p>
              </div>
            </div>
            {getStatusBadge(testResults.users)}
          </div>

          {/* Test Button */}
          <Button 
            onClick={testApiConnection} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test API Connection'
            )}
          </Button>

          {/* Results Summary */}
          {allTestsPassed && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">All tests passed! 🎉</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Your frontend is successfully connected to the API.
              </p>
            </div>
          )}

          {anyTestFailed && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Some tests failed</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Check your API server and environment variables.
              </p>
            </div>
          )}

          {/* Environment Info */}
          <div className="p-4 bg-gray-50 border rounded-lg">
            <h4 className="font-medium mb-2">Environment Info</h4>
            <div className="text-sm space-y-1">
              <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}</p>
              <p><strong>WS URL:</strong> {import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws'}</p>
              <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

