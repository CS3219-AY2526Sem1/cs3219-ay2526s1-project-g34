const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helloRoutes = require('./routes/helloRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

const app = express();

// // CORS configuration
// app.use(cors({
//     origin: ['http://localhost', 'http://localhost:80', 'http://localhost:5173'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));

app.use(morgan('dev'))
app.use(express.json());

// routes
app.use('/status', helloRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

module.exports = app;
