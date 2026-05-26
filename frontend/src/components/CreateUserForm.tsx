
import { useState } from 'react'
import { UserPlus } from 'lucide-react'

export default function CreateUserForm({ onUserCreated }: { onUserCreated: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    
    if (password.length <= 6) {
      setError('Mật khẩu phải trên 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const { default: axios } = await import('axios');
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users`, {
        name,
        email,
        password,
        role
      });
      
      setSuccess('Đã tạo tài khoản thành công!');
      setName('');
      setEmail('');
      setPassword('');
      setRole('MEMBER');
      
      // Callback to refresh user list
      onUserCreated();
      
      setTimeout(() => setSuccess(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi tạo tài khoản');
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
        <UserPlus className="w-5 h-5 text-indigo-500" /> Cấp phát tài khoản mới
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Họ tên nhân viên</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email nội bộ</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              placeholder="VD: nva@congty.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mật khẩu cấp phát</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              placeholder="Mật khẩu phải trên 6 ký tự"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Chức vụ (Vai trò hệ thống)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            >
              <option value="MEMBER">Thành viên thực hiện (Assignee)</option>
              <option value="TASK_MANAGER">Người quản lý dự án (Manager)</option>
              <option value="CLIENT">Khách hàng (Client)</option>
              <option value="EXECUTIVE">Ban quản trị công ty (Executive)</option>
              <option value="SUPER_ADMIN">Quản trị viên (Admin)</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        {success && <p className="text-sm font-medium text-emerald-500">{success}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" /> {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản nhân viên'}
          </button>
        </div>
      </form>
    </div>
  )
}
