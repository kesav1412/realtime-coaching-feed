import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { redisClient } from '../cache/redis';
import { FeedItem, CreateFeedItemDTO } from '../types/feed';

const router = Router();

const CACHE_KEY = 'feed:all';
const CACHE_TTL = 30; // seconds

// ── GET /feed ─────────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    // 1. Check cache
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      return res.json({ data: JSON.parse(cached), cached: true });
    }

    // 2. Query DB
    const result = await pool.query<FeedItem>(
      'SELECT * FROM feed_items ORDER BY created_at DESC'
    );

    // 3. Populate cache
    await redisClient.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(result.rows));

    return res.json({ data: result.rows, cached: false });
  } catch (err) {
    console.error('[GET /feed]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /feed ────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const { title, content, author } = req.body as CreateFeedItemDTO;

  if (!title?.trim() || !content?.trim() || !author?.trim()) {
    return res.status(400).json({ error: 'title, content, and author are required' });
  }

  try {
    // 1. Persist
    const result = await pool.query<FeedItem>(
      'INSERT INTO feed_items (title, content, author) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), content.trim(), author.trim()]
    );
    const newItem = result.rows[0];

    // 2. Invalidate cache
    await redisClient.del(CACHE_KEY);

    // 3. Broadcast via Socket.IO (deduplication: include item id as event id)
    const io = (req as any).io;
    io.emit('new_feed', newItem);

    return res.status(201).json({ data: newItem });
  } catch (err) {
    console.error('[POST /feed]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
