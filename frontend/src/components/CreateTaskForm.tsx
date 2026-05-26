
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

interface Member {
  role: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function CreateTaskForm({ projectId, members = [] }: { projectId: string; members?: Member[] }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [deadline, setDeadline] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Use members prop instead of fetching all users

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (!title.trim()) {
      setError('Tiêu đề nhiệm vụ là bắt buộc.')
      setLoading(false)
      return
    }

    try {
      const { default: axios } = await import('axios');
      await axios.post('http://localhost:8080/api/tasks', {
        title,
        description,
        priority,
        deadline,
        assigneeId,
        projectId
      });
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi tạo nhiệm vụ');
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tiêu đề</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            placeholder="Nhập tiêu đề nhiệm vụ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mô tả chi tiết</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            rows={2}
            placeholder="Nhiệm vụ này cần làm những gì?"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Độ ưu tiên</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            >
              <option value="LOW">LOW (Thấp)</option>
              <option value="MEDIUM">MEDIUM (Vừa)</option>
              <option value="HIGH">HIGH (Cao)</option>
              <option value="URGENT">URGENT (Khẩn cấp)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Thời hạn (Deadline)</label>
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Phân công cho</label>
            <select
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            >
              <option value="">(Chưa phân công)</option>
              {members.filter(m => m.user && m.role === 'member').map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name} ({member.user.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {error && <p className="text-sm font-medium text-red-500 mt-2">{error}</p>}
      
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> {loading ? 'Đang tạo...' : 'Tạo nhiệm vụ'}
        </button>
      </div>
    </form>
  )
}
