var express = require('express')
var cors = require('cors')
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
var app = express()
const http = require('http')
const server = http.createServer(app);

// ... (existing imports and app setup)

app.use(morgan('dev'));  // Basic logging (already present)

// Custom middleware for detailed incoming request logging (place before proxies)
app.use((req, res, next) => {
    console.log('📥 Incoming Request from Client:');
    console.log(`  - Method: ${req.method}`);
    console.log(`  - URL: ${req.url}`);
    console.log(`  - Headers: ${JSON.stringify(req.headers, null, 2)}`);
    console.log(`  - Query: ${JSON.stringify(req.query, null, 2)}`);
    if (req.body) {
        console.log(`  - Body: ${JSON.stringify(req.body, null, 2)}`);
    }
    next();
});


app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    allowCredentials: true
}))

const ioProxy = createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    ws: true,
    logLevel: 'debug',  // For better logging
    pathRewrite: (path) => '/socket.io' + path, 
    onProxyReq: (proxyReq, req, res) => {
        console.log('📤 Outgoing Proxy Request to Socket Server:');
        console.log(`  - Method: ${req.method}`);
        console.log(`  - URL: ${proxyReq.path}`);
        console.log(`  - Headers: ${JSON.stringify(proxyReq.getHeaders(), null, 2)}`);
        if (req.body) {
            console.log(`  - Body: ${JSON.stringify(req.body, null, 2)}`);
        }
    },
    onProxyReqWs: (proxyReq, req, socket) => {
        // Logs outgoing WebSocket upgrades
        console.log('📤 Outgoing WebSocket Proxy Request:');
        console.log(`  - URL: ${req.url}`);
        console.log(`  - Headers: ${JSON.stringify(req.headers, null, 2)}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        // Logs responses received from socket server (for HTTP/polling)
        console.log('📩 Response Received from Socket Server:');
        console.log(`  - Status: ${proxyRes.statusCode}`);
        console.log(`  - Headers: ${JSON.stringify(proxyRes.headers, null, 2)}`);
        // Note: Body not directly accessible here; use on('data') if needed
        let body = [];
        proxyRes.on('data', (chunk) => body.push(chunk));
        proxyRes.on('end', () => {
            console.log(`  - Body: ${Buffer.concat(body).toString()}`);
        });
    },
    onClose: (res, socket, head) => console.log('🔌 WS Connection Closed'),
    onError: (err, req, res) => {
        console.error('Socket.IO proxy error:', err);
        res.status(500).send('Proxy Error');
    }
});

// Handle all socket.io requests
app.use('/socket.io', ioProxy);

server.on('upgrade', (request, socket, head) => {
    console.log('🔄 WebSocket Upgrade Request from Client:');
    console.log(`  - URL: ${request.url}`);
    console.log(`  - Headers: ${JSON.stringify(request.headers, null, 2)}`);
    if (request.url.startsWith('/socket.io')) {
        console.log('send upgrade request')
        ioProxy.upgrade(request, socket, head);
    } else {
        socket.destroy(); // Optional: Reject non-Socket.IO upgrades
    }
});


app.use('/api/users', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/': '/users' },
    logger: console,
}))

app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/': '/auth/' },
    logger: console,
    on: {
        proxyReq: (proxyReq, req, res) => {
            console.log(req.originalUrl);
            console.log(req.path);
            console.log(proxyReq.path);
            console.log(req.body)
        }
    }
}))

app.use(express.json());

// WebSocket proxy for Socket.IO

// const wsProxy = createProxyMiddleware({
//     target: 'http://localhost:3003',
//     changeOrigin: true,
//     ws: true,
//     logger: console
// });

// Handle WebSocket upgrade
// server.on('upgrade', (request, socket, head) => {
//     console.log('WebSocket upgrade request for:', request.url);
//     if (request.url.startsWith('/socket.io')) {
//         wsProxy.upgrade(request, socket, head);
//     }
// });


server.listen(3001);


