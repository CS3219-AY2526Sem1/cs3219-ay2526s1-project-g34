import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CreateMatchPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    const handleSubmit = async e => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        const response = await fetch('http://localhost:3003/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        if (response.ok) {
          navigate('/matches');
        } else {
          setError('Failed to create match');
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
                    <div style={styles.iconCircle}>🎯</div>
                    <h1 style={styles.title}>Create New Match</h1>
                    <p style={styles.subtitle}>Start a collaborative coding session</p>
                </div>
                
                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.info}>
                        <p>🚀 Create a new match and invite other developers to join you</p>
                        <p>💻 Work together on coding challenges in real-time</p>
                        <p>🤝 Collaborate and learn from each other</p>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={styles.createButton}
                    >
                        {loading ? 'Creating Match...' : '✨ Create Match'}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => navigate('/matches')}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        padding: '3rem',
        width: '100%',
        maxWidth: '500px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    iconCircle: {
        fontSize: '4rem',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#64748b',
        fontSize: '1rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    info: {
        background: '#f1f5f9',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        lineHeight: '1.8',
        color: '#475569',
    },
    error: {
        background: '#fee2e2',
        color: '#dc2626',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        marginBottom: '1rem',
    },
    createButton: {
        background: '#4f46e5',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    cancelButton: {
        background: 'transparent',
        color: '#64748b',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
};