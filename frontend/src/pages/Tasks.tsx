import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, ArrowLeft, MessageSquare, UserCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatTaskStatus, getStatusColor, getDeadlineWarning, formatTaskPriority, getPriorityColor } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';


export default function TasksPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8080/api/tasks?userId=${user.id}&role=${user.role}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải danh sách nhiệm vụ:', err);
        setLoading(false);
      });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
                  TaskMaster Nhiệm vụ
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Theo dõi và quản lý công việc
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
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full pointer-events-none" />

        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-500" /> Danh sách Nhiệm vụ
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full sm:w-40 py-2 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
              >
                <option value="ALL">Tất cả ưu tiên</option>
                <option value="URGENT">Khẩn cấp</option>
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 py-2 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="TODO">Chưa bắt đầu</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="DONE">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
              <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhiệm vụ..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50/50 dark:bg-zinc-800/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tiêu đề</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Dự án</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ưu tiên</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Phụ trách</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tương tác</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-transparent">
                {[...tasks].filter(task => {
                  const term = searchTerm.toLowerCase();
                  const matchesSearch = task.title?.toLowerCase().includes(term) ||
                    task.project?.name?.toLowerCase().includes(term) ||
                    formatTaskStatus(task.status).toLowerCase().includes(term) ||
                    (task.assignee?.name && task.assignee.name.toLowerCase().includes(term));
                  const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
                  const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
                  return matchesSearch && matchesStatus && matchesPriority;
                }).sort((a, b) => {
                  const wA = getDeadlineWarning(a.deadline, a.status)?.level || 0;
                  const wB = getDeadlineWarning(b.deadline, b.status)?.level || 0;
                  if (wB !== wA) return wB - wA;
                  const prioLevel = (p: string) => p === 'URGENT' ? 4 : p === 'HIGH' ? 3 : p === 'MEDIUM' ? 2 : p === 'LOW' ? 1 : 0;
                  return prioLevel(b.priority) - prioLevel(a.priority);
                }).map((task) => {
                  const warning = getDeadlineWarning(task.deadline, task.status);
                  return (
                  <tr key={task.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          {task.title}
                          {warning && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${warning.colorClass}`}>
                              {warning.level === 3 && <AlertCircle className="w-3 h-3" />}
                              {warning.message}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {task.deadline ? `Hạn chót: ${new Date(task.deadline).toLocaleDateString('vi-VN')}` : 'Không có hạn chót'}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">{task.project?.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                        {formatTaskStatus(task.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'URGENT' && <AlertTriangle className="w-3 h-3" />}
                        {formatTaskPriority(task.priority)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 gap-1.5">
                        <UserCircle2 className="w-4 h-4" /> {task.assignee?.name || 'Chưa gán'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 gap-1.5">
                        <MessageSquare className="w-4 h-4" /> {task._count.comments} bình luận
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link 
                        to={`/tasks/${task.id}`} 
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                )})}
                {!loading && tasks.length > 0 && tasks.filter(task => {
                  const term = searchTerm.toLowerCase();
                  const matchesSearch = task.title?.toLowerCase().includes(term) ||
                    task.project?.name?.toLowerCase().includes(term) ||
                    formatTaskStatus(task.status).toLowerCase().includes(term) ||
                    (task.assignee?.name && task.assignee.name.toLowerCase().includes(term));
                  const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
                  const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
                  return matchesSearch && matchesStatus && matchesPriority;
                }).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                      <div className="flex flex-col items-center justify-center">
                        <CheckSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <p>Không tìm thấy nhiệm vụ nào phù hợp với tìm kiếm.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && tasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                      <div className="flex flex-col items-center justify-center">
                        <CheckSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <p>Không có nhiệm vụ nào cần hiển thị.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
