// AI Assistance Disclosure:
// Tool: GitHub Copilot (Claude Sonnet 4.5)
// Date: 2025-11-07
// Scope: Assisted in enhancing the `LayoutComponent` React layout with dynamic navigation styling,
// active route highlighting using `useLocation`, and improved UI/UX structure. 
// Author review: I verified route path checks, refined conditional rendering logic, optimized
// inline style organization, and ensured component compatibility with React.

import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

export const LayoutComponent = ({handleLogout, user}) => {
    const location = useLocation();
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <nav style={styles.nav}>
                    <div style={styles.brand}>
                        <span style={styles.logo}>👨‍💻</span>
                        <span style={styles.brandText}>PeerPrep</span>
                    </div>
                    
                    <ul style={styles.navList}>
                        <li style={styles.navItem}>
                            <Link 
                                to="/home" 
                                style={{
                                    ...styles.navLink,
                                    ...(isActive('/home') ? styles.navLinkActive : {})
                                }}
                            >
                                🏠 Home
                            </Link>
                        </li>
                        <li style={styles.navItem}>
                            <Link 
                                to="/create_match" 
                                style={{
                                    ...styles.navLink,
                                    ...(isActive('/create_match') ? styles.navLinkActive : {})
                                }}
                            >
                                ➕ Create Match
                            </Link>
                        </li>
                        {/* <li style={styles.navItem}>
                            <Link 
                                to="/matches" 
                                style={{
                                    ...styles.navLink,
                                    ...(isActive('/matches') ? styles.navLinkActive : {})
                                }}
                            >
                                🔍 Find Matches
                            </Link>
                        </li> */}
                        {user && user.role === "admin" && (
                            <li style={styles.navItem}>
                                <Link 
                                    to="/questionmanager" 
                                    style={{
                                        ...styles.navLink,
                                        ...(isActive('/questionmanager') ? styles.navLinkActive : {})
                                    }}
                                >
                                    ⚙️ Manage Questions
                                </Link>
                            </li>
                        )}
                    </ul>
                    
                    <div style={styles.userSection}>
                        <span style={styles.userName}>👤 {user?.username || 'User'}</span>
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </nav>
            </header>
            <main style={styles.main}>
                <Outlet />
            </main>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    nav: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1e293b',
    },
    logo: {
        fontSize: '2rem',
    },
    brandText: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    navList: {
        display: 'flex',
        listStyle: 'none',
        gap: '0.5rem',
        margin: 0,
        padding: 0,
        flex: 1,
        justifyContent: 'center',
    },
    navItem: {
        margin: 0,
    },
    navLink: {
        display: 'block',
        padding: '0.625rem 1.25rem',
        borderRadius: '0.5rem',
        color: '#475569',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
    },
    navLinkActive: {
        background: '#4f46e5',
        color: 'white',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    userName: {
        color: '#475569',
        fontWeight: '500',
        fontSize: '0.95rem',
    },
    logoutButton: {
        background: '#ef4444',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    main: {
        flex: 1,
    },
};