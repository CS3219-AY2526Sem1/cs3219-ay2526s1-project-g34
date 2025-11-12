const express = require('express');

const helloRoutes = express.Router();

helloRoutes.get('/', (req, res) => {
    res.json({ message: "hello!" })
})

helloRoutes.get('/status', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'User Service',
        timestamp: new Date().toISOString()
    });
});

module.exports = helloRoutes

