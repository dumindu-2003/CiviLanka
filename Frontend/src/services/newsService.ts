import { apiClient } from './apiClient';

// Used by: NewsScreen (News tab).   Everyone can read published news; create / edit / publish = administrator only.
//
// How the screen's fields map to the backend:
//   Bulletin.tag        <- category       ('Bulletin', 'Gazette', 'Circular', ...)
//   Bulletin.title      <- title
//   Bulletin.body       <- summary
//   Bulletin.time       <- published_at   (format "Yesterday", "3 days ago" in the screen)
//   FEATURED card       <- the first item with is_important = true
//   Bulletin.refLabel   <- NOT in the DB (no reference-number column) - add it to the news table if needed

export interface NewsItem {
  news_id: number;
  title: string;
  summary: string | null;
  category: string;
  is_important: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}
export interface NewsDetail extends NewsItem {
  content: string;
}
export interface NewsInput {
  title: string;
  content: string;
  summary?: string;
  category?: string; // default 'Bulletin'
  is_important?: boolean;
}

// ── LIST ───────────────────────────────────────────────────────────────────
// GET /api/news/List                          published news only (important first, then newest)
// GET /api/news/List?include_unpublished=true admin only
export const getNewsList = (includeUnpublished = false) =>
  apiClient.get<NewsItem[]>('/api/news/List', includeUnpublished ? { include_unpublished: true } : {});

// ── ONE NEWS (opens when a card is tapped) ─────────────────────────────────
// GET /api/news/Get?news_id=1
export const getNewsById = (newsId: number) => apiClient.get<NewsDetail>('/api/news/Get', { news_id: newsId });

// ── ADMIN: CREATE / EDIT ───────────────────────────────────────────────────
// POST /api/news/Create        body: { title, content, summary?, category?, is_important?, publish }
export const createNews = (input: NewsInput, publish = false) =>
  apiClient.post<{ news_id: number }>('/api/news/Create', { ...input, publish });

// POST /api/news/Update        body: { news_id, ...fields to change }
export const updateNews = (newsId: number, input: Partial<NewsInput>) =>
  apiClient.post<{ news_id: number }>('/api/news/Update', { news_id: newsId, ...input });

// ── ADMIN: PUBLISH / UNPUBLISH / DELETE ────────────────────────────────────
// POST /api/news/Publish       body: { news_id }
export const publishNews = (newsId: number) => apiClient.post<{ news_id: number }>('/api/news/Publish', { news_id: newsId });

// POST /api/news/Unpublish     body: { news_id }
export const unpublishNews = (newsId: number) =>
  apiClient.post<{ news_id: number }>('/api/news/Unpublish', { news_id: newsId });

// POST /api/news/Delete        body: { news_id }
export const deleteNews = (newsId: number) => apiClient.post<{ news_id: number }>('/api/news/Delete', { news_id: newsId });