export const mockUsers = [
  { id: '1', name: 'Admin', email: 'admin@taskmaster.com', role: 'SUPER_ADMIN' },
  { id: '2', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'MEMBER' },
  { id: '3', name: 'Nguyễn Văn B', email: 'nguyenvanb@example.com', role: 'MEMBER' },
  { id: '4', name: 'Quản lý 1', email: 'manager@taskmaster.com', role: 'TASK_MANAGER' },
  { id: '5', name: 'Nhân viên 1', email: 'member@taskmaster.com', role: 'MEMBER' }
];

export const mockProjects = [
  { id: '1', name: 'Dự án Website Bán Hàng', creator: { name: 'Admin' }, members: [1, 2, 3], tasks: [1, 2, 3] },
  { id: '2', name: 'Hệ thống Quản lý Nhân sự', creator: { name: 'Admin' }, members: [1, 2], tasks: [1] }
];

export const mockTasks = [
  {
    id: '1',
    title: 'Thiết kế giao diện',
    project: { name: 'Dự án Website Bán Hàng' },
    status: 'IN_PROGRESS',
    assignee: { name: 'Nguyễn Văn A' },
    _count: { comments: 2 },
    isOverdue: false
  },
  {
    id: '2',
    title: 'Viết API Login',
    project: { name: 'Hệ thống Quản lý Nhân sự' },
    status: 'TODO',
    assignee: null,
    _count: { comments: 0 },
    isOverdue: false
  },
  {
    id: '3',
    title: 'Sửa lỗi giỏ hàng',
    project: { name: 'Dự án Website Bán Hàng' },
    status: 'TODO',
    assignee: { name: 'Nguyễn Văn B' },
    _count: { comments: 1 },
    isOverdue: true
  },
  {
    id: '4',
    title: 'Tối ưu hiệu suất DB',
    project: { name: 'Dự án Website Bán Hàng' },
    status: 'DONE',
    assignee: { name: 'Admin' },
    _count: { comments: 5 },
    isOverdue: false
  }
];
