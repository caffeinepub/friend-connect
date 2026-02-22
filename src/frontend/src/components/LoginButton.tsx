import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface LoginButtonProps {
  onLogout: () => void;
}

export default function LoginButton({ onLogout }: LoginButtonProps) {
  const { login, loginStatus, identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await onLogout();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? 'outline' : 'default'}
      className="gap-2"
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          Login
        </>
      )}
    </Button>
  );
}
