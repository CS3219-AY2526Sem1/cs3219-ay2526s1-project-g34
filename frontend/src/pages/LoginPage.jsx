// AI Assistance Disclosure:
// Tool: GitHub Copilot (Claude Sonnet 4.5)
// Date: 2025-11-07
// Scope: Assisted in implementing the `LoginPage` React component with form state management, 
// authentication handling, and navigation flow. Suggested structured error and loading state 
// logic, secure credential handling via POST request, and integration with localStorage for JWT 
// token persistence. Also provided styled UI layout for login and signup navigation using inline 
// design system.
// Author review: I validated authentication request flow, improved error message clarity, refined 
// form accessibility (labels and placeholders), and verified navigation transitions between login 
// and signup pages.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const gatewayUrl = 'http://localhost:3000/api'; 

export const LoginPage = ({ setUser }) => {
  const [data, setData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${gatewayUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('jwt_token', result.token);
        setUser(result.user);
        navigate('/home');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome to PeerPrep</h1>
          <p style={styles.subtitle}>Sign in to continue your coding journey</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text"
              placeholder="Enter your username"
              value={data.username}
              onChange={(e) => setData({...data, username: e.target.value})}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password"
              placeholder="Enter your password" 
              value={data.password}
              onChange={(e) => setData({...data, password: e.target.value})}
              required
              style={styles.input}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/signup')}
            style={styles.secondaryButton}
          >
            Don't have an account? Sign up
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    padding: '3rem',
    width: '100%',
    maxWidth: '450px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '600',
    color: '#475569',
    fontSize: '0.875rem',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  primaryButton: {
    background: '#4f46e5',
    color: 'white',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  secondaryButton: {
    background: 'transparent',
    color: '#4f46e5',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    border: '2px solid #4f46e5',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
