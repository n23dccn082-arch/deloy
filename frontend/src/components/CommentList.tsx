import { Trash2 } from 'lucide-react'

interface CommentListProps {
  comments: Array<{
    id: string
    content: string
    createdAt: string | Date
    user: { id?: string, name: string | null }
  }>
  currentUser?: any
  onDelete?: (id: string) => void
}

export default function CommentList({ comments, currentUser, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canDelete = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'TASK_MANAGER' || (comment.user?.id && comment.user.id === currentUser?.id);
        
        return (
          <div key={comment.id} className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 p-4 shadow-sm relative group">
            <div className="flex items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-zinc-200">{comment.user.name || 'Người dùng'}</span>
              <div className="flex items-center gap-2">
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                {canDelete && (
                  <button 
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa bình luận này?')) {
                        if (onDelete) onDelete(comment.id);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa bình luận"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
        )
      })}
    </div>
  )
}
