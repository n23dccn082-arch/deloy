import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Users, CheckSquare, Plus, ArrowLeft, AlertCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import CreateProjectForm from '../components/CreateProjectForm';
import { formatTaskPriority, getPriorityColor, getDeadlineWarning } from '../lib/formatters';



export default function ProjectsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const userRole = user?.role || 'MEMBER';

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/projects?userId=${user?.id}&role=${user?.role}`)
      .then(res => res.json())
      .then(data => {
        // Map the backend data to the frontend structure
        const mappedProjects = data.map((p: any) => ({
          ...p,
          creator: p.creator || { name: 'Admin' },
          members: p.members || [],
          tasks: p.tasks || []
        }));
        setProjects(mappedProjects);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải danh sách dự án:', err);
        setLoading(false);
      });
  }, []);

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
                  TaskMaster Dự án
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Quản lý tất cả dự án của bạn
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
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full pointer-events-none" />

        <div className="grid gap-8 lg:grid-cols-[1fr_384px] relative">
          <section className="space-y-6">
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-indigo-500" /> Danh sách Dự án
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full sm:w-40 py-2 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    <option value="ALL">Tất cả ưu tiên</option>
                    <option value="URGENT">Khẩn cấp</option>
                    <option value="HIGH">Cao</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="LOW">Thấp</option>
                  </select>
                  <div className="relative w-full sm:w-72">
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm dự án..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tên dự án</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ưu tiên</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Người tạo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Thành viên</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Nhiệm vụ</th>
                      <th className="px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-transparent">
                    {[...projects].filter(project => {
                      const term = searchTerm.toLowerCase();
                      const creatorName = project.creator?.name || project.creator?.email || '';
                      const matchesSearch = project.name?.toLowerCase().includes(term) ||
                        creatorName.toLowerCase().includes(term);
                      const matchesPriority = priorityFilter === 'ALL' || project.priority === priorityFilter;
                      return matchesSearch && matchesPriority;
                    }).sort((a, b) => {
                      const wA = getDeadlineWarning(a.deadline, undefined)?.level || 0;
                      const wB = getDeadlineWarning(b.deadline, undefined)?.level || 0;
                      if (wB !== wA) return wB - wA;
                      const prioLevel = (p: string) => p === 'URGENT' ? 4 : p === 'HIGH' ? 3 : p === 'MEDIUM' ? 2 : p === 'LOW' ? 1 : 0;
                      return prioLevel(b.priority) - prioLevel(a.priority);
                    }).map((project) => {
                      const warning = getDeadlineWarning(project.deadline, undefined);
                      return (
                      <tr key={project.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                              {project.name}
                              {warning && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${warning.colorClass}`}>
                                  {warning.level === 3 && <AlertCircle className="w-3 h-3" />}
                                  {warning.message}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {project.deadline ? `Hạn chót: ${new Date(project.deadline).toLocaleDateString('vi-VN')}` : 'Không có hạn chót'}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(project.priority)}`}>
                            {project.priority === 'URGENT' && <AlertCircle className="w-3 h-3" />}
                            {formatTaskPriority(project.priority)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            {project.creator?.name || project.creator?.email}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 gap-1">
                            <Users className="w-4 h-4" /> {project.members.length}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 gap-1">
                            <CheckSquare className="w-4 h-4" /> {project.tasks.length}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Link
                            to={`/projects/${project.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    )})}
                    {!loading && projects.length > 0 && projects.filter(project => {
                      const term = searchTerm.toLowerCase();
                      const creatorName = project.creator?.name || project.creator?.email || '';
                      const matchesSearch = project.name?.toLowerCase().includes(term) ||
                        creatorName.toLowerCase().includes(term);
                      const matchesPriority = priorityFilter === 'ALL' || project.priority === priorityFilter;
                      return matchesSearch && matchesPriority;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                          <div className="flex flex-col items-center justify-center">
                            <FolderKanban className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                            <p>Không tìm thấy dự án nào phù hợp với tìm kiếm.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && projects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                          <div className="flex flex-col items-center justify-center">
                            <FolderKanban className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                            <p>Chưa có dự án nào được tạo hoặc phân công cho bạn.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            {userRole === 'SUPER_ADMIN' ? (
              <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                  <FolderKanban className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Tạo dự án mới</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                  Tạo dự án và phân công cho Quản lý dự án.
                </p>
                <CreateProjectForm />
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <FolderKanban className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Chỉ dành cho Admin</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Chỉ Admin mới có quyền tạo dự án mới. Quản lý dự án sẽ được cấp quyền trong từng dự án cụ thể.</p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
