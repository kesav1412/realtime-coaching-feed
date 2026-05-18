export interface FeedItem {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export interface CreateFeedItemDTO {
  title: string;
  content: string;
  author: string;
}
