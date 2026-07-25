import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8F9FA 0%, #E3E8ED 100%)'
    }}>
      <div className="card shadow-lg border-0" style={{
        width: '100%',
        maxWidth: '440px',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF'
      }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <img 
              src="/logo.jpg" 
              alt="Stavya Spine Hospital" 
              style={{ maxHeight: '75px', maxWidth: '100%', objectFit: 'contain' }} 
            />
            <h5 className="mt-3 fw-bold text-secondary" style={{ letterSpacing: '0.5px' }}>
              Patient Escort Coordination
            </h5>
          </div>
          
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary fw-semibold small">Username</label>
              <input 
                type="text" 
                className="form-control form-control-lg bg-light border" 
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                style={{ fontSize: '1rem', borderRadius: '8px' }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary fw-semibold small">Password</label>
              <input 
                type="password" 
                className="form-control form-control-lg bg-light border" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ fontSize: '1rem', borderRadius: '8px' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-3 fw-bold shadow-sm" 
              style={{ borderRadius: '8px', fontSize: '1.05rem', backgroundColor: '#1B6CA8', borderColor: '#1B6CA8' }}
            >
              Sign In to System
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
