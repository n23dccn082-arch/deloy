import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, PieChart, Activity, AlertTriangle, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatTaskStatus, getStatusColor } from '../lib/formatters';

import axios from 'axios';

export default function ReportsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    axios.get(`http://localhost:8080/api/dashboard/stats?userId=${user.id}&role=${user.role}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Lỗi khi tải báo cáo:', error);
        setLoading(false);
      });
  }, [user]);

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'TASK_MANAGER' && user.role !== 'CLIENT')) {
    navigate('/dashboard');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải báo cáo...</div>;
  }

  if (!data.taskCounts || !Array.isArray(data.taskCounts)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a]">
        <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl text-center max-w-md border border-zinc-200 dark:border-zinc-800">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Đang chờ Backend cập nhật</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Có vẻ như bạn chưa khởi động lại Backend sau khi code được cập nhật. Vui lòng tắt terminal chạy backend (Ctrl+C) và chạy lại lệnh <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-pink-500">mvn spring-boot:run</code>.
          </p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
            Tải lại trang
          </button>
        </div>
      </div>
    );
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
                  Báo cáo Phân tích
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Thống kê và tiến độ tổng quan
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
              </Link>
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

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Background Gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full pointer-events-none" />

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-pink-500" /> Thống kê Dự án
          </h2>
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {data.taskCounts
              .filter((group: any) => group.status !== 'CANCELLED')
              .map((group: any) => (
              <div key={group.status} className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
                <div className={`px-3 py-1 mb-4 rounded-full text-xs font-bold border ${getStatusColor(group.status)}`}>
                  {formatTaskStatus(group.status)}
                </div>
                <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">{group._count._all}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Tổng số lượng</p>
              </div>
            ))}
            
            <div className="bg-red-50 dark:bg-red-900/10 backdrop-blur-xl shadow-sm rounded-2xl border border-red-200 dark:border-red-900/30 p-6 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full text-xs font-bold text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50">
                <AlertTriangle className="w-3 h-3" /> QUÁ HẠN
              </div>
              <p className="text-4xl font-extrabold text-red-600 dark:text-red-400">{data.overdueTasks}</p>
              <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-2">Cần xử lý gấp</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Tổng quan Dự án</h2>
            </div>
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
                <Activity className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 mb-2">{data.projectCounts}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">Dự án đang được quản lý trên hệ thống</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Phân bổ Nhiệm vụ theo Dự án</h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto max-h-[300px] space-y-3">
              {data.taskByProject.map((group: any) => {
                return (
                  <Link to={`/projects/${group.projectId}`} key={group.projectId} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group hover:border-indigo-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-white truncate pr-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {group.name}
                      </span>
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
                        <span>Tiến độ: <span className="text-indigo-600 dark:text-indigo-400">{group.progress || 0}%</span></span>
                        {user?.role === 'CLIENT' && group.budget !== undefined && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                            <span>Chi phí: <span className="text-green-600 dark:text-green-400">{Number(group.budget).toLocaleString('vi-VN')} VNĐ</span></span>
                          </>
                        )}
                      </span>
                    </div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{group._count._all} nhiệm vụ</span>
                  </Link>
                )
              })}
              {data.taskByProject.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-8">
                  <PieChart className="w-8 h-8 mb-3 opacity-20" />
                  <p>Chưa có dữ liệu phân bổ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
