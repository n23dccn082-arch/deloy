import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, CheckSquare, Settings, UserCircle2 } from 'lucide-react';
import AddMemberForm from '../components/AddMemberForm';
import CreateTaskForm from '../components/CreateTaskForm';
import EditProjectForm from '../components/EditProjectForm';
import ProjectMemberList from '../components/ProjectMemberList';
import TaskTable from '../components/TaskTable';
import { formatTaskPriority, getPriorityColor } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';

import axios from 'axios';

export default function ProjectDetails() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/projects/${projectId}?userId=${user?.id}&role=${user?.role}`)
      .then(res => {
        const data = res.data;
        // Fallback for members and tasks if backend doesn't populate them yet
        setProject({
          ...data,
          members: data.members || [],
          tasks: data.tasks || [],
          creator: data.creator || { name: 'Admin', email: 'admin@example.com' }
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải chi tiết dự án:', err);
        setProject(null);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">Dự án không tồn tại</div>;
  }

  // Auth & Roles Logic
  const isManager = user?.role === 'TASK_MANAGER';
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isClientOrExec = user?.role === 'CLIENT' || user?.role === 'EXECUTIVE';
  
  // A TASK_MANAGER can manage if they are added as a member to this project
  const isManagerAssigned = isManager && project.members.some((m: any) => m.user?.id === user?.id);
  
  const canEditProject = isAdmin;
  const canManageMembers = isManagerAssigned || isAdmin;
  const canCreateTasks = isManagerAssigned;

  // Progress calculation
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
  const totalProgress = project.tasks.reduce((acc: number, t: any) => acc + (t.progress || 0), 0);
  const progressPercentage = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {project.name}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl truncate mt-1">
                  {project.description || 'Không có mô tả chi tiết'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {project.priority && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getPriorityColor(project.priority)}`}>
                      Ưu tiên: {formatTaskPriority(project.priority)}
                    </span>
                  )}
                  {project.deadline && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 ${new Date(project.deadline) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      Hạn chót: {new Date(project.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  {project.budget !== undefined && project.budget !== null && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                      Chi phí: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.budget)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Link to="/projects" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Về danh sách
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Background Gradients */}
        <div className="absolute top-10 right-0 w-[500px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full pointer-events-none" />

        <div className="grid gap-8 xl:grid-cols-[1fr_384px] relative">
          <section className="space-y-6">
            {/* Overview Stats */}
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Tổng quan tiến độ</h2>
              
              <div className="grid gap-6 grid-cols-2 md:grid-cols-4 mb-6">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-2"><UserCircle2 className="w-4 h-4" /> Người tạo</span>
                  <span className="font-semibold text-zinc-900 dark:text-white truncate">{project.creator?.name || project.creator?.email}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Thành viên</span>
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-xl">{project.members.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <span className="text-purple-600 dark:text-purple-400 text-sm flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Nhiệm vụ</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300 text-xl">{project.tasks.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2"><Briefcase className="w-4 h-4" /> Hoàn thành</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-xl">{completedTasks}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-zinc-700 dark:text-zinc-300">Tiến độ chung</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Create Task */}
            {canCreateTasks && (
              <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                  <CheckSquare className="w-5 h-5 text-indigo-500" /> Thêm nhiệm vụ mới
                </h2>
                <CreateTaskForm projectId={project.id} members={project.members} />
              </div>
            )}

            {/* Task Management */}
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="mb-6 flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-500" /> Danh sách công việc
                </h2>
              </div>
              <TaskTable tasks={project.tasks} userRole={user?.role || 'MEMBER'} />
            </div>
            
            {/* Project Settings (Only if can edit) */}
            {canEditProject && (
              <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-zinc-500" /> Cài đặt dự án
                </h2>
                <EditProjectForm 
                  projectId={project.id} 
                  initialName={project.name} 
                  initialDescription={project.description} 
                  initialPriority={project.priority}
                  initialDeadline={project.deadline}
                  initialBudget={project.budget}
                  canEdit={canEditProject} 
                  userRole={user?.role || 'MEMBER'} 
                />
              </div>
            )}
          </section>

          <aside className="space-y-6">
            {/* Member Management */}
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {canManageMembers && (
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-indigo-500" /> Quản lý nhân sự
                  </h2>
                  <AddMemberForm projectId={project.id} />
                </div>
              )}
              <div className="p-6 bg-zinc-50/50 dark:bg-zinc-800/30">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Thành viên ({project.members.length})</h3>
                {project.members.length > 0 ? (
                  <ProjectMemberList projectId={project.id} members={project.members} />
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">Chưa có thành viên nào.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
