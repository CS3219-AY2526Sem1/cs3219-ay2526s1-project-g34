import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {io} from 'socket.io-client';
const gatewayUrl = 'http://localhost:3000/api'; 

const API = `${gatewayUrl}/matching`;
const POLLING_INTERVAL_MS = 1000;

export const CreateMatchPage = ({user}) => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState('easy');
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [isFinding, setIsFinding] = useState(false);

    const pollTimerRef = useRef(null);
    

  
// Poll for match status while isFinding === true
  useEffect(() => {
    if (!user?.id || !isFinding) return;

    // Safety: clear any existing interval before starting a new one
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/status?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
        });

        if (r.status === 401 || r.status === 403) {
          // Unauthorized → stop polling and ask user to sign in again
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
          setIsFinding(false);
          alert('Session expired. Please sign in again.');
          return;
        }

        const d = await r.json();

        if (d?.matched) {
            // SUCCESS: Match Found
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setIsFinding(false);
            console.log('Matched!', d);
            if (d.sessionId) navigate(`/match/${d.sessionId}`,
              { state: {matchData: d} }
            );
            
        } else if (d?.status === "EXPIRED") {
            // TIMEOUT: User was removed from the queue
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setIsFinding(false); // Stop the spinner/search state
            console.log('Match expired after 60 seconds.');
            alert('Match search expired. Please try again.');
        }

      } catch (error) {
        console.error('Polling failed:', error);
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
        setIsFinding(false);
        alert('Connection failed while polling. Please try again.');
      }
    }, POLLING_INTERVAL_MS);

    // Cleanup on unmount or dependency change
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isFinding, user?.id, navigate]);



  const handleSubmit = async e => {
      e.preventDefault();

      if (!user?.id) { alert('Please sign in first.'); return; }
      
      
      try {
        const payload = {
          userId: user.id,
          difficulty,
          topic: selectedTopic ?? null
        };

        const response = await fetch(`${API}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          setIsFinding(false); // stop spinner if backend rejected request
          console.error('Error creating match:', result?.error);
          alert(`Error: ${result?.error || 'Failed to create match'}`);
          return;
        }
        setIsFinding(true);

        console.log('Match request accepted:', result);
        // Optional: if backend returns a session immediately (instant match), navigate now
        if (result?.matched && result?.sessionId) {
          setIsFinding(false);
          navigate(`/match/${result.sessionId}`,
            { state: {matchData: result} }
          );
        }
        // otherwise continue polling
      } catch (error) {
        console.error('Network error:', error);
        setIsFinding(false);
        alert('Network error. Please try again later.');
      }




      // // heng xing part below
      // e.preventDefault();
      // const response = await fetch('http://localhost:3001/api/matches', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // const result = await response.json();
      // if (response.ok) {
      //   navigate('/matches');
      // }
    };


    // Fetch available topics
    useEffect(() => {
      fetch(`${gatewayUrl}/questions/topics`).then(res => res.json()).then(data => {
        const topicList = data.topics || []; 
        setTopics(topicList);
        console.log('questions topics', topicList);
      })
    }, [])

    const handleCancelFindMatch = () => {
      setIsFinding(false);
      // Optionally notify backend to cancel match search
      fetch(`${API}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ userId: user.id }),
      }).then(res => {
        if (!res.ok) {
          console.error('Failed to cancel match search');
        }
      }).catch(err => {
        console.error('Network error while cancelling match search:', err);
      });
    };
  
    // --- UI improvements: inline styles + spinner keyframes (no logic changes) ---
    const styles = {
      container: {
        display: 'flex',
        justifyContent: 'center',
        padding: 24,
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      card: {
        width: '100%',
        maxWidth: 560,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
        padding: 20,
        boxSizing: 'border-box',
      },
      title: { margin: 0, fontSize: 20, color: '#0f172a' },
      desc: { marginTop: 6, marginBottom: 14, color: '#475569', fontSize: 13 },
      field: { marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 },
      label: { fontSize: 13, color: '#0f172a', fontWeight: 600 },
      select: { padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef8', fontSize: 14 },
      actions: { display: 'flex', gap: 10, marginTop: 8 },
      primary: disabled => ({
        flex: 1,
        padding: '10px 12px',
        borderRadius: 8,
        border: 'none',
        background: disabled ? '#94a3b8' : '#2563eb',
        color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 700,
      }),
      secondary: {
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid #e6eef8',
        background: '#fff',
        cursor: 'pointer',
        color: '#0f172a',
        fontWeight: 700,
      },
      meta: { marginTop: 10, color: '#64748b', fontSize: 12 },
      spinner: {
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        display: 'inline-block',
        verticalAlign: 'middle',
        marginRight: 8,
        animation: 'cm-spin 1s linear infinite',
      },
    };

    // inject keyframes once
    useEffect(() => {
      const id = 'cm-spinner-style';
      if (document.getElementById(id)) return;
      const s = document.createElement('style');
      s.id = id;
      s.innerHTML = `@keyframes cm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
      document.head.appendChild(s);
    }, []);

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Find a Coding Partner</h2>
          <div style={styles.desc}>Select a difficulty and an optional topic. We'll try to match you quickly — you can cancel anytime.</div>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                disabled={isFinding}
                onChange={e => setDifficulty(e.target.value)}
                style={styles.select}
              >
                <option value='easy'>Easy</option>
                <option value='medium'>Medium</option>
                <option value='hard'>Hard</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="topic">Topic (optional)</label>
              <select
                id="topic"
                value={selectedTopic}
                disabled={isFinding}
                onChange={e => setSelectedTopic(e.target.value)}
                style={styles.select}
              >
                <option value="">Any topic</option>
                {topics.map((topic, index) => (
                  <option key={index} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div style={styles.actions}>
              <button type="submit" disabled={isFinding} style={styles.primary(isFinding)}>
                {isFinding ? (<><span style={styles.spinner} />Finding a match...</>) : 'Find match'}
              </button>

              <button
                type="button"
                disabled={!isFinding}
                onClick={handleCancelFindMatch}
                style={styles.secondary}
              >
                Cancel
              </button>
            </div>

            <div style={styles.meta}>
              {isFinding ? 'Searching — we will notify you when a partner is found.' : 'Matches usually appear within a minute.'}
            </div>
          </form>
        </div>
      </div>
    );
  }

export default CreateMatchPage;
