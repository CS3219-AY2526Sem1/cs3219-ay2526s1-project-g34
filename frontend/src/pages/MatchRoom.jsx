import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'

export const MatchRoom = (user) => {

  const {matchId} = useParams()

  const navigate = useNavigate()

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [code, setCode] = useState('');
  const location = useLocation();
  const matchData = location.state?.matchData;
  if (!matchData) {
    // Handle the case where someone navigated directly or the state was lost
    return <div>Error: Match data not found.</div>;
  }
  const { sessionId, partnerId, question} = matchData;
  console.log('match data in match room', matchData)


  useEffect(() => {
    console.log('Initializing Socket.IO connection to collaboration service')
    const newSocket = io('http://localhost:3003', {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ WS Connected! SID:', newSocket.id);
      // try join match
      newSocket.emit('join-match', matchId, user.user.id)
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setIsConnected(false);
    });


    newSocket.on('match-joined', (matchData) => {
      console.log('✅ Successfully joined match:', matchData);
      setCode(matchData.state.code || '')
    });

    newSocket.on('user-joined', (data) => {
      console.log('👤 User joined:', data);
    });

    newSocket.on('code-updated', (data) => {
      setCode(data.code);
      console.log('this is code now', code)
    })

    newSocket.on('match-ended', (data) => {
      navigate('/home')
    })
  
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [matchId, user.user.id, navigate]);



  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    if (socket) {
      socket.emit('code-update', matchId, user.user.id, newCode);
    }
  };
  
  const handleEndMatch = () => {
    if(socket) {
      console.log('end match triggered by client')
      socket.emit('end-match', matchId)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>💻 Collaborative Code Editor</h1>
          <div style={styles.matchInfo}>
            <span style={styles.matchLabel}>Match ID:</span>
            <code style={styles.matchId}>{matchId.substring(0, 12)}...</code>
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <div style={{
            ...styles.statusBadge,
            background: isConnected ? '#d1fae5' : '#fee2e2',
            color: isConnected ? '#065f46' : '#991b1b',
          }}>
            <span style={styles.statusDot}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <button 
            onClick={handleEndMatch}
            style={styles.endButton}
          >
            End Session
          </button>
        </div>
      </div>

      <div>
        <h2>Question:</h2>
        <div>
          <h3>{question.id}. {question.title}</h3>
          <p>{question.description}</p>
          <p>Difficulty: {question.difficulty}</p>
          <p>Topic: {question.topics}</p>
        </div>
      
        <div>
          <textarea
            value={code}
            onChange={handleChange}
            rows={20}
            cols={80}
          />
        </div>
        
        <textarea
          value={code}
          onChange={handleChange}
          placeholder="// Start typing your code here...&#10;// Changes will be synced in real-time with other participants"
          style={styles.editor}
        />
        
        <div style={styles.editorFooter}>
          <div style={styles.footerInfo}>
            <span style={styles.footerText}>💡 Tip: Your code changes are automatically saved and synced</span>
          </div>
        </div>
      </div>
      
      <div style={styles.sidebar}>
        <div style={styles.sidebarCard}>
          <h3 style={styles.sidebarTitle}>📌 Session Info</h3>
          <div style={styles.sidebarContent}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Session ID</span>
              <code style={styles.infoValue}>{matchId.substring(0, 8)}</code>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Your Username</span>
              <span style={styles.infoValue}>{user.user.username}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Connection</span>
              <span style={{
                ...styles.infoValue,
                color: isConnected ? '#10b981' : '#ef4444',
                fontWeight: '600',
              }}>
                {isConnected ? '● Online' : '○ Offline'}
              </span>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gridTemplateRows: 'auto 1fr',
    gap: '1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    gridColumn: '1 / -1',
    background: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  matchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  matchLabel: {
    color: '#64748b',
    fontWeight: '500',
  },
  matchId: {
    background: '#f1f5f9',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#475569',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'currentColor',
  },
  endButton: {
    background: '#ef4444',
    color: 'white',
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  editorContainer: {
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  editorHeader: {
    background: '#f1f5f9',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  editorTabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  activeTab: {
    background: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1e293b',
  },
  editorInfo: {
    display: 'flex',
    gap: '1rem',
  },
  infoText: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  editor: {
    flex: 1,
    padding: '1.5rem',
    border: 'none',
    outline: 'none',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    resize: 'none',
    background: '#fafafa',
    color: '#1e293b',
  },
  editorFooter: {
    background: '#f1f5f9',
    padding: '0.75rem 1rem',
    borderTop: '1px solid #e2e8f0',
  },
  footerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sidebarCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1rem',
  },
  sidebarContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f1f5f9',
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  infoValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: '500',
  },
};
