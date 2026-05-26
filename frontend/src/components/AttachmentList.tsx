import { Trash2 } from 'lucide-react'

interface AttachmentListProps {
  attachments: Array<{
    id: string
    filename: string
    url: string
    uploadedAt: string | Date
    user?: { id?: string, name: string | null }
  }>
  currentUser?: any
  onDelete?: (id: string) => void
}

export default function AttachmentList({ attachments, currentUser, onDelete }: AttachmentListProps) {
  if (attachments.length === 0) {
    return <p className="text-sm text-gray-500">Chưa có tệp đính kèm.</p>
  }

  return (
    <div className="space-y-4">
      {attachments.map((attachment) => {
        const canDelete = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'TASK_MANAGER' || (attachment.user?.id && attachment.user.id === currentUser?.id);

        return (
          <div key={attachment.id} className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 p-4 shadow-sm relative group">
            <div className="flex items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-zinc-200">{attachment.filename}</span>
              <span>{new Date(attachment.uploadedAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                Đăng bởi: {attachment.user?.name || 'Không rõ'}
              </span>
              <div className="flex items-center gap-3">
                <a 
                  href={attachment.url} 
                  download={attachment.url.startsWith('data:') ? attachment.filename : undefined}
                  target={attachment.url.startsWith('data:') ? undefined : "_blank"} 
                  rel="noopener noreferrer" 
                  className="inline-block text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                >
                  {attachment.url.startsWith('data:') ? 'Tải xuống tệp' : 'Xem tệp'}
                </a>
                {canDelete && (
                  <button 
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa tệp này?')) {
                        if (onDelete) onDelete(attachment.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa tệp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
