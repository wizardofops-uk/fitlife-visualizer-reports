import { toast } from 'sonner';
import { 
  FitbitError, 
  FitbitTokenResponse, 
  FitbitFoodLogResponse, 
  FitbitActivityResponse, 
  FitbitWaterResponse 
} from '@/types/fitbit';

const IS_ELECTRON = typeof window !== 'undefined' && !!window.electron;
const FITBIT_API_URL = IS_ELECTRON ? 'https://api.fitbit.com' : '/api/fitbit';
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

// Error handling
export const handleFitbitError = (error: unknown): FitbitError => {
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      details: error.stack
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred'
  };
};

// Error thrown when Fitbit API rate limit is reached
export class RateLimitError extends Error {
  constructor() {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

// Helper to extract Authorization header value from HeadersInit
function getAuthorizationHeader(headers: HeadersInit | undefined): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    return headers.get('Authorization') || headers.get('authorization') || undefined;
  }
  if (Array.isArray(headers)) {
    const found = headers.find(([k]) => k.toLowerCase() === 'authorization');
    return found ? found[1] : undefined;
  }
  if (typeof headers === 'object') {
    // TypeScript: headers may be Record<string, string>
    return (headers as Record<string, string>)['Authorization'] || (headers as Record<string, string>)['authorization'];
  }
  return undefined;
}

// API request with retry logic
export const fetchWithRetry = async <T>(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  baseDelay = BASE_DELAY,
  returnResponse = false
): Promise<T> => {
  try {
    if (IS_ELECTRON && window.electron?.fitbitApiFetch) {
      // Use Electron IPC to main process for all Fitbit API calls
      const accessToken = getAuthorizationHeader(options.headers)?.replace('Bearer ', '');
      if (!accessToken) throw new Error('No access token provided for Fitbit API call in Electron');
      
      // Remove any /api/fitbit prefix from the URL since we're in Electron
      const cleanUrl = url.replace(/^\/api\/fitbit/, '');
      // Ensure we don't double-prefix the URL
      const fullUrl = cleanUrl.startsWith('https://api.fitbit.com') 
        ? cleanUrl 
        : 'https://api.fitbit.com' + cleanUrl;
      
      console.log('Making Fitbit API request to:', fullUrl);
      
      const response = await window.electron.fitbitApiFetch({ url: fullUrl, accessToken });
      
      // If returnResponse is true, create a Response-like object
      if (returnResponse) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: async () => JSON.stringify(response),
          json: async () => response,
        } as unknown as T;
      }
      
      return response as T;
    }

    // Browser: use standard fetch
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 429) {
      throw new RateLimitError();
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (returnResponse) {
      return response as unknown as T;
    }

    return response.json();
  } catch (error) {
    if (
      error instanceof RateLimitError ||
      (error instanceof Error && error.message.includes('429'))
    ) {
      throw error;
    }
    if (retries > 0) {
      const delay = baseDelay * Math.pow(2, MAX_RETRIES - retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, baseDelay * 2, returnResponse);
    }
    throw error;
  }
};

// Token management
export const exchangeCodeForToken = async (
  code: string,
  clientId: string,
  codeVerifier: string,
  redirectUri: string
): Promise<FitbitTokenResponse> => {
  if (IS_ELECTRON && window.electron) {
    // Use Electron IPC to main process
    return window.electron.fitbitExchangeToken({ code, clientId, codeVerifier, redirectUri });
  }
  // Browser: use Vite proxy
  try {
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('code_verifier', codeVerifier);
    formData.append('redirect_uri', redirectUri);

    // For client-based authentication, we only need the client_id in the form data
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    console.log('Token Exchange Request:', {
      url: `${FITBIT_API_URL}/oauth2/token`,
      method: 'POST',
      headers,
      body: Object.fromEntries(formData.entries())
    });

    const response = await fetch(`${FITBIT_API_URL}/oauth2/token`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || 'Failed to exchange code for token');
    }

    const tokenData = await response.json();
    console.log('Token Exchange Response:', tokenData);
    return tokenData;
  } catch (error) {
    const fitbitError = handleFitbitError(error);
    toast.error(fitbitError.message || 'Authentication failed');
    throw fitbitError;
  }
};

// Data fetching
export const fetchNutritionData = async (
  accessToken: string,
  date: string
): Promise<FitbitFoodLogResponse> => {
  try {
    const response = await fetchWithRetry<FitbitFoodLogResponse>(
      `${FITBIT_API_URL}/1/user/-/foods/log/date/${date}.json`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    console.log('Raw Fitbit nutrition response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    throw error;
  }
};

export const fetchActivityData = async (
  accessToken: string,
  date: string
): Promise<FitbitActivityResponse> => {
  return fetchWithRetry<FitbitActivityResponse>(
    `${FITBIT_API_URL}/1/user/-/activities/date/${date}.json`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
};

export const fetchWaterData = async (
  accessToken: string,
  date: string
): Promise<FitbitWaterResponse> => {
  return fetchWithRetry<FitbitWaterResponse>(
    `${FITBIT_API_URL}/1/user/-/foods/log/water/date/${date}.json`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
};

// Data processing
export const processMealData = (foodLog: FitbitFoodLogResponse): any[] => {
  console.log('Processing food log:', foodLog);
  
  if (!foodLog || !foodLog.foods || !Array.isArray(foodLog.foods)) {
    console.error('Invalid food log structure:', foodLog);
    return [];
  }

  const mealTypeMap: { [key: number]: string } = {
    1: 'Breakfast',
    2: 'Morning Snack',
    3: 'Lunch',
    4: 'Afternoon Snack',
    5: 'Dinner',
    6: 'Evening Snack',
    7: 'Anytime'
  };

  return foodLog.foods.map(food => {
    console.log('Processing food item:', food);

    // Use destructuring for proper types
    const { loggedFood, nutritionalValues, logDate: itemLogDate } = food;
    const logDate = itemLogDate
      ? new Date(itemLogDate)
      : foodLog.date
      ? new Date(foodLog.date!)
      : new Date();

    // Ensure we have a valid date string in yyyy-MM-dd format
    const dateStr = logDate.toISOString().split('T')[0];
    console.log('Processed date string:', dateStr);

    const processedFood = {
      Date: dateStr, // Keep Date for backward compatibility
      date: dateStr, // Add date field to match expected structure
      Day: logDate.toLocaleDateString('en-US', { weekday: 'long' }),
      Meal: mealTypeMap[loggedFood.mealTypeId] || 'Other',
      Name: loggedFood.name || 'Unknown Food',
      BrandName: loggedFood.brand || (loggedFood as any).brandName || (loggedFood as any).brand_name || '',
      Amount: loggedFood.amount?.toString() || '1',
      Unit: loggedFood.unit?.name || 'serving',
      Cals: nutritionalValues.calories?.toString() || loggedFood.calories?.toString() || '0',
      Carbs: nutritionalValues.carbs?.toString() || '0',
      Fat: nutritionalValues.fat?.toString() || '0',
      Protein: nutritionalValues.protein?.toString() || '0',
    };

    console.log('Processed food item:', processedFood);
    return processedFood;
  });
};

// Security utilities
export const generateCodeVerifier = (): string => {
  return Array.from(window.crypto.getRandomValues(new Uint8Array(45)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}; 