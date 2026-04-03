import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import recordRoutes from './routes/record.routes';
import dashboardRoutes from './routes/dashboard.routes';
import auditRoutes from './routes/audit.routes';

// Load swagger file
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30, // Limit unauthenticated requests to 30/min defaults
  message: { message: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Error handler
app.use(errorHandler);

export default app;
