const express = require('express');
const morgan = require('morgan');
const questionRoutes = require('./routes/questionRoute.js');


const app = express();

app.use(morgan('dev'))
app.use(express.json());

// routes
app.use('/questions', questionRoutes);

module.exports = app;
