
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function CommentForm({ taskId, onCommentSuccess }: { taskId: string, onCommentSuccess?: (comment: any) => void }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Nội dung bình luận không được để trống')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/tasks/${taskId}/comments`, {
        content,
        userId: user?.id
      })
      if (onCommentSuccess) onCommentSuccess(response.data)
      setContent('')
    } catch (err) {
      console.error(err)
      setError('Đã xảy ra lỗi khi gửi bình luận')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm bình luận</h3>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        className="mt-2 w-full rounded-md border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 text-base text-black dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        placeholder="Viết bình luận..."
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Đang gửi...' : 'Gửi bình luận'}
      </button>
    </form>
  )
}
