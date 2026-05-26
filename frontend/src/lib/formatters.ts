export function formatTaskStatus(status: string): string {
  switch (status) {
    case 'TODO':
      return 'Chưa bắt đầu'
    case 'IN_PROGRESS':
      return 'Đang thực hiện'
    case 'DONE':
      return 'Hoàn thành'
    case 'CANCELLED':
      return 'Đã hủy'
    default:
      return status
  }
}

export function formatTaskPriority(priority: string): string {
  switch (priority) {
    case 'LOW':
      return 'Thấp'
    case 'MEDIUM':
      return 'Trung bình'
    case 'HIGH':
      return 'Cao'
    case 'URGENT':
      return 'Khẩn cấp'
    default:
      return priority
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'TODO':
      return 'bg-gray-100 text-gray-800'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800'
    case 'DONE':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'LOW':
      return 'bg-green-100 text-green-800'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800'
    case 'HIGH':
      return 'bg-orange-100 text-orange-800'
    case 'URGENT':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function formatRole(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'Admin';
    case 'TASK_MANAGER': return 'Quản lý dự án';
    case 'MEMBER': return 'Thành viên thực hiện';
    case 'CLIENT': return 'Khách hàng';
    case 'EXECUTIVE': return 'Ban quản trị';
    default: return role;
  }
}

export function getDeadlineWarning(deadline: string | null | undefined, status: string | undefined = undefined) {
  if (!deadline) return null;
  if (status === 'DONE' || status === 'CANCELLED') return null;

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      message: `Quá hạn ${Math.abs(diffDays)} ngày`,
      colorClass: 'text-pink-700 bg-pink-100 border-pink-300 dark:text-pink-400 dark:bg-pink-900/40 dark:border-pink-800 animate-pulse shadow-sm',
      level: 4
    };
  } else if (diffDays === 0) {
    return {
      message: 'Hôm nay',
      colorClass: 'text-red-700 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-900/40 dark:border-red-800 animate-pulse shadow-sm',
      level: 3
    };
  } else if (diffDays <= 2) {
    return {
      message: `Còn ${diffDays} ngày`,
      colorClass: 'text-orange-700 bg-orange-100 border-orange-300 dark:text-orange-400 dark:bg-orange-900/40 dark:border-orange-800',
      level: 2
    };
  } else if (diffDays <= 10) {
    return {
      message: `Còn ${diffDays} ngày`,
      colorClass: 'text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-400 dark:bg-blue-900/40 dark:border-blue-800',
      level: 1
    };
  }
  
  return null;
}
