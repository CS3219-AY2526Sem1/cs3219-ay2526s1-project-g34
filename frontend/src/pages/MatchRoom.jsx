import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
const gatewayUrl = 'http://localhost:3000';

export const MatchRoom = (user) => {

  const {matchId} = useParams()

  const navigate = useNavigate()

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [code, setCode] = useState('');
  const [partnerUsername, setPartnerUsername] = useState(null);
  const [isNarrow, setIsNarrow] = useState(false); // responsive flag
  const location = useLocation();
  const matchData = location.state?.matchData;
  if (!matchData) {
    // Handle the case where someone navigated directly or the state was lost
    return <div>Error: Match data not found.</div>;
  }
  const { sessionId, partnerId, question} = matchData;
  console.log('match data in match room', matchData)

  // responsive: update isNarrow on resize
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 920);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
 
  // helper ids: full vs shortened for display
  const fullSessionId = matchId || sessionId || '';
  const shortSessionId = (() => {
    if (!fullSessionId) return '';
    const s = String(fullSessionId);
    if (s.length <= 12) return s;
    // show first 6 chars, ellipsis, last 4 chars: "abcdef…wxyz"
    return `${s.substring(0, 6)}…${s.substring(s.length - 4)}`;
  })();

  useEffect(() => {
    console.log('Initializing Socket.IO connection to collaboration service')
    const newSocket = io(`${gatewayUrl}`, {
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



  // Try to resolve partner username if only partnerId was provided
  useEffect(() => {
    if (!matchData?.partnerId) return;
    // if backend already provided a username, use it
    if (matchData.partnerUsername) {
      setPartnerUsername(matchData.partnerUsername);
      return;
    }

    // best-effort fetch; endpoint may vary — fail silently and fall back to partnerId
    const pid = matchData.partnerId;
    (async () => {
      try {
        const res = await fetch(`${gatewayUrl}/api/users/${pid}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
        });
        if (!res.ok) throw new Error('no user');
        const data = await res.json();
        // attempt common fields
        setPartnerUsername(data.username || data.name || data.displayName || pid);
      } catch (err) {
        // fallback to id if fetch fails
        setPartnerUsername(pid);
      }
    })();
  }, [matchData]);
  


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

  // --- UI: split view (problem + editor) and full match id shown ---
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>💻 Collaborative Code Editor</h1>
          <div style={styles.matchInfo}>
            <span style={styles.matchLabel}>Session ID:</span>
            <code style={styles.matchId}>{shortSessionId}</code>
            
            <span style={styles.infoLabel}>Partner</span>
            <span style={styles.infoValue}>{partnerUsername || matchData.partnerId || 'Anonymous'}</span>
            
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
          
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button
              onClick={() => {
                try {
                  // copy full id even though UI shows short id
                  const idToCopy = fullSessionId;
                   navigator.clipboard?.writeText(idToCopy);
                   alert('Session ID copied to clipboard');
                 } catch {
                   /* ignore */
                 }
               }}
               style={styles.copyButton}
               title="Copy session id"
             >
               Copy ID
             </button>

            <button 
              onClick={handleEndMatch}
              style={styles.endButton}
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Main column: split into two panes so both Problem and Editor are visible (editor wider).
          When narrow, stack vertically for easier reading/editing. */}
      <main style={{
          gridColumn: '1 / auto',
          display: 'grid',
          gridTemplateColumns: isNarrow ? '1fr' : '40% 60%',
          gap: '1rem',
          alignItems: 'start'
        }}>
         <section style={styles.problemPane}>
           <div style={styles.paneHeader}>
             <div style={styles.paneTitle}>Problem</div>
             <div style={styles.paneMeta}>
               <div style={styles.infoText}>Difficulty: <strong>{question?.difficulty ?? '—'}</strong></div>
             </div>
           </div>
           <div style={{padding:12, overflow:'auto', maxHeight: '60vh', whiteSpace:'pre-wrap', color:'#475569'}}>
             <h3 style={{margin:'0 0 8px 0'}}>{question?.id}. {question?.title}</h3>
             <div>{question?.description}</div>
             <div style={{marginTop:12, color:'#64748b', fontSize:13}}>Topic: <strong style={{color:'#0f172a'}}>{Array.isArray(question?.topics) ? question.topics.join(', ') : question?.topics ?? '—'}</strong></div>
           </div>
         </section>

         <section style={styles.editorPane}>
           <div style={styles.editorContainer}>
             <div style={styles.editorHeader}>
               <div style={styles.editorTabs}>
                 <div style={styles.activeTab}>Editor</div>
               </div>
               <div style={styles.editorInfo}>
                 {/* show short id in UI but full id is still available via copy */}
                <div style={styles.infoText}>Session: <strong style={{color:'#0f172a'}}>{shortSessionId}</strong></div>
               </div>
             </div>

             <textarea
              value={code}
              onChange={handleChange}
              placeholder={"// Start typing your code here...\n// Changes will be synced in real-time with other participants"}
              style={styles.editor}
              spellCheck={false}
            />

            <div style={styles.editorFooter}>
              <div style={styles.footerInfo}>
                <span style={styles.footerText}>💡 Tip: Your changes are auto-synced</span>
                <span style={{fontSize:12, color:'#94a3b8'}}>{/* kept for layout parity */}</span>
              </div>
            </div>
           </div>
         </section>
       </main>

       {/* Sidebar */}
       <aside style={styles.sidebar}>
         <div style={styles.sidebarCard}>
           <h3 style={styles.sidebarTitle}>📌 Session Info</h3>
           <div style={styles.sessionContent}>
             <div style={styles.infoRow}>
               <span style={styles.infoLabel}>Session ID</span>
               <code style={styles.infoValue}>{shortSessionId}</code>
             </div>
             <div style={styles.infoRow}>
               <span style={styles.infoLabel}>Partner</span>
               <span style={styles.infoValue}>{partnerUsername || matchData.partnerId || 'Anonymous'}</span>
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
             <div style={{marginTop:8}}>
               <button onClick={() => { navigator.clipboard?.writeText(fullSessionId); alert('Session ID copied to clipboard'); }} style={styles.copyButton}>Copy full ID</button>
             </div>
           </div>
         </div>
       </aside>
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
    minHeight: '64vh', // ensure editor pane is tall
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
  tab: {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  tabActive: {
    background: '#fff',
    color: '#1e293b',
    boxShadow: '0 2px 6px rgba(16,24,40,0.06)',
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
    padding: '1rem 1.25rem',
    border: 'none',
    outline: 'none',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '15px',       // slightly larger font for readability
    lineHeight: '1.6',
    resize: 'none',
    background: '#fafafa',
    color: '#1e293b',
    minHeight: '56vh',       // textarea large enough for comfortable editing
    height: '100%',
    boxSizing: 'border-box',
    whiteSpace: 'pre',      // preserve code formatting
    overflow: 'auto',
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
  sessionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sessionPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
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
  copyButton: {
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
    border: '1px solid #e6eef8',
    background: '#ffffff',
    cursor: 'pointer',
    color: '#0f172a',
    fontWeight: 700,
  },
  mainGrid: {
    display: 'grid',
  },
  problemPane: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: 0,
    boxShadow: '0 4px 10px rgba(2,6,23,0.06)',
    overflow: 'hidden',
  },
  editorPane: {
    // reuse editor container look but keep it as a pane
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minHeight: '64vh',
  },
  paneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e6eef8',
    background: '#f8fafc',
  },
  paneTitle: {
    fontWeight: 700,
    color: '#0f172a',
  },
  paneMeta: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
};
