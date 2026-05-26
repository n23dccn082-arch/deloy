
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatTaskStatus, formatTaskPriority, getStatusColor, getPriorityColor, getDeadlineWarning } from '../lib/formatters'
import { Trash2, ExternalLink, AlertCircle } from 'lucide-react'

interface TaskProps {
  id: string
  title: string
  status: string
  priority: string
  deadline: Date | null
  assignee: { name: string | null } | null
  _count: { comments: number }
}

const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']

export default function TaskTable({ tasks, userRole }: { tasks: TaskProps[], userRole?: string }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loadingTask, setLoadingTask] = useState<string | null>(null)

  const handleStatusChange = async (taskId: string, status: string) => {
    setError('')
    setLoadingTask(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) {
        const text = await response.text()
        let data = null
        try { if (text) data = JSON.parse(text) } catch (e) {}
        setError(data?.error || `Không thể cập nhật task (Status: ${response.status})`)
        return
      }
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      setError(`Lỗi cập nhật: ${err.message || 'Mất kết nối server'}`)
    } finally {
      setLoadingTask(null)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Xóa nhiệm vụ này?')) return
    setError('')
    setLoadingTask(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const text = await response.text()
        let data = null
        try { if (text) data = JSON.parse(text) } catch (e) {}
        setError(data?.error || `Không thể xóa task (Status: ${response.status})`)
        return
      }
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      setError(`Lỗi hệ thống: ${err.message || 'Mất kết nối server'}`)
    } finally {
      setLoadingTask(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl">
        Không có nhiệm vụ nào trong dự án này.
      </div>
    )
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const wA = getDeadlineWarning(a.deadline?.toString(), a.status)?.level || 0;
    const wB = getDeadlineWarning(b.deadline?.toString(), b.status)?.level || 0;
    return wB - wA; // Higher level first
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/60 backdrop-blur-xl">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50/50 dark:bg-zinc-800/30">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tiêu đề</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Trạng thái</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ưu tiên</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Người phụ trách</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Deadline</th>
            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-transparent">
          {sortedTasks.map((task) => {
            const warning = getDeadlineWarning(task.deadline?.toString(), task.status);
            return (
            <tr key={task.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">{task.title}</div>
                  {warning && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${warning.colorClass}`}>
                      {warning.level === 3 && <AlertCircle className="w-3 h-3" />}
                      {warning.message}
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{task._count.comments} bình luận</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <select
                  value={task.status}
                  onChange={(event) => handleStatusChange(task.id, event.target.value)}
                  disabled={loadingTask === task.id || userRole !== 'MEMBER'}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white py-1.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{formatTaskStatus(status)}</option>
                  ))}
                </select>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                  {formatTaskPriority(task.priority)}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {task.assignee?.name || 'Chưa gán'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                <span className={`${task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE' ? 'text-red-500 font-bold' : ''}`}>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Không có'}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                <div className="flex items-center justify-center gap-2">
                  <Link to={`/tasks/${task.id}`} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Xem chi tiết">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  {(userRole === 'SUPER_ADMIN' || userRole === 'TASK_MANAGER') && (
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      disabled={loadingTask === task.id}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 border-t border-red-100 dark:border-red-900/30">{error}</div>}
    </div>
  )
}
