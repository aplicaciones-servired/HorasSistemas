import cors from 'cors';
import express from 'express';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

export default app;