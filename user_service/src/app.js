const express = require('express');
const morgan = require('morgan');
const helloRoutes = require('./routes/helloRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

const app = express();

app.use(morgan('dev'))
app.use(express.json());

// routes
app.use('/status', helloRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes)

module.exports = app;
