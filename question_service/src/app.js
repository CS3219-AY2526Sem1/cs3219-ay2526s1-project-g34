const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const questionRoutes = require('./routes/questionRoute.js');

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost', 'http://localhost:80', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(morgan('dev'))
app.use(express.json());

// routes
app.use('/questions', questionRoutes);

module.exports = app;
