import { createBrowserRouter, createHashRouter, RouterProvider, Link, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import DataImportPage from '@/pages/DataImportPage';
import DashboardPage from '@/pages/DashboardPage';
import AuthPage from '@/pages/AuthPage';
import { Button } from '@/components/ui/button';
import { FitnessProvider } from '@/context/FitnessContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileButton } from '@/components/auth/ProfileButton';
import { Settings, Upload, Download, Home, Heart } from 'lucide-react';
import SettingsPage from '@/pages/Settings';
import ExportPage from '@/pages/ExportPage';
import { useEffect } from 'react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* App Bar */}
      <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50 pt-safe-top" style={{ paddingTop: 'max(env(safe-area-inset-top), 28px)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/80 transition-colors"
                title="Home"
                aria-label="Home"
              >
                <Home className="w-4 h-4" />
              </Link>
              <Link
                to="/import"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/80 transition-colors"
                title="Import Data"
                aria-label="Import Data"
              >
                <Download className="w-4 h-4" />
              </Link>
              <Link
                to="/export"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/80 transition-colors"
                title="Export PDF"
                aria-label="Export PDF"
              >
                <Upload className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              <h1 className="text-lg font-bold">FitLife</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/settings"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/80 transition-colors"
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <ProfileButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="safe-area-inset">
          <Outlet />
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
};

const isElectron = typeof window !== 'undefined' && window.process && window.process.versions && window.process.versions.electron;
const router = isElectron ? createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'import',
        element: <DataImportPage />,
      },
      {
        path: 'export',
        element: <ExportPage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]) : createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'import',
        element: <DataImportPage />,
      },
      {
        path: 'export',
        element: <ExportPage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  useEffect(() => {
    console.log('App loaded. Current location:', window.location.pathname);
  }, []);
  return (
    <FitnessProvider>
      <RouterProvider router={router} />
    </FitnessProvider>
  );
}

export default App;
