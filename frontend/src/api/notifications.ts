import api from './axios';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications').then(r => r.data),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count').then(r => r.data),
  markAllRead: () => api.patch('/notifications/read-all'),
  markOneRead: (id: number) => api.patch(`/notifications/${id}/read`),
};
