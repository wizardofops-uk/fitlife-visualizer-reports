import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFitness } from '@/context/FitnessContext';
import { toast } from 'sonner';
import { Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  FitbitImportProps, 
  DateRange, 
  AuthState, 
  FitbitImportedData,
  FitbitTokenResponse
} from '@/types/fitbit';
import { 
  exchangeCodeForToken, 
  fetchNutritionData, 
  fetchActivityData, 
  fetchWaterData,
  processMealData,
  generateCodeVerifier,
  generateCodeChallenge,
  fetchWithRetry,
  RateLimitError
} from '@/utils/fitbitApi';
import { processImportedData } from '@/utils/fitnessDataHelpers';

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const LOCAL_STORAGE_AUTH_KEY = 'fitbit_auth';

const FitbitImport: React.FC<FitbitImportProps> = ({ onImportSuccess }) => {
  const { importData } = useFitness();
  const [clientId, setClientId] = useState<string>(() => {
    return localStorage.getItem('fitbit_client_id') || '';
  });
  const [clientSecret, setClientSecret] = useState<string>(() => {
    return localStorage.getItem('fitbit_client_secret') || '';
  });
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAuthorizing: false,
    isLoading: false,
    authToken: null
  });
  
  // Set default date range to last 7 days
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultEndDate.getDate() - 7);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    start: defaultStartDate,
    end: defaultEndDate,
  });

  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  const [error, setError] = useState<{
    message: string;
    date: string;
    type: 'nutrition' | 'activity' | 'water';
  } | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  // Add date validation
  const validateDateRange = useCallback((start: Date, end: Date): boolean => {
    if (start > end) {
      toast.error('Invalid date range: Start date must be before end date');
      return false;
    }
    
    const maxDays = 30;
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxDays) {
      toast.error(`Date range too large: Please select a range of ${maxDays} days or less`);
      return false;
    }
    
    return true;
  }, []);

  const handleDateChange = useCallback((date: Date | undefined, type: 'start' | 'end') => {
    if (!date) return;
    
    const newDateRange = { ...dateRange, [type]: date };
    if (validateDateRange(newDateRange.start, newDateRange.end)) {
      setDateRange(newDateRange);
    }
  }, [dateRange, validateDateRange]);

  const handleTokenExchange = useCallback(async (code: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const savedClientId = localStorage.getItem('fitbit_client_id') || clientId;
      const savedCodeVerifier = localStorage.getItem('code_verifier');
      
      if (!savedCodeVerifier) {
        throw new Error('Missing code verifier');
      }

      // Use custom protocol for Electron, web URL for web builds
      const redirectUri = window.electron 
        ? 'fitlife://callback'
        : window.location.origin + window.location.pathname;

      const tokenData = await exchangeCodeForToken(
        code,
        savedClientId,
        savedCodeVerifier,
        redirectUri
      );

      if (!tokenData || !tokenData.access_token) {
        throw new Error('Invalid token response');
      }

      setAuthState(prev => ({
        ...prev,
        authToken: tokenData,
        isAuthenticated: true,
        isLoading: false
      }));

      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(tokenData));
      localStorage.removeItem('code_verifier');
      localStorage.removeItem('code_state');
      localStorage.removeItem('auth_code');

      toast.success('Authentication successful: You are now connected to Fitbit');
    } catch (error) {
      console.error('Token exchange error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthorizing: false
      }));
      toast.error(error instanceof Error ? error.message : 'Failed to authenticate with Fitbit');
    }
  }, [clientId, clientSecret]);

  useEffect(() => {
    // Handle OAuth callback from main process (Electron)
    const handleOAuthCallback = (event: any, data: { code: string; state: string }) => {
      const savedState = localStorage.getItem('code_state');
      if (data.code && data.state && data.state === savedState) {
        localStorage.setItem('auth_code', data.code);
        handleTokenExchange(data.code);
      }
    };

    // Add IPC listener for Electron
    if (window.electron) {
      window.electron.on('oauth-callback', handleOAuthCallback);
    }

    // Check for auth code in URL (Web)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const savedState = localStorage.getItem('code_state');

    if (code && state && state === savedState) {
      localStorage.setItem('auth_code', code);
      handleTokenExchange(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen for protocol callback from Electron (single instance)
    const handleOAuthCallbackUrl = (_event: any, url: string) => {
      try {
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const state = urlObj.searchParams.get('state');
        const savedState = localStorage.getItem('code_state');
        if (code && state && state === savedState) {
          localStorage.setItem('auth_code', code);
          handleTokenExchange(code);
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    };
    if (window.electron) {
      window.electron.on('oauth-callback-url', handleOAuthCallbackUrl);
    }

    // Cleanup
    return () => {
      if (window.electron) {
        window.electron.removeListener('oauth-callback', handleOAuthCallback);
        window.electron.removeListener('oauth-callback-url', handleOAuthCallbackUrl);
      }
    };
  }, [handleTokenExchange]);

  const initiateAuth = useCallback(async () => {
    if (!clientId.trim()) {
      toast.error('Client ID required: Please enter your Fitbit API Client ID');
      return;
    }

    // Store client ID in localStorage
    localStorage.setItem('fitbit_client_id', clientId.trim());
    if (clientSecret.trim()) {
      localStorage.setItem('fitbit_client_secret', clientSecret.trim());
    }
  
    setAuthState(prev => ({ ...prev, isAuthorizing: true }));
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const codeState = generateCodeVerifier();
  
    // Use custom protocol for Electron, web URL for web builds
    const redirectUri = window.electron 
      ? 'fitlife://callback'
      : window.location.origin + window.location.pathname;
      
    const authUrl = new URL(FITBIT_AUTH_URL);
    authUrl.searchParams.append('client_id', clientId.trim());
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'nutrition activity profile weight');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', "S256");
    authUrl.searchParams.append('state', codeState);
  
    localStorage.setItem('code_verifier', codeVerifier);
    localStorage.setItem('code_state', codeState);
  
    // For Electron, open in default browser
    if (window.process?.versions?.electron) {
      window.electron?.openExternal(authUrl.toString());
    } else {
    window.location.href = authUrl.toString();
    }
  }, [clientId, clientSecret]);

  function handleRetry() {
    if (error && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchFitbitData();
    } else {
      toast.error('Import failed: Maximum retry attempts reached. Please try again later.');
      setError(null);
      setRetryCount(0);
    }
  }

  const fetchFitbitData = useCallback(async () => {
    if (!authState.authToken?.access_token) {
      toast.error('Import failed: No valid access token found. Please reconnect to Fitbit.');
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const meals = [];
      const activities = [];
      const waterLogs = [];
      let hasData = false;
      
      let currentDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const totalDays = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      let currentDay = 0;
      
      while (currentDate <= endDate) {
        currentDay++;
        setImportProgress({
          current: currentDay,
          total: totalDays,
          status: `Fetching data for ${format(currentDate, "MMM d, yyyy")}...`
        });
        
        const dateStr = format(currentDate, "yyyy-MM-dd");
        
        try {
          // Test API connection first with proper error handling
          const testResponse = await fetchWithRetry<Response>('/api/fitbit/1/user/-/profile.json', {
            headers: {
              'Authorization': `Bearer ${authState.authToken.access_token}`,
            },
          }, 3, 1000, true);

          console.log('Test API Response:', testResponse);

          if (!testResponse) {
            throw new Error('API test failed: No response received');
          }

          // Handle case where response is not a standard Response object
          if (!('status' in testResponse)) {
            console.error('Invalid response format:', testResponse);
            throw new Error('API test failed: Invalid response format received');
          }

          // Verify the token is still valid
          if (testResponse.status === 401) {
            throw new Error('Access token is invalid or expired. Please reconnect to Fitbit.');
          }

          if (!testResponse.ok) {
            let errorMessage = 'API test failed';
            if (testResponse.status) {
              errorMessage += `: ${testResponse.status}`;
            }
            if (testResponse.statusText) {
              errorMessage += ` ${testResponse.statusText}`;
            }
            
            try {
              if (typeof testResponse.text === 'function') {
                const errorText = await testResponse.text();
                errorMessage += ` - ${errorText}`;
              } else if (testResponse instanceof Error) {
                errorMessage += ` - ${testResponse.message}`;
              } else if (typeof testResponse === 'object') {
                errorMessage += ` - ${JSON.stringify(testResponse)}`;
              }
            } catch (e) {
              console.error('Error reading response:', e);
            }
            throw new Error(errorMessage);
          }

          // Fetch nutrition data
          const nutritionData = await fetchNutritionData(authState.authToken.access_token, dateStr);
          if (nutritionData && nutritionData.foods) {
            const processedMeals = processMealData(nutritionData);
            if (processedMeals.length > 0) {
              meals.push(...processedMeals);
              hasData = true;
            }
          }
          
          // Fetch activity data
          const activityData = await fetchActivityData(authState.authToken.access_token, dateStr);
          if (activityData && activityData.summary) {
            activities.push({
              date: dateStr,
              summary: activityData.summary
            });
            hasData = true;
          }
          
          // Fetch water data
          const waterData = await fetchWaterData(authState.authToken.access_token, dateStr);
          if (waterData && waterData.summary) {
            waterLogs.push({
              Date: dateStr,
              Water: (waterData.summary?.water || 0).toString(),
              'Water Goal': (waterData.goals?.water || 0).toString(),
            });
            hasData = true;
          }
        } catch (err) {
          console.error(`Error fetching data for ${dateStr}:`, err);
          setError({
            message: err instanceof Error ? err.message : 'Unknown error occurred',
            date: dateStr,
            type: 'nutrition'
          });
          throw err;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Only process and import data if we have at least some data
      if (!hasData) {
        throw new Error('No data was found for the selected date range');
      }

      const importedData: FitbitImportedData = {
        meals,
        activities,
        water: waterLogs
      };

      // Process the imported data to generate daily data
      const processedData = processImportedData(importedData);

      // Validate that we have some daily data after processing
      if (!processedData.dailyData || Object.keys(processedData.dailyData).length === 0) {
        throw new Error('No valid data was processed from the imported data');
      }

      importData(processedData);
      onImportSuccess(processedData);
      
      toast.success(`Data imported successfully: Imported ${meals.length} meals, ${activities.length} activities, and ${waterLogs.length} water records`);
    } catch (error) {
      // If a rate limit error is received, break connection and show rate limit toast
      if (
        error instanceof RateLimitError || 
        (error instanceof Error && (
          error.message.includes('429') || error.message.toLowerCase().includes('rate limit')
        ))
      ) {
        toast.error('Rate limit exceeded: Too many requests to Fitbit API. Please reconnect to Fitbit.');
        handleDisconnect();
        return;
      }
      console.error('Import error:', error);
      if (retryCount < 3) {
        toast.error(`Import failed: Retrying import (${retryCount + 1}/3)...`);
        setTimeout(handleRetry, 2000);
      } else {
        toast.error(error instanceof Error ? error.message : 'There was an error importing your Fitbit data');
      }
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      setImportProgress(null);
    }
  }, [authState.authToken, dateRange, importData, onImportSuccess, retryCount]);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    setAuthState(prev => ({
      ...prev,
      authToken: null,
      isAuthenticated: false
    }));
    
    toast.success('Disconnected: You have been disconnected from Fitbit');
  }, []);

  // Add token expiration check
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (authState.authToken?.expires_in) {
        const tokenExpiration = new Date(authState.authToken.expires_in * 1000);
        if (new Date() > tokenExpiration) {
          handleDisconnect();
          toast.error('Session expired: Your Fitbit session has expired. Please reconnect.');
        }
      }
    };

    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [authState.authToken]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Fitbit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!authState.isAuthenticated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-id">Fitbit API Client ID</Label>
              <Input
                id="client-id"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your Fitbit API Client ID"
                disabled={authState.isAuthorizing || authState.isLoading}
              />
              <p className="text-xs text-muted-foreground">
                You can obtain this from the Fitbit developer dashboard
              </p>
            </div>
            
            <Button
              onClick={initiateAuth}
              className="w-full"
              disabled={authState.isAuthorizing || authState.isLoading}
            >
              {authState.isAuthorizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect to Fitbit"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="text-sm font-medium">Connected to Fitbit</p>
              <p className="text-xs text-muted-foreground">User ID: {authState.authToken?.user_id}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.start && "text-muted-foreground"
                        )}
                        disabled={authState.isLoading}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.start ? format(dateRange.start, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(date) => handleDateChange(date, 'start')}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.end && "text-muted-foreground"
                        )}
                        disabled={authState.isLoading}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.end ? format(dateRange.end, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(date) => handleDateChange(date, 'end')}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-md text-center">
                <p className="text-sm font-medium">
                  Importing data from {format(dateRange.start, "PPP")} to {format(dateRange.end, "PPP")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))} days of data
                </p>
              </div>

              {error ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="text-sm text-destructive">
                    Error importing data for {error.date}: {error.message}
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="w-full"
                  >
                    Retry Import
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={fetchFitbitData}
                  disabled={authState.isLoading}
                  className="w-full"
                >
                  {authState.isLoading ? (
                    <div className="flex items-center justify-center w-full">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {importProgress ? (
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">
                            {importProgress.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {importProgress.current} of {importProgress.total} days
                          </span>
                        </div>
                      ) : (
                        "Importing Data..."
                      )}
                    </div>
                  ) : (
                    "Import Fitbit Data"
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={authState.isLoading}
                className="w-full"
              >
                Disconnect from Fitbit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FitbitImport;
