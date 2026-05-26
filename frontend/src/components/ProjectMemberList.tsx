
import { useState } from 'react'
import { UserMinus, ShieldAlert, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface Member {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function ProjectMemberList({ projectId, members }: { projectId: string; members: Member[] }) {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'SUPER_ADMIN'
  const isManager = currentUser?.role === 'TASK_MANAGER'

  const [error, setError] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRemove = async (userId: string) => {
    if (!confirm('Xóa thành viên này khỏi dự án?')) return
    setError('')
    setLoadingId(userId)
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data?.error || 'Không thể xóa thành viên')
      } else {
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      setError('Đã xảy ra lỗi khi xóa thành viên')
    } finally {
      setLoadingId(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'manager':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />
      default:
        return <User className="w-4 h-4 text-zinc-400" />
    }
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/50 p-4 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  {member.user.name} {getRoleIcon(member.role)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{member.user.email}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Dự án: {member.role}</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">Hệ thống: {member.user.role}</span>
                </div>
              </div>
            </div>
            {(isAdmin || (isManager && member.user.role === 'MEMBER')) && (
              <button
                type="button"
                onClick={() => handleRemove(member.user.id)}
                disabled={loadingId === member.user.id}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors sm:w-auto w-full"
              >
                <UserMinus className="w-4 h-4" /> {loadingId === member.user.id ? 'Đang xóa...' : 'Xóa'}
              </button>
            )}
          </div>
        </div>
      ))}
      {error && <p className="text-sm font-medium text-red-500 text-center mt-2">{error}</p>}
    </div>
  )
}
