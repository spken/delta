/**
 * Navigation bar for authenticated pages.
 * Displays app logo and user info with logout button.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo only */}
          <Link to="/analysis" className="text-xl font-bold text-zinc-900">
            DELTA
          </Link>

          {/* Right: User + Logout */}
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-zinc-500">{user.username}</span>}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
