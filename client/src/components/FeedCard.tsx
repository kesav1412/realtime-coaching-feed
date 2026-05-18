import { FeedItem } from '@/types/feed';

interface FeedCardProps {
  item: FeedItem;
}

export default function FeedCard({ item }: FeedCardProps) {
  const date = new Date(item.created_at).toLocaleString();

  return (
    <article className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h2>
      <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-medium text-indigo-600">{item.author}</span>
        <time dateTime={item.created_at}>{date}</time>
      </div>
    </article>
  );
}
