// AI Assistance Disclosure:
// Tool: GitHub Copilot (Claude Sonnet 4.5)
// Date: 2025-11-07
// Scope: Assisted in building and refining the `MatchesPage` React component with asynchronous 
// data fetching logic, dynamic rendering of matches, and conditional UI for loading and error states. 
// Suggested integration of enhanced table layout, participant listing, and empty state feedback. 
// Contributed inline styling for responsiveness, accessibility, and improved readability of match 
// information (ID, status, participants, actions).
// Author review: I validated API fetch logic, refined error handling for both user and collaboration 
// services, optimized layout consistency with modern UI patterns, and verified visual hierarchy 
// alignment with the overall PeerPrep interface design.

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
const gatewayUrl = 'http://localhost:3000/api';

export const MatchesPage = (user) => {
    const [matches, setMatches] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMatches()
    }, [])

    const fetchMatches = async () => {
        try {
            const response = await fetch(`${gatewayUrl}/matches`)
            if (!response.ok) {
                throw new Error('Failed to get matches')
            }

            const data = await response.json();
            console.log('this is the data', data)
            setMatches(data);
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }
  
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Available Matches 🎯</h1>
                    <p style={styles.subtitle}>Join a session and start collaborating</p>
                </div>
                
                {loading && (
                    <div style={styles.loadingCard}>
                        <div style={styles.spinner}></div>
                        <p>Loading matches...</p>
                    </div>
                )}
                
                {error && (
                    <div style={styles.errorCard}>
                        <span style={styles.errorIcon}>⚠️</span>
                        <div>
                            <h3 style={styles.errorTitle}>Error Loading Matches</h3>
                            <p style={styles.errorMessage}>{error}</p>
                        </div>
                    </div>
                )}
                
                {!loading && !error && (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Match ID</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Participants</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={styles.emptyState}>
                                            <div style={styles.emptyContent}>
                                                <span style={styles.emptyIcon}>🔍</span>
                                                <h3 style={styles.emptyTitle}>No matches found</h3>
                                                <p style={styles.emptyMessage}>Create a new match to get started!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    matches.map(match => (
                                        <tr key={match.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <code style={styles.matchId}>{match.id.substring(0, 8)}...</code>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: match.status === 'waiting' ? '#fef3c7' : '#d1fae5',
                                                    color: match.status === 'waiting' ? '#92400e' : '#065f46',
                                                }}>
                                                    {match.status === 'waiting' ? '⏳ Waiting' : '✅ Active'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.participants}>
                                                    {match.participants.length === 0 ? (
                                                        <span style={styles.noParticipants}>No participants yet</span>
                                                    ) : (
                                                        <ul style={styles.participantList}>
                                                            {match.participants.map(p => (
                                                                <li key={p.userId} style={styles.participant}>
                                                                    👤 User #{p.userId}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <Link to={`/match/${match.id}`} style={styles.joinButton}>
                                                    Join Match →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        padding: '2rem',
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        opacity: 0.9,
    },
    loadingCard: {
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        textAlign: 'center',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    spinner: {
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #4f46e5',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem',
    },
    errorCard: {
        background: '#fee2e2',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    errorIcon: {
        fontSize: '2rem',
    },
    errorTitle: {
        color: '#dc2626',
        marginBottom: '0.25rem',
    },
    errorMessage: {
        color: '#7f1d1d',
    },
    tableContainer: {
        background: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        background: '#f1f5f9',
        padding: '1rem 1.5rem',
        textAlign: 'left',
        fontWeight: '600',
        color: '#1e293b',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    td: {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    tr: {
        transition: 'background-color 0.2s',
    },
    matchId: {
        background: '#f1f5f9',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
    },
    badge: {
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '600',
        display: 'inline-block',
    },
    participants: {
        fontSize: '0.875rem',
    },
    noParticipants: {
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    participantList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    participant: {
        padding: '0.25rem 0',
        color: '#475569',
    },
    joinButton: {
        background: '#4f46e5',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        display: 'inline-block',
        fontWeight: '600',
        fontSize: '0.875rem',
        transition: 'background-color 0.3s',
    },
    emptyState: {
        padding: '4rem 2rem',
        textAlign: 'center',
    },
    emptyContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },
    emptyIcon: {
        fontSize: '4rem',
    },
    emptyTitle: {
        color: '#1e293b',
        fontSize: '1.5rem',
        margin: 0,
    },
    emptyMessage: {
        color: '#64748b',
        margin: 0,
    },
};