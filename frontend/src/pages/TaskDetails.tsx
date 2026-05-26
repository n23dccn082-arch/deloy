import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckSquare, MessageSquare, Paperclip, Clock, UserCircle2, Tag } from 'lucide-react';
import CommentForm from '../components/CommentForm';
import AttachmentForm from '../components/AttachmentForm';
import CommentList from '../components/CommentList';
import AttachmentList from '../components/AttachmentList';
import EditTaskForm from '../components/EditTaskForm';
import { formatTaskStatus, formatTaskPriority, getStatusColor, getPriorityColor } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';

export default function TaskDetails() {
  const { id: taskId } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/tasks/${taskId}?userId=${user?.id}&role=${user?.role}`);
        setTask(response.data);
      } catch (error) {
        console.error('Failed to fetch task:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  if (!task) {
    return <div className="min-h-screen flex items-center justify-center">Nhiệm vụ không tồn tại</div>;
  }

  const canEditTask = user?.role === 'SUPER_ADMIN' || user?.role === 'TASK_MANAGER' || (user?.role === 'MEMBER' && task.assignee?.id === user?.id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {task.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl truncate">
                    Thuộc dự án: <span className="font-semibold">{task.project.name}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <Link to="/tasks" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Về Nhiệm vụ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Background Gradients */}
        <div className="absolute top-10 left-0 w-[500px] h-[300px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full pointer-events-none" />

        <div className="grid gap-8 xl:grid-cols-[1fr_384px] relative">
          <section className="space-y-6">
            {/* Task Info Cards */}
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5 text-purple-500" /> Thông tin nhiệm vụ
              </h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Mô tả chi tiết</h3>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
                  {task.description || 'Không có mô tả nhiệm vụ'}
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Trạng thái</span>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                      {formatTaskStatus(task.status)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Ưu tiên</span>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                      {formatTaskPriority(task.priority)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><UserCircle2 className="w-3 h-3"/> Phụ trách</span>
                  <span className="font-semibold text-zinc-900 dark:text-white truncate">
                    {task.assignee?.name || task.assignee?.email || 'Chưa gán'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> Hạn chót</span>
                  <span className={`font-semibold ${task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE' ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Không có'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 md:col-span-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Tiến độ công việc</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{task.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${task.progress || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" /> Thảo luận ({task.comments.length})
                </h2>
              </div>
              <div className="p-6">
                <CommentList 
                  comments={task.comments} 
                  currentUser={user}
                  onDelete={async (commentId) => {
                    try {
                      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/tasks/comments/${commentId}`);
                      setTask({ ...task, comments: task.comments.filter((c: any) => c.id !== commentId) });
                    } catch (err) {
                      console.error("Failed to delete comment", err);
                    }
                  }}
                />
                {!(user?.role === 'CLIENT' || user?.role === 'EXECUTIVE') && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Viết bình luận mới</h3>
                    <CommentForm 
                      taskId={task.id} 
                      onCommentSuccess={(newComment) => setTask({ ...task, comments: [newComment, ...task.comments] })} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-pink-500" /> Tệp đính kèm ({task.attachments.length})
                </h2>
              </div>
              <div className="p-6">
                <AttachmentList 
                  attachments={task.attachments} 
                  currentUser={user}
                  onDelete={async (attachmentId) => {
                    try {
                      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/tasks/attachments/${attachmentId}`);
                      setTask({ ...task, attachments: task.attachments.filter((a: any) => a.id !== attachmentId) });
                    } catch (err) {
                      console.error("Failed to delete attachment", err);
                    }
                  }}
                />
                {!(user?.role === 'CLIENT' || user?.role === 'EXECUTIVE') && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Tải lên tài liệu mới</h3>
                    <AttachmentForm 
                      taskId={task.id} 
                      onUploadSuccess={(newAttachment) => setTask({ ...task, attachments: [newAttachment, ...task.attachments] })} 
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            {canEditTask && (
              <>
                <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Cập nhật nhiệm vụ</h3>
                  <EditTaskForm
                    taskId={task.id}
                    projectId={task.project?.id}
                    currentStatus={task.status}
                    currentPriority={task.priority}
                    currentDeadline={task.deadline?.toString() ?? null}
                    currentAssigneeId={task.assignee?.id ?? null}
                    currentProgress={task.progress || 0}
                    onUpdateSuccess={(updates) => setTask({ ...task, ...updates })}
                  />
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
