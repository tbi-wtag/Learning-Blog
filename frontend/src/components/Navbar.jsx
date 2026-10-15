import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 py-4 px-6 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-sky-400">
        <BookOpen className="w-6 h-6" />
        <span>DevResources</span>
      </Link>
      <div className="flex gap-4">
        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <UserPlus className="w-4 h-4" /> Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}