import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { default: axios } = await import('axios');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/login`, { email, password });
      
      const userData = response.data.user;
      if (userData) {
        login(userData);
        navigate(from);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi đăng nhập');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900/80 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
        <div>
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="TaskMaster Logo" className="h-12 w-12 object-contain" />
          </div>
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">Đăng nhập</h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">Nhập thông tin để truy cập hệ thống.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm text-center border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
            </button>
          </div>
        </form>
        
        <div className="flex justify-center text-sm mt-6">
          <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}
