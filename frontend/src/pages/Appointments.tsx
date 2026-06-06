import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, X, Check, Trash2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { citasApi, Cita, Professional } from '../api/citas';
import { useAuthStore } from '../store/authStore';

interface TimeSlot { time: string; available: boolean; }

const statusColors: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  CANCELADA:  'bg-red-100 text-red-800 border-red-200',
  COMPLETADA: 'bg-blue-100 text-blue-800 border-blue-200',
};
const statusLabels: Record<string, string> = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada', COMPLETADA: 'Completada',
};
const TIPOS = [
  'Consulta General', 'Ansiedad', 'Depresión', 'Estrés académico',
  'Orientación vocacional', 'Crisis emocional',
];

const buildSlotsFromApi = (rawSlots: string[]): TimeSlot[] =>
  rawSlots.map(t => ({ time: t, available: true }));

const getFallbackSlots = (date: string): TimeSlot[] => {
  const day = new Date(date).getDay();
  if (day === 0 || day === 6) return [];
  const morning   = ['08:00','08:30','09:00','09:30','10:00','10:30'];
  const afternoon = ['14:00','14:30','15:00','15:30','16:00','16:30'];
  return [...morning, ...afternoon].map(t => ({ time: t, available: true }));
};

const formatPhone = (value: string): string => {
  let cleaned = value.replace(/[^\d+\s]/g, '');
  if (!cleaned.startsWith('+57')) cleaned = '+57 ' + cleaned.replace(/\+57\s?/, '');
  return cleaned;
};
const validatePhone = (phone: string): boolean =>
  /^\+57\s?\d{10}$/.test(phone.replace(/\s/g, '').replace('+57', '+57 '));

