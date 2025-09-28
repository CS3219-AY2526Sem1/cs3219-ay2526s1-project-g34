const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid')
const { createServer } = require('http');
const { Server } = require('socket.io');
const { match } = require('assert');

const app = express();
const matches = {}

// Apply middleware BEFORE Socket.IO routes
app.use(morgan('debug'));

app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {  // Intercept send to capture body
      res.locals.body = body;   // Store for logging
      return originalSend.apply(this, arguments);
  };

  res.on('finish', () => {
      // console.log('📤 Response Sent from Socket Server:');
      // console.log(`  - Status: ${res.statusCode}`);
      // console.log(`  - Headers: ${JSON.stringify(res.getHeaders(), null, 2)}`);
      if (res.locals.body !== undefined) {
          console.log(`  - Body: ${JSON.stringify(res.locals.body, null, 2)}`);
      } else {
          console.log('  - Body: (No body or stream)');
      }
  });
  next();
});


// let Socket.IO handle its own paths FIRST
// must come BEFORE other middleware/routes
const httpServer = createServer(app);

httpServer.on('upgrade', (req, socket, head) => {
  console.log('🔄 WebSocket Upgrade Request Received:');
  console.log(`  - URL: ${req.url}`);
  console.log(`  - Headers: ${JSON.stringify(req.headers, null, 2)}`);
  // Socket.IO will handle the upgrade automatically
});


const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  upgradeTimeout: 10000,
  pingTimeout: 20000,
  pingInterval: 25000
});

// Socket.IO connection handling with detailed logging
io.on('connection', (socket) => {

  socket.on('disconnect', (reason) => {
      console.log('❌ Client Disconnected:');
      console.log(`  - ID: ${socket.id}`);
      console.log(`  - Reason: ${reason}`);
  });

  // match making

  socket.on('join-match', (matchId, userId) => {
    console.log('this is join match, it was called')
    if (!matches[matchId]) {
    console.log('join match match not found')
      socket.emit('error', 'match not found!')
      return
    }
    const existingUser = matches[matchId].participants.find(p => p.userId === userId)
    if (existingUser) {
    console.log('join match, existing user found')
      socket.join(matchId)
      socket.emit('error', 'User already in match' )
      return
    }

    console.log('join match successfully running rest of logic')
    socket.join(matchId)
    matches[matchId].participants.push({
      userId,
      socketId: socket.id
    })
    console.log(matches[matchId])
    socket.to(matchId).emit('user-joined', {userId, matchId})
    socket.emit('match-joined', matches[matchId])
  })

  socket.on('code-update', (matchId, userId, newCode) => {
    if (!matches[matchId]) return
    console.log('code update emit')
    matches[matchId].state.code = newCode;
    console.log('emit code-updated to ', matchId)
    io.to(matchId).emit('code-updated', {
      code: newCode
    })
  })
});

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    connections: io.sockets.sockets.size,
    timestamp: new Date().toISOString() 
  });
});

app.get('/matches', (req,res) => {
  const allMatches = Object.values(matches)
  res.json(allMatches);
})


app.post('/matches', (req, res) => {
  const matchId = uuid.v4();
  matches[matchId] = {
    id: matchId,
    status: 'waiting',
    participants: [],
    state: {
      code: ''
    }
  }
  console.log('match cretaed!')
  console.log(matches)
  res.json({matchId})
})

app.get('/matches/:id', (req,res) => {
  const match = matches[req.params.id]
  if (!match) {
    return res.status(404).json({error: "no match found"})
  }
  res.json(match);
})

app.use(express.json())

// Listen on HTTP server
httpServer.listen(3003, () => {
  console.log('WebSocket server running on port 3003');
});
