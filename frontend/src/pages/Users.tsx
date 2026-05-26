import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Shield, Trash2, UserCog, Edit2, Key } from 'lucide-react';
import CreateUserForm from '../components/CreateUserForm';

import { formatRole } from '../lib/formatters';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const roles = ['SUPER_ADMIN', 'TASK_MANAGER', 'MEMBER', 'CLIENT', 'EXECUTIVE'];

import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'SUPER_ADMIN';
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const { default: axios } = await import('axios');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users`);
      setUsers(response.data);
    } catch (err) {
      setError('Lỗi khi tải danh sách nhân viên');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    setLoading(true);
    try {
      const { default: axios } = await import('axios');
      await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users/${userId}/role`, { role });
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      setError('Lỗi khi cập nhật vai trò');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Xóa nhân viên này khỏi hệ thống? Tất cả dữ liệu liên quan có thể bị ảnh hưởng.')) return;
    setLoading(true);
    try {
      const { default: axios } = await import('axios');
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (err) {
      setError('Lỗi khi xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = async (userId: string, currentName: string) => {
    const newName = window.prompt('Nhập tên mới:', currentName);
    if (!newName || newName.trim() === '' || newName === currentName) return;
    
    setLoading(true);
    try {
      const { default: axios } = await import('axios');
      await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users/${userId}`, { name: newName.trim() });
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, name: newName.trim() } : u));
    } catch (err) {
      setError('Lỗi khi cập nhật tên');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (userId: string, currentEmail: string) => {
    const newEmail = window.prompt('Nhập email mới:', currentEmail);
    if (!newEmail || newEmail.trim() === '' || newEmail === currentEmail) return;
    
    setLoading(true);
    setError('');
    try {
      const { default: axios } = await import('axios');
      await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users/${userId}`, { email: newEmail.trim() });
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, email: newEmail.trim() } : u));
    } catch (err: any) {
      if (err.response?.data?.error === 'Email is already in use') {
        setError('Email này đã được sử dụng bởi người dùng khác');
      } else {
        setError('Lỗi khi cập nhật email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (userId: string) => {
    const newPassword = window.prompt('Nhập mật khẩu mới cho người dùng này:');
    if (!newPassword || newPassword.trim() === '') return;
    
    setLoading(true);
    setError('');
    try {
      const { default: axios } = await import('axios');
      await axios.patch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users/${userId}`, { password: newPassword });
      alert('Đã cập nhật mật khẩu thành công!');
    } catch (err) {
      setError('Lỗi khi cập nhật mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50';
      case 'TASK_MANAGER': return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50';
      case 'MEMBER': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50';
      case 'CLIENT': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50';
      case 'EXECUTIVE': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50';
      default: return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/50';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Quản lý nhân sự
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Phân quyền và cấp phát tài khoản
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
        <div className="absolute top-10 right-0 w-[500px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full pointer-events-none" />

        <div className="grid gap-8 lg:grid-cols-[384px_1fr]">
          <aside className="space-y-6">
            {isAdmin ? (
              <CreateUserForm onUserCreated={fetchUsers} />
            ) : (
              <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Chỉ dành cho Admin</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Bạn không có quyền cấp phát tài khoản hoặc thay đổi vai trò.</p>
              </div>
            )}
          </aside>

          <section>
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" /> Danh sách hệ thống ({users.length})
                </h2>
              </div>
              
              {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-900/30">{error}</div>}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Nhân viên</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Vai trò</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-transparent">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-zinc-900 dark:text-white">{user.name}</div>
                                {isAdmin && (
                                  <button onClick={() => handleNameChange(user.id, user.name)} className="text-zinc-400 hover:text-indigo-500 transition-colors" title="Đổi tên">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>
                                {isAdmin && (
                                  <button onClick={() => handleEmailChange(user.id, user.email)} className="text-zinc-400 hover:text-indigo-500 transition-colors" title="Đổi email">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleColor(user.role)}`}>
                              {formatRole(user.role)}
                            </span>
                            <div className="relative">
                              <select
                                value={user.role}
                                onChange={(event) => handleRoleChange(user.id, event.target.value)}
                                disabled={loading || !isAdmin}
                                className="appearance-none cursor-pointer rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white py-1.5 pl-3 pr-8 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {roles.map((role) => (
                                  <option key={role} value={role}>{formatRole(role)}</option>
                                ))}
                              </select>
                              {isAdmin && <UserCog className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          {isAdmin && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handlePasswordChange(user.id)}
                                disabled={loading}
                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-30"
                                title="Đổi mật khẩu"
                              >
                                <Key className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(user.id)}
                                disabled={loading || user.role === 'SUPER_ADMIN'}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-30"
                                title={user.role === 'SUPER_ADMIN' ? 'Không thể xóa Super Admin' : 'Xóa nhân viên'}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
