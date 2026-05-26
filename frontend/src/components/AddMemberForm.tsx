
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface UserOption {
  id: string
  name: string
  email: string
  role: string
}

export default function AddMemberForm({ projectId }: { projectId: string }) {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'SUPER_ADMIN'
  const isManager = currentUser?.role === 'TASK_MANAGER'

  const [users, setUsers] = useState<UserOption[]>([])
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState(isAdmin ? 'manager' : 'member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    import('axios').then(({ default: axios }) => {
      axios.get('http://localhost:8080/api/users').then(res => {
        let filteredUsers = res.data;
        if (isAdmin) {
          filteredUsers = filteredUsers.filter((u: any) => u.role === 'TASK_MANAGER');
        } else if (isManager) {
          filteredUsers = filteredUsers.filter((u: any) => u.role === 'MEMBER');
        }
        
        const usersWithRole = filteredUsers.map((u: any) => ({ ...u, role: isAdmin ? 'manager' : 'member' }));
        setUsers(usersWithRole);
      }).catch(err => console.error("Failed to fetch users", err))
    })
  }, [isAdmin, isManager])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (!userId) {
      setError('Vui lòng chọn người dùng')
      setLoading(false)
      return
    }

    try {
      const { default: axios } = await import('axios');
      await axios.post(`http://localhost:8080/api/projects/${projectId}/members`, {
        userId,
        role
      });
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Lỗi khi thêm thành viên');
      setLoading(false);
    }
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Người dùng</label>
        <select
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-base transition-colors"
        >
          <option value="">Chọn người dùng</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>
      {isAdmin && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Vai trò trong dự án</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            disabled
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white px-4 py-3 shadow-sm sm:text-base transition-colors opacity-80"
          >
            <option value="manager">Project Manager (Quản lý)</option>
          </select>
        </div>
      )}
      {!isAdmin && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Vai trò trong dự án</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            disabled
            className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white px-4 py-3 shadow-sm sm:text-base transition-colors opacity-80"
          >
            <option value="member">Member (Thành viên)</option>
          </select>
        </div>
      )}
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
      >
        <Plus className="w-4 h-4" /> {loading ? 'Đang thêm...' : 'Thêm thành viên'}
      </button>
    </form>
  )
}
