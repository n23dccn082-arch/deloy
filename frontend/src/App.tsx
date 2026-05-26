import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Users from './pages/Users';
import Reports from './pages/Reports';
import ClientPermissions from './pages/ClientPermissions';
import { AuthProvider, useAuth } from './context/AuthContext';

// Component để bảo vệ các route cần đăng nhập
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Đang tải...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return (
    <>
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute><Projects /></ProtectedRoute>
          } />

          <Route path="/projects/:id" element={
            <ProtectedRoute><ProjectDetails /></ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute><Tasks /></ProtectedRoute>
          } />
          
          <Route path="/tasks/:id" element={
            <ProtectedRoute><TaskDetails /></ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="/profile/change-password" element={
            <ProtectedRoute><ChangePassword /></ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute><Users /></ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute><Reports /></ProtectedRoute>
          } />
          
          <Route path="/permissions" element={
            <ProtectedRoute><ClientPermissions /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
