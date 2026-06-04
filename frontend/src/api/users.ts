import api from './axios';

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  role: string;
  phone?: string;
  address?: string;
  faculty?: string;
  semester?: number;
  studentCode?: string;
  program?: string;
  preferredContact?: string;
  preferredSchedule?: string;
  remindersEnabled?: boolean;
  createdAt: string;
  assignedPsychologist?: { id: number; name: string; email: string };
  currentStatus?: string;
}

export const usersApi = {
  getMe:     ()                    => api.get<UserProfile>('/users/me').then(r => r.data),
  updateMe:  (data: Partial<UserProfile>) => api.patch<UserProfile>('/users/me', data).then(r => r.data),
};
