import { useDiscordAuth } from '@/hooks/useDiscordAuth';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthorized } = useDiscordAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      navigate('/admin-login?error=unauthorized');
    }
  }, [isLoading, isAuthorized, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Verificando autenticación</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}