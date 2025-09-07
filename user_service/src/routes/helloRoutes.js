import express from 'express';

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

export default helloRoutes

