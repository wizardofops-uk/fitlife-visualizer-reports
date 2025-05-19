export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export type AuthErrorCode = 
  | 'DB_INIT_ERROR'
  | 'DB_QUERY_ERROR'
  | 'USER_NOT_FOUND'
  | 'INVALID_PASSWORD'
  | 'EMAIL_ALREADY_EXISTS'
  | 'PASSWORD_HASH_ERROR'
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD_FORMAT'
  | 'PASSWORDS_DONT_MATCH'
  | 'UNKNOWN_ERROR';

export interface AuthError {
  message: string;
  code: AuthErrorCode;
  details?: Record<string, unknown>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
} 