import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests (useful if testing from web browser too)
app.use(express.json()); // Parse JSON bodies (Critical for Mobile APIs)

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        project: 'Software Construction Mobile App Backend',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            // Auth endpoints will go here
        }
    });
});

export default app;
