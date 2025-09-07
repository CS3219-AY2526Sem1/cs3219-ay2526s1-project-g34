import express from 'express';
import helloRoutes from './routes/helloRoutes.js'

const app = express();

app.use(express.json());

// routes
app.use('/', helloRoutes)

export default app;
