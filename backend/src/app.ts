import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config();

const app: Application = express();

import authRoutes from './routes/auth';
import jobRoutes from './routes/job';
import candidateRoutes from './routes/candidate';
import applicationRoutes from './routes/application';
import communicationRoutes from './routes/communication';
import interviewRoutes from './routes/interview';
import assessmentRoutes from './routes/assessment';
import chatbotRoutes from './routes/chatbot';

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Recruitment AI Backend is running' });
});

// Root Route
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Recruitment AI Backend is running. API is available at /api');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error',
    });
});

export default app;
