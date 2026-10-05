import { apiClient } from './apiClient';

// Used by: NotificationScreen (Notification tab) + the bell icon on the dashboard
//
// How the screen's fields map to the backend:
//   item.id     <- notification_id
//   item.kind   <- category   ('Application' -> 'application', 'System' -> 'system')
//   item.title  <- title
//   item.body   <- message
//   item.time   <- created_at (format "2 hours ago" in the screen)
//   item.read   <- is_read
//   item.icon   <- chosen in the screen from category (DB has no icon)
//   related_ref <- application reference (BRT-000012 ...) if the notification is about one

export type NotificationFilter = 'All' | 'Unread' | 'Applications' | 'System';

export interface NotificationItem {
  notification_id: number;
  category: 'Application' | 'System' | string;
  title: string;
  message: string;
  related_ref: string | null;
  is_read: boolean;
  created_at: string;
}

// ── LIST (filter chips: All / Unread / Applications / System) ──────────────
// GET /api/notification/List?filter=All|Unread|Applications|System      latest 100
export const getNotifications = (filter: NotificationFilter = 'All') =>
  apiClient.get<NotificationItem[]>('/api/notification/List', { filter });

// ── UNREAD COUNT (red badge on the bell / "Unread" chip) ───────────────────
// GET /api/notification/UnreadCount        returns { unread }
export const getUnreadCount = () => apiClient.get<{ unread: number }>('/api/notification/UnreadCount');

// ── MARK ONE AS READ (tap, or swipe right) ─────────────────────────────────
// POST /api/notification/MarkRead          body: { notification_id }
export const markNotificationRead = (notificationId: number) =>
  apiClient.post<{ notification_id: number }>('/api/notification/MarkRead', { notification_id: notificationId });

// ── MARK ALL AS READ ("Mark all as read") ──────────────────────────────────
// POST /api/notification/MarkAllRead       returns { updated }
export const markAllNotificationsRead = () => apiClient.post<{ updated: number }>('/api/notification/MarkAllRead');

// ── DELETE (swipe left) ────────────────────────────────────────────────────
// POST /api/notification/Delete            body: { notification_id }
export const deleteNotification = (notificationId: number) =>
  apiClient.post<{ notification_id: number }>('/api/notification/Delete', { notification_id: notificationId });