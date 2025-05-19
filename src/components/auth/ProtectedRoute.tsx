import { ReactNode } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useFitness } from '@/context/FitnessContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated } = useFitness();
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  if (requireAuth && (!isAuthenticated || !userId)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {!isAuthenticated && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-orange-800">
                  You are in temporary mode. Your data will be cleared when you close the browser.
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-orange-800 border-orange-200 hover:bg-orange-100"
                onClick={() => navigate('/auth')}
              >
                Sign in to save your data
              </Button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
} 