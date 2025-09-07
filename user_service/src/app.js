const express = require('express');
const morgan = require('morgan');
const helloRoutes = require('./routes/helloRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

const app = express();

app.use(morgan('dev'))
app.use(express.json());

// routes
app.use('/', helloRoutes);
app.use('/users', userRoutes);

module.exports = app;
