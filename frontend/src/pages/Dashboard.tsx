import React, { useEffect, useState } from 'react';
import {
  Calendar, Clock, ArrowRight, Brain, Heart, Sparkles,
  CheckCircle, FileText, Phone, Users,
  ShieldCheck, BarChart3, AlertTriangle, TrendingUp,
  ChevronRight, Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { citasApi, Cita } from '../api/citas';
import api from '../api/axios';

const statusColors: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  CANCELADA:  'bg-red-100 text-red-800 border-red-200',
  COMPLETADA: 'bg-blue-100 text-blue-800 border-blue-200',
};
const statusLabels: Record<string, string> = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada', COMPLETADA: 'Completada',
};

const wellnessTips = [
  { icon: Brain,    title: 'Respiración consciente', description: '5 minutos de respiración profunda reducen la ansiedad significativamente.' },
  { icon: Heart,    title: 'Autocuidado diario',      description: 'Reserva tiempo para actividades que disfrutes y te recarguen.' },
  { icon: Sparkles, title: 'Metas pequeñas',          description: 'Divide tus objetivos en pasos manejables. Cada logro cuenta.' },
];

// ─── Vista del ADMIN ─────────────────────────────────────────────────────────
const AdminDashboard = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [stats, setStats]     = useState<any>(null);
  const [citas, setCitas]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').then(r => r.data).catch(() => null),
      api.get('/admin/citas?limit=5').then(r => r.data).catch(() => ({ data: [] })),
    ]).then(([s, c]) => {
      setStats(s);
      setCitas(c?.data ?? []);
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Estudiantes',  value: stats?.totalUsers ?? 0,       color: 'bg-blue-50 text-blue-600',     icon: Users },
    { label: 'Total citas',  value: stats?.totalCitas ?? 0,       color: 'bg-purple-50 text-purple-600', icon: Calendar },
    { label: 'Completadas',  value: stats?.citasCompletadas ?? 0, color: 'bg-green-50 text-green-600',   icon: CheckCircle },
    { label: 'Pendientes',   value: stats?.citasPendientes ?? 0,  color: 'bg-yellow-50 text-yellow-600', icon: Clock },
    { label: 'Este mes',     value: stats?.citasThisMonth ?? 0,   color: 'bg-indigo-50 text-indigo-600', icon: TrendingUp },
    { label: 'Alertas SOS',  value: stats?.sosAlerts ?? 0,        color: 'bg-red-50 text-red-600',       icon: AlertTriangle },
  ];

  const quickActions = [
    { label: 'Usuarios',        desc: 'Gestionar roles y cuentas', icon: Users,     path: '/admin',         color: 'bg-blue-500' },
    { label: 'Todas las citas', desc: 'Ver y filtrar citas',       icon: Calendar,  path: '/appointments',  color: 'bg-purple-500' },
    { label: 'Reportes',        desc: 'Actividad de psicólogos',   icon: BarChart3, path: '/admin',         color: 'bg-indigo-500' },
    { label: 'Notificaciones',  desc: 'Ver alertas del sistema',   icon: Bell,      path: '/notifications', color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Panel Administrativo</span>
        </div>
        <h1 className="text-3xl font-display font-black text-on-surface">
          {greeting}, {user?.name?.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-on-surface-variant mt-1">Aquí tienes un resumen del estado actual de la plataforma.</p>
      </motion.div>

      <div>
        <h2 className="font-display font-bold text-on-surface mb-3 text-sm uppercase tracking-wide text-outline">Estadísticas generales</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-on-surface">{s.value}</p>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-on-surface mb-3 text-sm uppercase tracking-wide text-outline">Accesos rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <motion.button key={a.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
              onClick={() => navigate(a.path)}
              className="flex flex-col items-start p-4 rounded-2xl text-white hover:opacity-90 transition-opacity text-left shadow-sm"
              style={{ background: `var(--color-${a.color.replace('bg-', '')}, #6366f1)` }}
            >
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <a.icon size={20} className="text-white" />
              </div>
              <p className="font-bold text-sm">{a.label}</p>
              <p className="text-xs opacity-75 mt-0.5">{a.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <h3 className="font-display font-bold text-on-surface">Citas recientes</h3>
          <button onClick={() => navigate('/appointments')}
            className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        {citas.length === 0 ? (
          <p className="text-center text-on-surface-variant py-10 text-sm">No hay citas registradas.</p>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {citas.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {c.student?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{c.student?.name}</p>
                  <p className="text-xs text-outline truncate">
                    {c.type} · {c.professional?.name} · {new Date(c.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold border shrink-0 ${statusColors[c.status]}`}>
                  {statusLabels[c.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Vista del ESTUDIANTE ────────────────────────────────────────────────────
const StudentDashboard = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [nextCita, setNextCita] = useState<Cita | null>(null);
  const [stats, setStats]       = useState({ completadas: 0, proximas: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      citasApi.getNext().catch(() => null),
      citasApi.getAll().catch(() => []),
    ]).then(([next, all]) => {
      setNextCita(next as Cita | null);
      const allCitas = all as Cita[];
      setStats({
        completadas: allCitas.filter(c => c.status === 'COMPLETADA').length,
        proximas:    allCitas.filter(c => c.status === 'PENDIENTE' || c.status === 'CONFIRMADA').length,
      });
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-black text-on-surface">
          {greeting}, {user?.name?.split(' ')[0] ?? 'Usuario'} 👋
        </h1>
        <p className="text-on-surface-variant mt-1">Tu bienestar mental es lo más importante.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {nextCita ? (
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-sm opacity-75 font-medium">Tu próxima cita</p>
            <h2 className="text-xl font-bold mt-1">{nextCita.type}</h2>
            <p className="text-sm opacity-75 mt-0.5">con {nextCita.professional.name}</p>
            <div className="flex items-center gap-5 mt-4 flex-wrap text-sm">
              <span className="flex items-center gap-1.5 opacity-90">
                <Calendar size={15} />
                {new Date(nextCita.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <span className="flex items-center gap-1.5 opacity-90">
                <Clock size={15} />
                {new Date(nextCita.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button onClick={() => navigate('/appointments')}
              className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              Ver mis citas <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-on-surface">No tienes citas próximas</p>
              <p className="text-sm text-on-surface-variant mt-1">Agenda una sesión con un psicólogo ahora.</p>
            </div>
            <button onClick={() => navigate('/appointments')}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90">
              Agendar <ArrowRight size={16} />
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface">{stats.completadas}</p>
            <p className="text-xs text-on-surface-variant">Sesiones completadas</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface">{stats.proximas}</p>
            <p className="text-xs text-on-surface-variant">Citas programadas</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/appointments')}
          className="bg-primary text-white rounded-2xl p-5 hover:bg-primary/90 transition-colors text-left">
          <Calendar size={22} className="mb-3" />
          <p className="font-bold text-sm">Agendar cita</p>
          <p className="text-xs opacity-75 mt-1">Con un profesional disponible</p>
        </button>
        <button onClick={() => navigate('/urgent-help')}
          className="bg-red-500 text-white rounded-2xl p-5 hover:bg-red-600 transition-colors text-left">
          <Phone size={22} className="mb-3" />
          <p className="font-bold text-sm">Ayuda urgente</p>
          <p className="text-xs opacity-75 mt-1">Recursos de crisis inmediatos</p>
        </button>
      </div>

      <div>
        <h2 className="font-display font-bold text-on-surface mb-3">Consejos de bienestar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {wellnessTips.map((tip, i) => (
            <motion.div key={tip.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
              className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <tip.icon size={18} className="text-primary" />
              </div>
              <p className="font-bold text-on-surface text-sm">{tip.title}</p>
              <p className="text-xs text-on-surface-variant mt-1">{tip.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Vista del PSICÓLOGO ─────────────────────────────────────────────────────
const PsychologistDashboard = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [citas, setCitas]                     = useState<Cita[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCita, setSelectedCita]       = useState<Cita | null>(null);
  const [psychNotes, setPsychNotes]           = useState('');
  const [saving, setSaving]                   = useState(false);
  const [saved, setSaved]                     = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);

  useEffect(() => {
    citasApi.getAll().then(data => {
      setCitas((data as Cita[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pendientes  = citas.filter(c => c.status === 'PENDIENTE' || c.status === 'CONFIRMADA');
  const completadas = citas.filter(c => c.status === 'COMPLETADA');

  const handleSelectCita = (c: Cita) => {
    setSelectedCita(c);
    setPsychNotes((c as any).psychNotes ?? '');
    setSaved(false);
    setConfirmComplete(false);
  };

  const handleMarkComplete = async (cita: Cita) => {
    setSaving(true);
    await citasApi.update(cita.id, { status: 'COMPLETADA', psychNotes }).catch(() => {});
    setCitas(prev => prev.map(c => c.id === cita.id ? { ...c, status: 'COMPLETADA', psychNotes } as any : c));
    setSaved(true);
    setSaving(false);
    setTimeout(() => { setSelectedCita(null); setSaved(false); setConfirmComplete(false); }, 1200);
  };

  const handleSaveNotes = async (cita: Cita) => {
    setSaving(true);
    await citasApi.update(cita.id, { psychNotes }).catch(() => {});
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-black text-on-surface">
          Bienvenido/a, {user?.name?.split(' ')[0] ?? 'Psicólogo/a'} 👋
        </h1>
        <p className="text-on-surface-variant mt-1">Gestiona tus citas y observaciones clínicas.</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Citas hoy',   value: citas.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length, color: 'bg-primary/10 text-primary',       icon: Calendar },
          { label: 'Pendientes',  value: pendientes.length,  color: 'bg-yellow-100 text-yellow-600', icon: Clock },
          { label: 'Completadas', value: completadas.length, color: 'bg-green-100 text-green-600',   icon: CheckCircle },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <h3 className="font-display font-bold text-on-surface">Citas pendientes</h3>
          <button onClick={() => navigate('/agenda')} className="text-sm text-primary font-bold hover:underline">Ver agenda</button>
        </div>
        {pendientes.length === 0 ? (
          <p className="text-center text-on-surface-variant py-10 text-sm">No tienes citas pendientes.</p>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {pendientes.slice(0, 6).map(c => (
              <button key={c.id} onClick={() => handleSelectCita(c)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-container/40 transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {c.student?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{c.student?.name}</p>
                  <p className="text-xs text-outline">{c.type} · {new Date(c.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} {new Date(c.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold border shrink-0 ${statusColors[c.status]}`}>
                  {statusLabels[c.status]}
                </span>
                <FileText size={16} className="text-outline shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {completadas.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
            <h3 className="font-display font-bold text-on-surface flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" /> Citas completadas
            </h3>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {completadas.slice(0, 4).map(c => (
              <button key={c.id} onClick={() => handleSelectCita(c)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-container/40 transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                  {c.student?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{c.student?.name}</p>
                  <p className="text-xs text-outline">{c.type} · {new Date(c.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                {(c as any).psychNotes ? (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold shrink-0">Con notas</span>
                ) : (
                  <span className="text-xs text-outline shrink-0">Sin notas</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de cita */}
      <AnimatePresence>
        {selectedCita && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl space-y-4 p-6">

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-on-surface">{selectedCita.student?.name}</h3>
                  <p className="text-sm text-outline">
                    {selectedCita.type} · {new Date(selectedCita.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })} a las {new Date(selectedCita.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedCita(null); setConfirmComplete(false); }}
                  className="text-outline hover:text-on-surface p-1">✕
                </button>
              </div>

              {selectedCita.notes && (
                <div className="bg-surface-container rounded-xl p-3">
                  <p className="text-xs font-bold text-on-surface-variant mb-1">Notas del estudiante</p>
                  <p className="text-sm text-on-surface">{selectedCita.notes}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-2 block">
                  Observaciones clínicas (solo visibles para ti)
                </label>
                <textarea
                  value={psychNotes}
                  onChange={e => setPsychNotes(e.target.value)}
                  rows={4}
                  placeholder="Escribe tus observaciones, diagnóstico, plan de tratamiento..."
                  className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3">
                {saved ? (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-700 font-bold text-sm">
                    <CheckCircle size={16} /> Guardado
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleSaveNotes(selectedCita)}
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
                      {saving ? 'Guardando...' : 'Guardar notas'}
                    </button>

                    {(selectedCita.status === 'PENDIENTE' || selectedCita.status === 'CONFIRMADA') && (
                      !confirmComplete ? (
                        <button
                          onClick={() => setConfirmComplete(true)}
                          disabled={saving}
                          className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          <CheckCircle size={16} />
                          Marcar completada
                        </button>
                      ) : (
                        <div className="flex-1 flex flex-col gap-2">
                          <p className="text-xs text-center text-on-surface-variant font-medium">
                            ¿Confirmas que la sesión fue completada?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmComplete(false)}
                              className="flex-1 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                              Cancelar
                            </button>
                            <button
                              onClick={() => { setConfirmComplete(false); handleMarkComplete(selectedCita); }}
                              disabled={saving}
                              className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                              <CheckCircle size={14} />
                              {saving ? 'Guardando...' : 'Sí, completada'}
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Dashboard principal ─────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role === 'ADMIN')        return <AdminDashboard user={user} />;
  if (user.role === 'PSYCHOLOGIST') return <PsychologistDashboard user={user} />;
  return <StudentDashboard user={user} />;
};

export default Dashboard;