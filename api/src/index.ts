import 'dotenv/config';
import express from 'express';
import { json } from 'body-parser';
import authRoutes from './routes/auth';
import internalRoutes from './routes/internal';
import dynamicRoutes from './routes/dynamic';

const app = express();
app.use(json());

app.use('/api/auth', authRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/c', dynamicRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Server is running on port ${PORT}`);
});
