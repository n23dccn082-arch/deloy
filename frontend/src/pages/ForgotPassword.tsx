import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Timer, RefreshCw } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('binpro015@gmail.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Timer for resend button (60s)
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (resendTimer > 0) return; // Prevent spam

    setError('');
    setLoading(true);
    
    try {
      // Gọi API Backend Java
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/forgot-password`, { email });
      setStep(2);
      setResendTimer(60); // Bắt đầu đếm ngược 60s
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể gửi OTP. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      // Gọi API Backend Java xác thực OTP
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/verify-otp`, { email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length <= 6) {
      setError('Mật khẩu mới phải trên 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    
    setLoading(true);
    try {
      // Gọi API Backend Java đổi mật khẩu
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/reset-password`, { email, newPassword });
      navigate('/login?reset=success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Chỉ cho phép số
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a]">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900/60 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              {step === 1 ? <Mail className="w-6 h-6 text-white" /> : 
               step === 2 ? <KeyRound className="w-6 h-6 text-white" /> : 
               <CheckCircle2 className="w-6 h-6 text-white" />}
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
            {step === 1 ? 'Khôi phục mật khẩu' : 
             step === 2 ? 'Xác thực OTP' : 'Tạo mật khẩu mới'}
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {step === 1 ? 'Nhập email của bạn để nhận mã xác thực.' : 
             step === 2 ? `Mã xác thực đã được gửi đến ${email}` : 'Vui lòng nhập mật khẩu mới của bạn.'}
          </p>
        </div>
        
        <div className="relative z-10 mt-8">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email đã đăng ký</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
              >
                {loading ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex justify-between items-center">
                  <span>Mã OTP (6 chữ số)</span>
                  <span className="text-xs text-orange-500 flex items-center gap-1">
                    <Timer className="w-3 h-3" /> Hết hạn sau 5 phút
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-bold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="------"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:from-zinc-500 disabled:to-zinc-600 hover:-translate-y-0.5"
                >
                  {loading ? 'Đang xác thực...' : 'Xác thực'}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={resendTimer > 0 || loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-zinc-700 dark:text-zinc-300 font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? '' : ''}`} />
                  {resendTimer > 0 ? `Gửi lại mã sau ${resendTimer}s` : 'Gửi lại mã OTP'}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setStep(1); setResendTimer(0); }}
                  className="w-full text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mt-2 text-center transition-colors"
                >
                  Đổi email nhận mã
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
              >
                {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}
        </div>

        {step === 1 && (
          <div className="relative z-10 flex justify-center mt-6">
            <Link to="/login" className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
