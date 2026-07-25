import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider, useSocket } from './contexts/SocketContext';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OPDBoard from './pages/OPDBoard';
import DepartmentBoard from './pages/DepartmentBoard';
import PhysioBoard from './pages/PhysioBoard';
import EscortMobile from './pages/EscortMobile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5 p-5">Loading application...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/opd" element={
        <ProtectedRoute allowedRoles={['OPD Front Desk']}>
          <OPDBoard />
        </ProtectedRoute>
      } />

      <Route path="/dept" element={
        <ProtectedRoute allowedRoles={['Department Front Desk', 'Super Admin']}>
          <DepartmentBoard />
        </ProtectedRoute>
      } />

      <Route path="/physio" element={
        <ProtectedRoute allowedRoles={['Department Front Desk', 'Super Admin']}>
          <PhysioBoard />
        </ProtectedRoute>
      } />

      <Route path="/escort" element={
        <ProtectedRoute allowedRoles={['Escort']}>
          <EscortMobile />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === 'Super Admin' && <Navigate to="/admin" />}
          {user?.role === 'OPD Front Desk' && <Navigate to="/opd" />}
          {user?.role === 'Department Front Desk' && <Navigate to="/dept" />}
          {user?.role === 'Escort' && <Navigate to="/escort" />}
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function NavigationBar() {
  const { user, login } = useAuth();
  const { soundEnabled, toggleSound } = useSocket();

  const handleQuickSwitch = async (roleUsername) => {
    await login(roleUsername, 'Escort@123');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm py-2">
      <div className="container-fluid px-4">
        
        {/* Stavya Logo */}
        <Link className="navbar-brand d-flex align-items-center me-3" to="/">
          <img 
            src="/logo.jpg" 
            alt="Stavya Spine Hospital" 
            style={{ height: '44px', objectFit: 'contain' }}
          />
          <span className="ms-3 fw-bold border-start ps-3" style={{ color: '#1B6CA8', fontSize: '1.1rem' }}>
            Escort Coordination System
          </span>
        </Link>

        {/* Sound Toggle Button */}
        <button 
          onClick={toggleSound} 
          className={`btn btn-sm me-3 ${soundEnabled ? 'btn-success' : 'btn-outline-secondary'}`}
          title="Toggle Notification Sounds"
        >
          {soundEnabled ? '🔊 Sound On' : '🔇 Muted'}
        </button>

        {/* Demo Quick Switcher Header */}
        <div className="d-flex align-items-center ms-auto gap-2">
          <small className="text-muted fw-bold me-1">Quick Demo Switch:</small>
          <button onClick={() => handleQuickSwitch('admin')} className={`btn btn-xs ${user?.role === 'Super Admin' ? 'btn-primary' : 'btn-outline-primary'}`}>
            👑 Admin
          </button>
          <button onClick={() => handleQuickSwitch('opd_desk')} className={`btn btn-xs ${user?.role === 'OPD Front Desk' ? 'btn-primary' : 'btn-outline-primary'}`}>
            🏥 OPD Desk
          </button>
          <button onClick={() => handleQuickSwitch('rad_desk')} className={`btn btn-xs ${user?.role === 'Department Front Desk' ? 'btn-primary' : 'btn-outline-primary'}`}>
            ☢️ Radiology Desk
          </button>
          <button onClick={() => handleQuickSwitch('physio_desk')} className={`btn btn-xs ${user?.username === 'physio_desk' ? 'btn-primary' : 'btn-outline-primary'}`}>
            🏋️ Physio Desk
          </button>
          <button onClick={() => handleQuickSwitch('escort1')} className={`btn btn-xs ${user?.role === 'Escort' ? 'btn-primary' : 'btn-outline-primary'}`}>
            📱 Escort View
          </button>
        </div>

      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <NavigationBar />
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
