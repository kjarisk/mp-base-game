import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import './Login.css';

function Login() {
  const { loginUser, registerUser, loginAsGuestUser, loading, error, clearError } = useAppContext();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    clearError(); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await loginUser(formData.username, formData.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await registerUser(formData.username, formData.password);
  };

  const handleGuest = async () => {
    await loginAsGuestUser();
  };

  return (
    <div className="auth-container">
      <img src="/img/spaceship-logo.svg" alt="Game Logo" className="logo" />
      <h1>Stellar Combat</h1>
      
      {/* Tab Navigation */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button 
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Login Form */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="auth-form">
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="auth-form">
          <input
            name="username"
            type="text"
            placeholder="New username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
          <input
            name="password"
            type="password"
            placeholder="New password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="divider">or</div>

      {/* Guest Button */}
      <button 
        onClick={handleGuest} 
        className="guest-btn"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Continue as Guest'}
      </button>
    </div>
  );
}

export default Login;
