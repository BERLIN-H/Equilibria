import api from './axios';

export interface AdminStats {
  totalUsers: number;
  totalCitas: number;
  citasCompletadas: number;
  citasPendientes: number;
  citasThisMonth: number;
  sosAlerts: number;
}

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats').then(r => r.data),
  getUsers: (params?: Record<string, string>) =>
    api.get('/admin/users', { params }).then(r => r.data),
  getAllCitas: (params?: Record<string, string>) =>
    api.get('/admin/citas', { params }).then(r => r.data),
  getPsychologistReport: () =>
    api.get('/admin/reports/psychologists').then(r => r.data),
  getCancellationReport: () =>
    api.get('/admin/reports/cancellations').then(r => r.data),
  updateUser: (id: number, data: any) =>
    api.patch(`/admin/users/${id}`, data).then(r => r.data),
  deleteUser: (id: number) =>
    api.delete(`/admin/users/${id}`),
};
