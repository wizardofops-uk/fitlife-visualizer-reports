import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, AuthState, AuthError, AuthErrorCode, AuthFormData } from '@/types/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Spinner } from '@/components/ui/spinner';
import { signInSchema, signUpSchema } from '@/utils/validation/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFitness } from '@/context/FitnessContext';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { initAndSeedDatabase, runQuery, exec } from '@/services/sqliteService';

const AuthStatus = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setUserEmail } = useFitness();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  });
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        await initAndSeedDatabase();
      } catch (error) {
        handleError('Failed to initialize database', 'DB_INIT_ERROR', error);
      }
    };
    initializeDb();
  }, []);

  const handleError = (message: string, code: AuthErrorCode, error?: unknown) => {
    const authError: AuthError = {
      message,
      code,
      details: error instanceof Error ? { stack: error.stack } : undefined,
    };
    setAuthState(prev => ({ ...prev, error: authError, isLoading: false }));
    toast.error(message);
  };

  const validateForm = (data: AuthFormData): boolean => {
    try {
      const schema = isSignUp ? signUpSchema : signInSchema;
      schema.parse(data);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const user = await runQuery<User>('SELECT * FROM users WHERE email = ?', [formData.email]);
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await hashPassword(formData.password);
      if (hashedPassword !== user.password_hash) {
        throw new Error('Invalid password');
      }

      setUserEmail(formData.email);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        isLoading: false,
      }));
      setIsAuthenticated(true);
      toast.success('Successfully signed in');
      navigate('/dashboard');
    } catch (error) {
      handleError(
        error instanceof Error ? error.message : 'An error occurred during sign in',
        'USER_NOT_FOUND',
        error
      );
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const existingUser = await runQuery<User>('SELECT * FROM users WHERE email = ?', [formData.email]);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const passwordHash = await hashPassword(formData.password);
      const userId = await exec('INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id', [formData.email, passwordHash]);
      
      const newUser: User = {
        id: userId,
        email: formData.email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUserEmail(formData.email);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: newUser,
        isLoading: false,
      }));
      setIsAuthenticated(true);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      handleError(
        error instanceof Error ? error.message : 'An error occurred during sign up',
        'EMAIL_ALREADY_EXISTS',
        error
      );
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user_email');
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
    }));
    setIsAuthenticated(false);
    toast.success('Signed out successfully');
  };

  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Signed in as {authState.user.email}
        </span>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Sign up' : 'Sign in'}</CardTitle>
        </CardHeader>
        <CardContent>
          {authState.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authState.error.message}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={authState.isLoading}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={authState.isLoading}
                className={formErrors.password ? 'border-red-500' : ''}
              />
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={authState.isLoading}
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={authState.isLoading}
                onClick={isSignUp ? handleSignUp : handleSignIn}
              >
                {authState.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  isSignUp ? 'Sign up' : 'Sign in'
                )}
              </Button>
            </div>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={authState.isLoading}
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default AuthStatus;
