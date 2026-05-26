import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="TaskMaster Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            TaskMaster
          </span>
        </div>
        
        {user && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/projects" className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              Dự án
            </Link>
            <Link to="/tasks" className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              Nhiệm vụ
            </Link>
            <Link to="/reports" className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              Báo cáo
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-sm font-medium px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
