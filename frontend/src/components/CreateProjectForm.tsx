import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function CreateProjectForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [managerId, setManagerId] = useState('');
  
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/users`)
        .then(res => {
          const mgrs = res.data.filter((u: any) => u.role === 'TASK_MANAGER');
          setManagers(mgrs);
          if (mgrs.length > 0) setManagerId(mgrs[0].id);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !managerId) {
      setError('Vui lòng nhập tên dự án và chọn người quản lý');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/projects`, {
        name,
        description,
        priority,
        deadline,
        budget: budget ? budget : '0',
        createdById: user?.id || 'admin'
      });
      
      const newProject = res.data;
      
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/projects/${newProject.id}/members`, {
        userId: managerId,
        role: 'manager'
      });
      
      navigate(`/projects/${newProject.id}`);
    } catch (err: any) {
      console.error(err);
      setError('Lỗi khi tạo dự án');
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
      >
        <Plus className="w-5 h-5" /> Khởi tạo dự án
      </button>
    );
  }

  return (
    <div className="w-full text-left mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-zinc-900 dark:text-white">Thông tin dự án</h3>
        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-red-500"><X className="w-4 h-4"/></button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tên dự án *</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Mô tả</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" rows={2} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Độ ưu tiên</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Chi phí (VND)</label>
            <input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" placeholder="VD: 5000000" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Thời hạn</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Phân công cho (Manager) *</label>
          <select required value={managerId} onChange={e => setManagerId(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
            <option value="">-- Chọn Quản lý --</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <button disabled={loading} type="submit" className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all">
          {loading ? 'Đang tạo...' : 'Lưu dự án & Phân công'}
        </button>
      </form>
    </div>
  );
}
