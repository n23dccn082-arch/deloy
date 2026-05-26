import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, CheckCircle2, AlertCircle, Clock, Activity, CircleDashed, PlayCircle, CheckSquare, Timer, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import { mockProjects, mockTasks } from '../data/mockData';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    projectCount: 0,
    totalTaskCount: 0,
    activeTaskCount: 0,
    overdueTaskCount: 0,
    todoTaskCount: 0,
    doneTaskCount: 0,
    cancelledTaskCount: 0,
    warningTaskCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/dashboard/stats`, {
          params: { userId: user?.id, role: user?.role }
        });
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="TaskMaster Logo" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  TaskMaster Dashboard
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Xin chào, <span className="font-semibold text-zinc-900 dark:text-white">{user?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                {user?.role}
              </span>
              
              <nav className="hidden md:flex items-center gap-2">
                {user?.role !== 'MEMBER' && (
                  <Link
                    to="/projects"
                    className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Dự án
                  </Link>
                )}
                <Link
                  to="/tasks"
                  className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Nhiệm vụ
                </Link>
                {user?.role !== 'MEMBER' && (
                  <Link
                    to="/reports"
                    className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Báo cáo
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Hồ sơ
                </Link>
                {user?.role === 'SUPER_ADMIN' && (
                  <>
                    <Link
                      to="/users"
                      className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Người dùng
                    </Link>
                    <Link
                      to="/permissions"
                      className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cấp quyền
                    </Link>
                  </>
                )}
              </nav>
              <div className="pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Background Gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full pointer-events-none" />

        <div className="relative">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Tổng quan hệ thống</h2>
          
          {/* Stats Cards */}
          {user?.role === 'MEMBER' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[
                { title: 'Chưa bắt đầu', count: data.todoTaskCount, icon: CircleDashed, bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:shadow-blue-500/10', link: '/tasks', linkText: 'Xem chi tiết' },
                { title: 'Đang làm', count: data.activeTaskCount, icon: PlayCircle, bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:shadow-purple-500/10', link: '/tasks', linkText: 'Xem chi tiết' },
                { title: 'Hoàn thành', count: data.doneTaskCount, icon: CheckSquare, bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:shadow-emerald-500/10', link: '/tasks', linkText: 'Xem chi tiết' },
                { title: 'Sắp đến hạn', count: data.warningTaskCount, icon: Timer, bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', hover: 'hover:shadow-orange-500/10', link: '/tasks', linkText: 'Xem chi tiết' },
                { title: 'Quá hạn', count: data.overdueTaskCount, icon: AlertCircle, bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', hover: 'hover:shadow-pink-500/10', link: '/tasks?filter=overdue', linkText: 'Xem chi tiết' },
                { title: 'Đã hủy', count: data.cancelledTaskCount, icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', hover: 'hover:shadow-red-500/10', link: '/tasks', linkText: 'Xem chi tiết' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`group bg-white dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl ${stat.hover} transition-all duration-300 hover:-translate-y-1`}>
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-7 h-7 ${stat.text}`} />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">{stat.title}</p>
                          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stat.count ?? 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/80 px-6 py-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="text-sm">
                        <Link to={stat.link} className={`font-medium ${stat.text} flex items-center gap-1`}>
                          {stat.linkText} <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[
                { title: 'Tổng số Dự án', count: data.projectCount, icon: FolderKanban, bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:shadow-indigo-500/10', link: '/projects', linkText: 'Xem tất cả dự án' },
                { title: 'Tổng số Nhiệm vụ', count: data.totalTaskCount, icon: CheckSquare, bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', hover: 'hover:shadow-green-500/10', link: '/tasks', linkText: 'Quản lý nhiệm vụ' },
                { title: 'Nhiệm vụ chưa làm', count: data.todoTaskCount, icon: CircleDashed, bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:shadow-blue-500/10', link: '/tasks', linkText: 'Bắt đầu công việc' },
                { title: 'Nhiệm vụ đang làm', count: data.activeTaskCount, icon: PlayCircle, bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:shadow-purple-500/10', link: '/tasks', linkText: 'Đang thực hiện' },
                { title: 'Nhiệm vụ sắp đến hạn', count: data.warningTaskCount, icon: Timer, bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', hover: 'hover:shadow-orange-500/10', link: '/tasks', linkText: 'Cảnh báo 10 ngày' },
                { title: 'Nhiệm vụ quá hạn', count: data.overdueTaskCount, icon: AlertCircle, bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', hover: 'hover:shadow-pink-500/10', link: '/tasks?filter=overdue', linkText: 'Cần xử lý ngay' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`group bg-white dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl ${stat.hover} transition-all duration-300 hover:-translate-y-1`}>
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-7 h-7 ${stat.text}`} />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">{stat.title}</p>
                          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stat.count ?? 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/80 px-6 py-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="text-sm">
                        <Link to={stat.link} className={`font-medium ${stat.text} flex items-center gap-1`}>
                          {stat.linkText} <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Activity Section */}
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <Activity className="w-5 h-5 text-zinc-500" />
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Hoạt động gần đây</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Những cập nhật mới nhất từ các dự án bạn tham gia.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                {user?.role === 'MEMBER' ? (
                  <>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-2">Truy cập vào trang nhiệm vụ để bắt đầu công việc.</p>
                    <Link to="/tasks" className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-full hover:scale-105 transition-transform shadow-md">
                      Xem danh sách nhiệm vụ
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-2">Truy cập vào trang chi tiết dự án để xem tiến độ.</p>
                    <Link to="/projects" className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-full hover:scale-105 transition-transform shadow-md">
                      Xem chi tiết dự án
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
