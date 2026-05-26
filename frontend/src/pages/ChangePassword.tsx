import { Link, useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Đổi mật khẩu
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.
              </p>
            </div>
            
            <Link to="/profile" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Về Hồ sơ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full pointer-events-none" />
        
        <div className="max-w-2xl mx-auto relative">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-xl p-6 shadow-sm">
            <ChangePasswordForm />
          </div>
        </div>
      </main>
    </div>
  );
}
