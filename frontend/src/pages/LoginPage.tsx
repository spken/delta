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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          {/* Logo and branding */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 text-white">
              DELTA
            </h1>
            <p className="text-gray-400">
              Diff Explanation & Linguistic Transformation Assistant
            </p>
          </div>

          {/* Description */}
          <div className="mb-8 text-center space-y-2">
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
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-8"
          >
            <GitlabIcon className="w-5 h-5" />
            <span>Connect with GitLab</span>
          </button>

          {/* Features list */}
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Features
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Smart caching for instant re-analysis</p>
              <p>• Handles large MRs with intelligent chunking</p>
              <p>• Full discussion and commit history analysis</p>
              <p>• Secure OAuth 2.0 authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
