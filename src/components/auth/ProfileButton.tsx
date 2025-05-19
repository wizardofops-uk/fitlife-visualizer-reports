import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFitness } from '@/context/FitnessContext';
import { toast } from 'sonner';
import { DatabaseService } from '@/services/database';
import { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut } from 'lucide-react';

export function ProfileButton() {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, clearData } = useFitness();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const email = localStorage.getItem('user_email');
      if (email && isAuthenticated) {
        setUserEmail(email);
      } else if (!email) {
        setUserEmail(null);
        setIsAuthenticated(false);
      }
    };

    fetchUserEmail();
  }, [isAuthenticated, setIsAuthenticated]);

  const handleSignOut = () => {
    localStorage.removeItem('user_email');
    setIsAuthenticated(false);
    clearData();
    setUserEmail(null);
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-8 w-8 rounded-full"
        >
          <UserIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAuthenticated && userEmail ? (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => navigate('/auth')}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Sign in</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 