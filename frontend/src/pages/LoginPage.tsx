/**
 * Login page - Entry point for authentication.
 * Ultra-minimal OAuth-only login with centered content.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GitlabIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Redirect to analysis page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/analysis', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        {/* Logo */}
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">DELTA</h1>

        {/* Tagline */}
        <p className="text-zinc-500 mb-8">AI-powered merge request analysis</p>

        {/* GitLab button */}
        <Button onClick={handleLogin} size="lg">
          <GitlabIcon className="w-5 h-5 mr-2" />
          Continue with GitLab
        </Button>
      </div>
    </div>
  );
}
