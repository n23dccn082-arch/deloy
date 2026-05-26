
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatTaskStatus, formatTaskPriority } from '../lib/formatters'
import { useAuth } from '../context/AuthContext'

interface UserOption {
  id: string
  name: string
  email: string
}

const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default function EditTaskForm({ taskId, projectId, currentStatus, currentPriority, currentDeadline, currentAssigneeId, currentProgress = 0, onUpdateSuccess }: { taskId: string; projectId?: string; currentStatus: string; currentPriority: string; currentDeadline: string | null; currentAssigneeId: string | null; currentProgress?: number; onUpdateSuccess?: (updates: any) => void }) {
  const { user } = useAuth()
  const userRole = user?.role || 'MEMBER'
  const isMember = userRole === 'MEMBER'
  const [status, setStatus] = useState(currentStatus)
  const [priority, setPriority] = useState(currentPriority)
  const [deadline, setDeadline] = useState(currentDeadline ? currentDeadline.split('T')[0] : '')
  const [assigneeId, setAssigneeId] = useState(currentAssigneeId || '')
  const [progress, setProgress] = useState(currentProgress)
  const [users, setUsers] = useState<UserOption[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    import('axios').then(({ default: axios }) => {
      if (projectId) {
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/projects/${projectId}`).then(res => {
          const members = res.data.members
            .filter((m: any) => m.role === 'member' && m.user)
            .map((m: any) => m.user);
          setUsers(members);
        }).catch(err => console.error("Failed to fetch project members", err))
      } else {
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users`).then(res => {
          setUsers(res.data)
        }).catch(err => console.error("Failed to fetch users", err))
      }
    })
  }, [projectId])

  const handleCancelTask = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy nhiệm vụ này?")) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { default: axios } = await import('axios');
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/tasks/${taskId}`, {
        status: 'CANCELLED',
        priority,
        deadline,
        assigneeId,
        progress: 0
      });
      setStatus('CANCELLED');
      setProgress(0);
      setSuccess('Đã hủy nhiệm vụ thành công!');
      if (onUpdateSuccess) {
        const selectedUser = users.find(u => u.id === assigneeId);
        onUpdateSuccess({ status: 'CANCELLED', priority, deadline, assignee: selectedUser || null, progress: 0 });
      }
    } catch (err) {
      console.error(err);
      setError('Hủy nhiệm vụ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTask = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục nhiệm vụ này?")) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { default: axios } = await import('axios');
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/tasks/${taskId}`, {
        status: 'TODO',
        priority,
        deadline,
        assigneeId,
        progress: 0
      });
      setStatus('TODO');
      setProgress(0);
      setSuccess('Đã khôi phục nhiệm vụ thành công!');
      if (onUpdateSuccess) {
        const selectedUser = users.find(u => u.id === assigneeId);
        onUpdateSuccess({ status: 'TODO', priority, deadline, assignee: selectedUser || null, progress: 0 });
      }
    } catch (err) {
      console.error(err);
      setError('Khôi phục nhiệm vụ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Ensure progress and status are synced before submit
    let finalProgress = progress;
    let finalStatus = status;

    if (finalProgress === 100) {
      finalStatus = 'DONE';
    } else if (finalStatus === 'DONE') {
      finalProgress = 100;
    } else if (finalStatus === 'TODO') {
      finalProgress = 0;
    } else if (finalProgress > 0 && finalStatus === 'TODO') {
      finalStatus = 'IN_PROGRESS';
    }

    try {
      const { default: axios } = await import('axios');
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/tasks/${taskId}`, {
        status: finalStatus,
        priority,
        deadline,
        assigneeId,
        progress: finalProgress
      });
      setSuccess('Cập nhật nhiệm vụ thành công!')
      if (onUpdateSuccess) {
        const selectedUser = users.find(u => u.id === assigneeId)
        onUpdateSuccess({ status: finalStatus, priority, deadline, assignee: selectedUser || null, progress: finalProgress })
      }
    } catch (err) {
      console.error(err);
      setError('Cập nhật nhiệm vụ thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cập nhật nhiệm vụ</h3>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Trạng thái</label>
          <select 
            value={status} 
            onChange={(event) => {
              const newStatus = event.target.value;
              setStatus(newStatus);
              if (newStatus === 'TODO') setProgress(0);
              else if (newStatus === 'DONE') setProgress(100);
            }}
            disabled={!isMember}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50"
          >
            {statuses.filter(s => !(isMember && s === 'CANCELLED')).map((item) => (
              <option key={item} value={item}>{formatTaskStatus(item)}</option>
            ))}
          </select>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Tiến độ công việc ({status === 'TODO' ? 0 : status === 'DONE' ? 100 : progress}%)</label>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={status === 'TODO' ? 0 : status === 'DONE' ? 100 : progress} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setProgress(val);
              if (val === 100) setStatus('DONE');
              else if (val > 0 && status === 'TODO') setStatus('IN_PROGRESS');
              else if (val < 100 && status === 'DONE') setStatus('IN_PROGRESS');
            }}
            disabled={!isMember || status === 'TODO' || status === 'DONE'}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Ưu tiên</label>
          <select disabled={isMember} value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50">
            {priorities.map((item) => (
              <option key={item} value={item}>{formatTaskPriority(item)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Hạn chót</label>
          <input disabled={isMember} type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-base disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Người phụ trách</label>
          <select disabled={isMember} value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-base disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50">
            <option value="">Chưa gán</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
        <div className="flex space-x-3">
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Đang cập nhật...' : 'Cập nhật nhiệm vụ'}
          </button>
          {!isMember && (
            status === 'CANCELLED' ? (
              <button 
                type="button" 
                onClick={handleRestoreTask}
                disabled={loading} 
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                Khôi phục nhiệm vụ
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleCancelTask}
                disabled={loading} 
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                Hủy nhiệm vụ
              </button>
            )
          )}
        </div>
      </form>
    </div>
  )
}
