import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { pool } from './db/pool';
import { redisClient } from './cache/redis';
import feedRouter from './routes/feed';
import { attachSocketIO } from './socket';

const app = express();
const httpServer = http.createServer(app);

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

attachSocketIO(io);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Attach io to every request so routes can emit events
app.use((req, _res, next) => {
  (req as any).io = io;
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/feed', feedRouter);

// ── Boot ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000;

async function bootstrap() {
  try {
    // Verify DB connection
    await pool.query('SELECT 1');
    console.log('[DB] PostgreSQL connected');

    // Verify Redis connection
    await redisClient.ping();
    console.log('[Redis] connected');

    httpServer.listen(PORT, () => {
      console.log(`[Server] listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Boot] failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
