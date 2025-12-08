/**
 * Login page - Entry point for authentication.
 * Initiates GitLab OAuth flow when user clicks login button.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GitlabIcon } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center max-w-md px-6">
        {/* Logo and branding */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 text-white">
            DELTA
          </h1>
          <p className="text-gray-400 text-lg">
            Diff Explanation & Linguistic Transformation Assistant
          </p>
        </div>

        {/* Description */}
        <div className="mb-10 space-y-2">
          <p className="text-gray-300">
            Intelligent GitLab Merge Request summarization powered by Azure
            OpenAI.
          </p>
          <p className="text-gray-500 text-sm">
            Get AI-generated technical summaries of your merge requests in
            seconds.
          </p>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <GitlabIcon className="w-5 h-5" />
          <span>Connect with GitLab</span>
        </button>

        {/* Features list */}
        <div className="mt-12 text-left space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Features
          </h3>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Smart caching for instant re-analysis</p>
            <p>• Handles large MRs with intelligent chunking</p>
            <p>• Full discussion and commit history analysis</p>
            <p>• Secure OAuth 2.0 authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}
