import api from './axios';

export const getPatients = () =>
  api.get('/patients').then(r => r.data);

export const getPatientById = (id: number) =>
  api.get(`/patients/${id}`).then(r => r.data);

export const updatePsychNotes = (citaId: number, psychNotes: string) =>
  api.patch(`/citas/${citaId}`, { psychNotes }).then(r => r.data);