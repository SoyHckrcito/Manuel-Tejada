import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { apiRouter } from './src/server/api.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cookieParser());
app.use('/api', apiRouter);

// Serve static frontend build
app.use(express.static(path.resolve(process.cwd(), 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Manuel Tejada official applet listening on http://0.0.0.0:${PORT}`);
});
