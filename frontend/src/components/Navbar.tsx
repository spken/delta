/**
 * Navigation bar for authenticated pages.
 * Provides links to Analysis and History pages, and logout button.
 */
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, FileSearch, History } from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/analysis" className="text-xl font-bold text-white">
              DELTA
            </Link>

            {/* Navigation links */}
            <div className="flex gap-2">
              <Link
                to="/analysis"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/analysis')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <FileSearch className="w-4 h-4" />
                <span>Analysis</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/history')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-400">
                <span className="text-gray-500">Logged in as</span>{' '}
                <span className="text-white font-medium">{user.username}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
