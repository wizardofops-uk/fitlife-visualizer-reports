import { toast } from 'sonner';

export class FitbitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'FitbitError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const handleError = (error: unknown) => {
  console.error('Error occurred:', error);

  if (error instanceof FitbitError) {
    toast.error(error.message || 'Fitbit API Error');
  } else if (error instanceof NetworkError) {
    toast.error(error.message || 'Network Error');
  } else if (error instanceof ValidationError) {
    toast.error(error.message || 'Validation Error');
  } else {
    toast.error('An unexpected error occurred. Please try again.');
  }
}; 