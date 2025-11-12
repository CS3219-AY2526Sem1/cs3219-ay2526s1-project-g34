// AI Assistance Disclosure:
// Tool: GitHub Copilot (Claude Sonnet 4.5)
// Date: 2025-11-07
// Scope: Assisted in creating and refining the `SignupPage` React component, including form 
// validation, password confirmation logic, role toggle functionality (user/admin), and navigation 
// flow after successful registration. Suggested implementation of async/await with error handling 
// for API calls, JWT token storage in localStorage, and responsive inline styling for form fields 
// and buttons. Added UI enhancements such as role-based color toggling, dynamic loading states, 
// and inline error display for improved UX.
// Author review: I validated registration logic and API integration, improved input accessibility, 
// refined visual consistency with the login flow, and ensured secure form handling practices in 
// alignment with the PeerPrep application’s design and architecture.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const gatewayUrl = 'http://localhost:3000/api'; 

export const SignupPage = ({ setUser }) => {
    const [data, setData] = useState({ username: '', password: '', role: 'user' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (data.password !== confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${gatewayUrl}/users`, {
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
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const newRole = data.role === 'user' ? 'admin' : 'user';
        setData({ ...data, role: newRole });
    };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join PeerPrep and start collaborating</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text"
              placeholder="Choose a username"
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
              placeholder="Create a password"
              value={data.password}
              onChange={(e) => setData({...data, password: e.target.value})}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input 
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.roleToggle}>
            <label style={styles.label}>Account Type</label>
            <button 
              type="button" 
              onClick={handleToggle}
              style={{
                ...styles.toggleButton,
                background: data.role === 'admin' ? '#4f46e5' : '#e2e8f0',
                color: data.role === 'admin' ? 'white' : '#475569',
              }}
            >
              {data.role === 'user' ? '👤 User Account' : '👑 Admin Account'}
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/')}
            style={styles.secondaryButton}
          >
            Already have an account? Log in
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
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  roleToggle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  toggleButton: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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
  },
};