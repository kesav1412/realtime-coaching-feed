'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FormState {
  title: string;
  content: string;
  author: string;
}

export default function AdminPage() {
  const [form, setForm] = useState<FormState>({ title: '', content: '', author: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      setSuccess('Feed item published! It will appear on the home page instantly.');
      setForm({ title: '', content: '', author: '' });
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin — Add Feed</h1>
        <a href="/" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">
          ← Back to Feed
        </a>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Session recap: Sprint planning"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            required
            value={form.content}
            onChange={handleChange}
            placeholder="Share coaching notes, highlights, or actions…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="author">
            Author
          </label>
          <input
            id="author"
            name="author"
            type="text"
            required
            value={form.author}
            onChange={handleChange}
            placeholder="Coach Name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {submitting ? 'Publishing…' : 'Publish Feed Item'}
        </button>
      </form>
    </main>
  );
}
