export const HomePage = (user) => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Welcome back, {user.user.username}! 👋</h1>
                    <p style={styles.subtitle}>Ready to start coding and collaborating?</p>
                </div>
                
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>👤</div>
                        <div style={styles.statInfo}>
                            <div style={styles.statLabel}>Role</div>
                            <div style={styles.statValue}>{user.user.role}</div>
                        </div>
                    </div>
                    
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🎯</div>
                        <div style={styles.statInfo}>
                            <div style={styles.statLabel}>User ID</div>
                            <div style={styles.statValue}>#{user.user.id}</div>
                        </div>
                    </div>
                </div>
                
                <div style={styles.welcomeText}>
                    <p>You're all set to collaborate with peers on coding challenges!</p>
                    <p>Use the navigation menu to:</p>
                    <ul style={styles.list}>
                        <li>🔍 Find matches with other users</li>
                        <li>💻 Work on coding problems together</li>
                        <li>📚 Browse available questions</li>
                        <li>🤝 Create or join collaborative sessions</li>
                    </ul>
                </div>
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
        maxWidth: '800px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#64748b',
        fontSize: '1.1rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: 'white',
    },
    statIcon: {
        fontSize: '2.5rem',
    },
    statInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    statLabel: {
        fontSize: '0.875rem',
        opacity: 0.9,
        marginBottom: '0.25rem',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: '700',
    },
    welcomeText: {
        background: '#f1f5f9',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        color: '#475569',
        lineHeight: '1.8',
    },
    list: {
        marginTop: '1rem',
        marginLeft: '1.5rem',
        lineHeight: '2',
    },
};