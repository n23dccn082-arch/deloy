
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Trash2 } from 'lucide-react'

interface EditProjectFormProps {
  projectId: string
  initialName: string
  initialDescription: string | null
  initialPriority?: string
  initialDeadline?: string | null
  initialBudget?: number
  canEdit: boolean
  userRole?: string
}

export default function EditProjectForm({ projectId, initialName, initialDescription, initialPriority, initialDeadline, initialBudget, canEdit, userRole }: EditProjectFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription || '')
  const [priority, setPriority] = useState(initialPriority || 'MEDIUM')
  const [deadline, setDeadline] = useState(initialDeadline ? initialDeadline.split('T')[0] : '')
  const [budget, setBudget] = useState(initialBudget?.toString() || '0')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!canEdit) return null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (!name.trim()) {
      setError('Tên dự án là bắt buộc.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, priority, deadline, budget: budget ? budget : '0' })
      })

      if (!response.ok) {
        const text = await response.text()
        const data = text ? JSON.parse(text) : null
        setError(data?.error || `Không thể cập nhật dự án (Status: ${response.status})`)
        return
      }

      window.location.reload()
    } catch (err: any) {
      console.error(err)
      setError(`Lỗi cập nhật: ${err.message || 'Không thể kết nối'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ dự án này cùng với tất cả nhiệm vụ và bình luận? Hành động này không thể hoàn tác!')) return
    
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const text = await response.text()
        let data = null
        try { if (text) data = JSON.parse(text) } catch (e) {}
        setError(data?.error || `Không thể xóa dự án (Status: ${response.status})`)
        setLoading(false)
        return
      }

      navigate('/projects')
      window.location.reload()
    } catch (err: any) {
      console.error(err)
      setError(`Lỗi hệ thống: ${err.message || 'Mất kết nối server'}`)
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Tên dự án
        </label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
          placeholder="Tên dự án"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Mô tả
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
          rows={3}
          placeholder="Mô tả dự án"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Độ ưu tiên</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors">
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="URGENT">Khẩn cấp</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Chi phí (VND)</label>
          <input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Thời hạn</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors" />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" /> {loading ? 'Đang xử lý...' : 'Lưu cài đặt'}
        </button>

        {userRole === 'SUPER_ADMIN' && (
          <button
            type="button"
            onClick={handleDeleteProject}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2.5 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 border border-red-200 dark:border-red-800/50 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Xóa dự án
          </button>
        )}
      </div>
    </form>
  )
}