const Appointments: React.FC = () => {
  const { user } = useAuthStore();
  const [citas, setCitas]                     = useState<Cita[]>([]);
  const [professionals, setProfessionals]     = useState<Professional[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [showForm, setShowForm]               = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState('');
  const [filter, setFilter]                   = useState('all');
  const [availableSlots, setAvailableSlots]   = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots]       = useState(false);

  // Cancel / reschedule
  const [cancelModalOpen, setCancelModalOpen]     = useState(false);
  const [citaToCancel, setCitaToCancel]           = useState<Cita | null>(null);
  const [cancelling, setCancelling]               = useState(false);
  const [showReschedule, setShowReschedule]       = useState(false);
  const [rescheduleDate, setRescheduleDate]       = useState('');
  const [rescheduleTime, setRescheduleTime]       = useState('');
  const [rescheduleSlots, setRescheduleSlots]     = useState<TimeSlot[]>([]);
  const [loadingReschedule, setLoadingReschedule] = useState(false);
  const [rescheduling, setRescheduling]           = useState(false);

  const [form, setForm] = useState({
    professionalId: '',
    date: '',
    time: '',
    type: 'Consulta General',
    mode: 'Presencial' as 'Presencial' | 'Virtual',
    notes: '',
    phone: '+57 ',
  });

  const load = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([citasApi.getAll(), citasApi.getProfessionals()]);
    setCitas(c);
    setProfessionals(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!form.professionalId || !form.date) { setAvailableSlots([]); return; }
    setLoadingSlots(true);
    citasApi.getAvailableSlots(parseInt(form.professionalId), form.date)
      .then(raw => {
        const slots = raw.length > 0 ? buildSlotsFromApi(raw) : getFallbackSlots(form.date);
        setAvailableSlots(slots);
        if (form.time && !slots.find(s => s.time === form.time && s.available))
          setForm(f => ({ ...f, time: '' }));
      })
      .catch(() => setAvailableSlots(getFallbackSlots(form.date)))
      .finally(() => setLoadingSlots(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.professionalId, form.date]);

  const handleSubmit = async () => {
    if (!form.professionalId || !form.date || !form.time) {
      setError('Profesional, fecha y hora son obligatorios'); return;
    }
    if (!validatePhone(form.phone)) {
      setError('Ingresa un número válido (+57 seguido de 10 dígitos)'); return;
    }
    setSubmitting(true); setError('');
    try {
      const isoDate = new Date(`${form.date}T${form.time}:00`).toISOString();
      await citasApi.create({
        professionalId: parseInt(form.professionalId),
        date: isoDate,
        type: form.type,
        mode: form.mode,
        notes: form.notes || undefined,
        studentPhone: form.phone.replace(/\s/g, ''),
      });
      setShowForm(false);
      setForm({ professionalId: '', date: '', time: '', type: 'Consulta General', mode: 'Presencial', notes: '', phone: '+57 ' });
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al crear la cita');
    } finally { setSubmitting(false); }
  };

  const handleCancelClick = (cita: Cita) => {
    setCitaToCancel(cita);
    setShowReschedule(false);
    setRescheduleDate('');
    setRescheduleTime('');
    setError('');
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!citaToCancel) return;
    setCancelling(true);
    try {
      await citasApi.update(citaToCancel.id, { status: 'CANCELADA' });
      setCancelModalOpen(false);
      setCitaToCancel(null);
      await load();
    } finally { setCancelling(false); }
  };

  const handleRescheduleLoad = async (date: string) => {
    setRescheduleDate(date);
    setRescheduleTime('');
    if (!citaToCancel || !date) return;
    setLoadingReschedule(true);
    try {
      const raw = await citasApi.getAvailableSlots(citaToCancel.professional.id, date);
      setRescheduleSlots(raw.length > 0 ? buildSlotsFromApi(raw) : getFallbackSlots(date));
    } catch {
      setRescheduleSlots(getFallbackSlots(date));
    } finally { setLoadingReschedule(false); }
  };

  const handleRescheduleConfirm = async () => {
    if (!citaToCancel || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      const isoDate = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();
      await citasApi.update(citaToCancel.id, { date: isoDate });
      setCancelModalOpen(false);
      setCitaToCancel(null);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al reagendar');
    } finally { setRescheduling(false); }
  };

  const handleConfirm = async (id: number) => { await citasApi.update(id, { status: 'CONFIRMADA' }); await load(); };
  const handleDelete  = async (id: number) => { await citasApi.delete(id); await load(); };

  const filtered = filter === 'all' ? citas : citas.filter(c => c.status === filter);
  const isStudent = user?.role === 'USER';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface">Mis Citas</h1>
          <p className="text-on-surface-variant mt-1">Gestiona tus sesiones de apoyo psicológico.</p>
        </div>
        {user?.role !== 'PSYCHOLOGIST' && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-colors">
            <Plus size={20} /> Nueva cita
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors
              ${filter === f ? 'bg-primary text-white border-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
            {f === 'all' ? 'Todas' : statusLabels[f]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">No hay citas {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : 'registradas'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => (
            <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-lg text-on-surface">{c.type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${statusColors[c.status]}`}>
                      {statusLabels[c.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-on-surface-variant flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(c.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(c.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-outline">
                    {user?.role === 'PSYCHOLOGIST' ? `Estudiante: ${c.student.name}` : `Profesional: ${c.professional.name}`}
                    {' · '}{c.mode}
                  </p>
                  {!isStudent && c.location && (
                    <p className="text-sm text-on-surface-variant">
                      {c.mode === 'Virtual' ? '🔗 Link: ' : '📍 Consultorio: '}{c.location}
                    </p>
                  )}
                  {isStudent && (
                    <p className="text-xs text-outline italic">
                      El lugar o enlace de reunión será informado por tu psicólogo/a.
                    </p>
                  )}
                  {c.notes && <p className="text-sm text-on-surface-variant italic">"{c.notes}"</p>}
                </div>
                <div className="flex gap-2">
                  {c.status === 'PENDIENTE' && user?.role === 'PSYCHOLOGIST' && (
                    <button onClick={() => handleConfirm(c.id)}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Confirmar">
                      <Check size={18} />
                    </button>
                  )}
                  {['PENDIENTE', 'CONFIRMADA'].includes(c.status) && (
                    <button onClick={() => handleCancelClick(c)}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors" title="Cancelar / Reagendar">
                      <X size={18} />
                    </button>
                  )}
                  {(user?.role === 'ADMIN' || (c.status === 'CANCELADA' && user?.id === c.student.id)) && (
                    <button onClick={() => handleDelete(c.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modal nueva cita ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-on-surface">Nueva Cita</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-container rounded-lg"><X size={20} /></button>
              </div>

              {error && <p className="text-sm text-error font-bold bg-error/10 px-4 py-2 rounded-lg">{error}</p>}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-1">
                    <Phone size={14} className="inline mr-1" />
                    Número de teléfono (WhatsApp) *
                  </label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                    placeholder="+57 3001234567"
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  <p className="text-xs text-on-surface-variant mt-1">Recibirás confirmación de tu cita por WhatsApp</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-1">Profesional *</label>
                  <select value={form.professionalId}
                    onChange={e => setForm(f => ({ ...f, professionalId: e.target.value, time: '' }))}
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="">Seleccionar profesional...</option>
                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-1">Fecha *</label>
                  <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value, time: '' }))}
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-1">Horario disponible *</label>
                  {!form.professionalId || !form.date ? (
                    <p className="text-sm text-on-surface-variant bg-surface-container rounded-lg px-4 py-3">
                      Selecciona un profesional y fecha para ver los horarios disponibles
                    </p>
                  ) : loadingSlots ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-surface-container rounded-lg">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-on-surface-variant">Cargando horarios...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3">
                      No hay horarios disponibles para esta fecha. Intenta con otro día.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(slot => (
                        <button key={slot.time} type="button" disabled={!slot.available}
                          onClick={() => setForm(f => ({ ...f, time: slot.time }))}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${form.time === slot.time
                              ? 'bg-primary text-white'
                              : slot.available
                                ? 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                                : 'bg-surface-container-high text-outline line-through cursor-not-allowed'}`}>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-1">Tipo de consulta</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-1">Modalidad</label>
                  <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value as 'Presencial' | 'Virtual' }))}
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-on-surface-variant block mb-1">Notas adicionales</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Describe brevemente lo que quieres tratar..."
                    className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-outline-variant rounded-xl font-bold text-on-surface-variant hover:bg-surface-container">
                  Cancelar
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-60">
                  {submitting ? 'Agendando...' : 'Agendar cita'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal cancelar / reagendar ───────────────────────────────────────── */}
      <AnimatePresence>
        {cancelModalOpen && citaToCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-on-surface">¿Qué deseas hacer?</h3>
                  <p className="text-sm text-outline mt-1">
                    {citaToCancel.type} · {new Date(citaToCancel.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button onClick={() => setCancelModalOpen(false)} className="p-1 text-outline hover:text-on-surface">
                  <X size={20} />
                </button>
              </div>

              {!showReschedule ? (
                <div className="space-y-3">
                  <button onClick={() => setShowReschedule(true)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all text-left">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">Reagendar para otra fecha</p>
                      <p className="text-xs text-outline mt-0.5">Cambia la fecha y hora de tu cita</p>
                    </div>
                  </button>

                  <button onClick={handleCancelConfirm} disabled={cancelling}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-red-100 hover:border-red-300 hover:bg-red-50 transition-all text-left disabled:opacity-60">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <X size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-red-700 text-sm">{cancelling ? 'Cancelando...' : 'Cancelar la cita'}</p>
                      <p className="text-xs text-red-400 mt-0.5">Esta acción no se puede deshacer</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setShowReschedule(false)} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                    ← Volver
                  </button>

                  <div>
                    <label className="text-sm font-bold text-on-surface-variant block mb-1">Nueva fecha *</label>
                    <input type="date" value={rescheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => handleRescheduleLoad(e.target.value)}
                      className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>

                  {rescheduleDate && (
                    <div>
                      <label className="text-sm font-bold text-on-surface-variant block mb-1">Nuevo horario *</label>
                      {loadingReschedule ? (
                        <div className="flex items-center gap-2 px-4 py-3 bg-surface-container rounded-lg">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-on-surface-variant">Cargando horarios...</span>
                        </div>
                      ) : rescheduleSlots.length === 0 ? (
                        <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3">
                          No hay horarios disponibles. Intenta con otro día.
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {rescheduleSlots.map(slot => (
                            <button key={slot.time} type="button"
                              onClick={() => setRescheduleTime(slot.time)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                ${rescheduleTime === slot.time
                                  ? 'bg-primary text-white'
                                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}>
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {error && <p className="text-sm text-error font-bold bg-error/10 px-3 py-2 rounded-lg">{error}</p>}

                  <button onClick={handleRescheduleConfirm}
                    disabled={!rescheduleDate || !rescheduleTime || rescheduling}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    {rescheduling ? 'Reagendando...' : 'Confirmar nueva fecha'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;
