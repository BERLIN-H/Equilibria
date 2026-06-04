import api from './axios';

export interface Cita {
  id: number;
  date: string;
  type: string;
  mode: string;
  location?: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
  notes?: string;
  psychNotes?: string;
  studentPhone?: string;
  student: { id: number; name: string; email: string; faculty?: string; semester?: number };
  professional: { id: number; name: string; email: string };
}

export interface Professional {
  id: number;
  name: string;
  email: string;
}

export interface SlotConfig {
  id: number;
  professionalId: number;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  durationMin: number;
  active: boolean;
}

export const citasApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<Cita[]>('/citas', { params }).then(r => r.data),

  getNext: () =>
    api.get<Cita | null>('/citas/next').then(r => r.data),

  getProfessionals: () =>
    api.get<Professional[]>('/citas/professionals').then(r => r.data),

  /** Horarios libres "HH:mm" para un profesional en una fecha */
  getAvailableSlots: (professionalId: number, date: string) =>
    api.get<string[]>('/citas/slots/available', { params: { professionalId, date } }).then(r => r.data),

  /** Config de slots del psicólogo/admin autenticado */
  getSlotConfig: () =>
    api.get<SlotConfig[]>('/citas/slots/config').then(r => r.data),

  /** Crear bloque de disponibilidad */
  createSlot: (data: { dayOfWeek: number; startHour: number; endHour: number; durationMin?: number }) =>
    api.post<SlotConfig>('/citas/slots/config', data).then(r => r.data),

  /** Eliminar bloque */
  deleteSlot: (id: number) =>
    api.delete(`/citas/slots/config/${id}`),

  create: (data: {
    professionalId: number;
    date: string;
    type?: string;
    mode?: string;
    notes?: string;
    studentPhone: string;
  }) => api.post<Cita>('/citas', data).then(r => r.data),

  update: (id: number, data: Partial<Cita & { status: string }>) =>
    api.patch<Cita>(`/citas/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/citas/${id}`),
};
