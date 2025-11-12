const express  = require('express');
const morgan = require('morgan');
const cors = require('cors'); 
const matchingRoutes = require('./routes/matchingRoutes.js');

const app = express();
app.use(morgan('dev'))
app.use(express.json());

// // CORS configuration
// app.use(cors({
//     origin: ['http://localhost', 'http://localhost:80', 'http://localhost:5173'],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));

// routes
app.use('/matching', matchingRoutes);
module.exports = app;


