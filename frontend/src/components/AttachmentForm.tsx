
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function AttachmentForm({ taskId, onUploadSuccess }: { taskId: string, onUploadSuccess?: (attachment: any) => void }) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!file) {
      setError('Vui lòng chọn tệp đính kèm')
      return
    }

    setLoading(true)

    setLoading(true)

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        try {
          const response = await axios.post(`http://localhost:8080/api/tasks/${taskId}/attachments`, {
            filename: file.name,
            url: base64Url,
            userId: user?.id
          });
          if (onUploadSuccess) onUploadSuccess(response.data);
          setFile(null);
        } catch (err) {
          console.error(err);
          setError('Đã xảy ra lỗi khi tải tệp lên');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi đọc tệp');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm tài liệu</h3>
      <input
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        accept="*"
        className="block w-full text-sm text-black dark:text-white file:mr-4 file:rounded file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700"
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading || !file}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Đang tải lên...' : 'Tải tệp lên'}
      </button>
    </form>
  )
}
