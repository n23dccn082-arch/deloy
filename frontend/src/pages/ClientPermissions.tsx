import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  members: any[];
}

export default function ClientPermissions() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [clients, setClients] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/users'),
        axios.get('http://localhost:8080/api/projects')
      ]);
      const allUsers = usersRes.data as User[];
      setClients(allUsers.filter(u => u.role === 'CLIENT'));
      setProjects(projectsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const isMember = (projectId: string, userId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    return project.members.some((m: any) => m.userId === userId);
  };

  const togglePermission = async (projectId: string, hasAccess: boolean) => {
    if (!selectedClient) return;
    try {
      if (hasAccess) {
        // Remove access
        await axios.delete(`http://localhost:8080/api/projects/${projectId}/members`, {
          data: { userId: selectedClient.id }
        });
      } else {
        // Grant access
        await axios.post(`http://localhost:8080/api/projects/${projectId}/members`, {
          userId: selectedClient.id,
          role: 'VIEWER' // Default role for client
        });
      }
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle permission', err);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a]">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Cấp quyền dự án</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Quản lý dự án hiển thị cho khách hàng</p>
              </div>
            </div>
            <Link to="/dashboard" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Về Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Client List */}
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Danh sách khách hàng</h2>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading && clients.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">Đang tải...</div>
              ) : clients.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">Không có tài khoản khách hàng nào.</div>
              ) : (
                clients.map(client => (
                  <div
                    key={client.id}
                    className={`p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${selectedClient?.id === client.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="font-medium text-zinc-900 dark:text-white">{client.name}</div>
                    <div className="text-sm text-zinc-500">{client.email}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Project Access */}
          <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {selectedClient ? `Cấp quyền cho: ${selectedClient.name}` : 'Chọn khách hàng để cấp quyền'}
              </h2>
            </div>
            {selectedClient ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {projects.map(project => {
                  const hasAccess = isMember(project.id, selectedClient.id);
                  return (
                    <div key={project.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-white">{project.name}</div>
                      </div>
                      <button
                        onClick={() => togglePermission(project.id, hasAccess)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          hasAccess 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60' 
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {hasAccess ? (
                          <><Check className="w-4 h-4" /> Đã cấp quyền</>
                        ) : (
                          <><X className="w-4 h-4" /> Chưa cấp quyền</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                Vui lòng chọn một khách hàng từ danh sách bên trái để xem và cấp quyền truy cập dự án.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
