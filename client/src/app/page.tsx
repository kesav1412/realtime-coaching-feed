'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { FeedItem } from '@/types/feed';
import FeedCard from '@/components/FeedCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function HomePage() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track IDs we've already shown to prevent duplicate socket events
  const seenIds = useRef<Set<number>>(new Set());

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/feed`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items: FeedItem[] = json.data;
        items.forEach((i) => seenIds.current.add(i.id));
        setFeeds(items);
      } catch (e: any) {
        setError(e.message || 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, []);

  // ── Realtime updates ───────────────────────────────────────────────────────
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewFeed = (item: FeedItem) => {
      // Deduplicate: ignore if we've already rendered this id
      if (seenIds.current.has(item.id)) return;
      seenIds.current.add(item.id);
      setFeeds((prev) => [item, ...prev]);
      // Acknowledge receipt
      socket.emit('feed_ack', item.id);
    };

    socket.on('new_feed', handleNewFeed);
    return () => { socket.off('new_feed', handleNewFeed); };
  }, [socket]);

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Coaching Feed</h1>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-5 shadow-sm h-24" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {!loading && !error && feeds.length === 0 && (
        <p className="text-gray-500 text-center mt-20">
          No feed items yet. Visit the{' '}
          <a href="/admin" className="text-indigo-600 underline">Admin page</a> to add one.
        </p>
      )}

      <div className="space-y-4">
        {feeds.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
