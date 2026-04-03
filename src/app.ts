import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30, // Limit unauthenticated requests to 30/min defaults
  message: { message: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use(errorHandler);

export default app;
