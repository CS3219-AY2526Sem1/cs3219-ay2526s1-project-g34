var express = require('express')
var cors = require('cors')
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
var app = express()

app.use(morgan('dev'))
// Debug middleware
app.use((req, res, next) => {
    console.log('hello')
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

app.use(express.json());


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
        }
    }
}))

app.listen(3001, function () {
  console.log('app proxy')
})