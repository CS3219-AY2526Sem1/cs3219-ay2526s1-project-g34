import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom'

export const MatchRoom = (user) => {

  const {matchId} = useParams()

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');


  const [code, setCode] = useState('');

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
      newSocket.emit('message', `hello from server, this is match id ${matchId}`, user.user.id);  // Test emission

      // try join match
      newSocket.emit('join-match', matchId, user.user.id)
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setIsConnected(false);
    });

    // newSocket.on('response', (data) => {
    //   console.log('Received:', data);
    //   setMessages(prev => [...prev, `Server: ${data}`]);
    // });

    // newSocket.on('connect_error', (err) => {
    //     console.error('❌ Connect Error:', err.message);
    // });

    newSocket.on('match-joined', (matchData) => {
      console.log('✅ Successfully joined match:', matchData);
    });

    newSocket.on('user-joined', (data) => {
      console.log('👤 User joined:', data);
    });

    newSocket.on('code-updated', (data) => {
      console.log('code updated!')
      setCode(data.code);
      console.log('this is code now', code)
    })
  
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.emit('code-update', matchId, user.user.id, inputMessage )
    }
  };

  return (
    <div>
      <h1>WebSocket Test</h1>

      <div>
        Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={!isConnected}>
          Send Message
        </button>
      </div>

      <div>
        <h3>Messages:</h3>
        {/* <div>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div> */}
        <div>
          {code}
        </div>
      </div>
    </div>
  );
};
