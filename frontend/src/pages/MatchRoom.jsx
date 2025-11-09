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
    console.log('1')
    const newSocket = io('http://localhost:3001/', {
        transports: ['websocket'],
        reconnection: false,
    });
    // const newSocket = io('http://localhost:3003');

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
    <div>
      <h1>code pad</h1>
      <button onClick={handleEndMatch}>end match</button>

      <div>
        Connection Status: {isConnected ? 'Connected' : 'Disconnected'} to session {matchId}
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
      </div>
    </div>
  );
};
