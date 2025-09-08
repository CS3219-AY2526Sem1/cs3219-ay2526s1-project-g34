var express = require('express')
var cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware');
var app = express()
 
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use(express.json());
 
app.use('/api/users', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' }
}))

app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' }
}))

app.listen(3001, function () {
  console.log('app proxy')
})