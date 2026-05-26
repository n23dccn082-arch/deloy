import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Shield, Mail, KeyRound, ShieldAlert, Edit2, Check, X, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      await axios.patch(`http://localhost:8080/api/users/${user.id}`, { name: editName });
      login({ ...user, name: editName });
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to update name:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;
      setLoading(true);
      try {
        await axios.patch(`http://localhost:8080/api/users/${user.id}`, { avatar: base64Url });
        login({ ...user, avatar: base64Url });
      } catch (err) {
        console.error('Failed to update avatar:', err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Hồ sơ cá nhân
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Quản lý thông tin và bảo mật tài khoản
                </p>
              </div>
            </div>
            
            <Link to="/dashboard" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Về Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Background Gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full pointer-events-none" />

        <div className="grid gap-8 lg:grid-cols-[1fr_384px] relative">
          <section className="space-y-6">
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Thông tin tài khoản</h2>
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border-4 border-white dark:border-zinc-800 flex items-center justify-center shadow-xl overflow-hidden relative">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex-1 w-full space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-1 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-800/30">
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1"><UserCircle className="w-3 h-3"/> Họ tên</span>
                          {!isEditingName && (
                            <button onClick={() => setIsEditingName(true)} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-1 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                        
                        {isEditingName ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={loading}
                              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                            />
                            <button onClick={handleSaveName} disabled={loading} className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={handleCancelEdit} disabled={loading} className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-zinc-900 dark:text-white text-lg">
                            {user.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-800/30">
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Mail className="w-3 h-3"/> Email đăng nhập</span>
                        <span className="font-bold text-zinc-900 dark:text-white text-lg truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/20">
                      <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Shield className="w-3 h-3"/> Chức vụ / Phân quyền</span>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Bảo mật tài khoản</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Đảm bảo mật khẩu của bạn đủ mạnh và được thay đổi định kỳ.</p>
              
              <Link
                to="/profile/change-password"
                className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 text-sm font-bold shadow-md hover:scale-[1.02] transition-transform"
              >
                <KeyRound className="w-4 h-4" /> Đổi mật khẩu
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
