/**
 * OAuth callback page.
 * The backend handles the actual OAuth flow and redirects here after authentication.
 * This page re-checks auth status and redirects to the analysis page.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export default function CallbackPage() {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Give the backend a moment to set the cookie
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Re-check authentication status
        await checkAuth();

        // Show success message
        toast.success('Successfully logged in!');

        // Redirect to analysis page
        navigate('/analysis', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [checkAuth, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}
