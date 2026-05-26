
import { useState } from 'react'

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường')
      return
    }

    if (newPassword.length <= 6) {
      setError('Mật khẩu mới phải trên 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    setLoading(true);
    try {
      // Mock API call
      setTimeout(() => {
        setSuccess('Đổi mật khẩu thành công');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi đổi mật khẩu');
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Đổi mật khẩu</h2>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Mật khẩu hiện tại
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 sm:text-base transition-colors"
            placeholder="Nhập mật khẩu hiện tại"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Mật khẩu mới
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 sm:text-base transition-colors"
            placeholder="Nhập mật khẩu mới"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Xác nhận mật khẩu mới
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-4 py-3 sm:text-base transition-colors"
            placeholder="Xác nhận mật khẩu mới"
          />
        </div>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        {success && <p className="text-sm font-medium text-emerald-500">{success}</p>}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  )
}
