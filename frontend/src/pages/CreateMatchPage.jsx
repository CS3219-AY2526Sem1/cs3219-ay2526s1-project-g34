import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {io} from 'socket.io-client';

const API = 'http://localhost:3001/api/matching';
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
      fetch('http://localhost:3001/api/questions/topics').then(res => res.json()).then(data => {
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
  
    return (
    
    
      <form onSubmit={handleSubmit}>
        <h2>Create a New Match</h2>
        <label>
          Difficulty:
          <select value={difficulty} disabled={isFinding} onChange={e => setDifficulty(e.target.value)}>
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </select>
        </label>

        <select value={selectedTopic} disabled={isFinding} onChange={e => setSelectedTopic(e.target.value)} >
          <option value="" ></option>
          {topics.map((topic, index) => (
            <option key={index} value={topic} >{topic}</option>
          ))}
        </select>
        
        <button type="submit"  disabled={isFinding}>
          {isFinding ? "Finding a match..." : "Find match" }
        </button>

        <button type="button" disabled={!isFinding} onClick={() => { handleCancelFindMatch();}}>
          Cancel
        </button>
      </form>
      
    );
  }

export default CreateMatchPage;
