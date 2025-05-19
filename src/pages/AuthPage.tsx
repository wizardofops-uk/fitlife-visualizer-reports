import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthStatus from '@/components/auth/AuthStatus';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (email) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="container mx-auto py-8">
      <ErrorBoundary>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthStatus />
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  );
} 