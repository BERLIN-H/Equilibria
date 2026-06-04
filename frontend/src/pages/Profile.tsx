import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, BookOpen, GraduationCap, Hash,
  Save, Calendar, Clock, Bell, MessageSquare, Shield, Camera,
} from 'lucide-react';
import { usersApi, UserProfile } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { citasApi, Cita } from '../api/citas';

const roleLabels: Record<string, string> = {
  USER: 'Estudiante',
  PSYCHOLOGIST: 'Psicólogo/a',
  ADMIN: 'Administrador',
};

const Profile: React.FC = () => {
  const { user: authUser, setAuth, token } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nextCita, setNextCita] = useState<Cita | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    faculty: '',
    semester: '',
    studentCode: '',
    program: '',
    preferredContact: 'whatsapp',
    preferredSchedule: 'morning',
    remindersEnabled: true,
  });

  useEffect(() => {
    Promise.all([
      usersApi.getMe(),
      citasApi.getNext().catch(() => null),
    ]).then(([p, next]) => {
      setProfile(p);
      setNextCita(next);
      setForm({
        name:              p.name ?? '',
        phone:             p.phone ?? '',
        faculty:           p.faculty ?? '',
        semester:          p.semester ? String(p.semester) : '',
        studentCode:       (p as any).studentCode ?? '',
        program:           (p as any).program ?? p.faculty ?? '',
        preferredContact:  (p as any).preferredContact ?? 'whatsapp',
        preferredSchedule: (p as any).preferredSchedule ?? 'morning',
        remindersEnabled:  (p as any).remindersEnabled ?? true,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const updated = await usersApi.updateMe({
        name:     form.name     || undefined,
        phone:    form.phone    || undefined,
        faculty:  form.faculty  || undefined,
        semester: form.semester ? parseInt(form.semester) : undefined,
      } as any);
      setProfile(updated as any);
      if (token) setAuth({ ...authUser!, name: updated.name ?? authUser!.name }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Error al guardar los cambios');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = (profile?.name ?? authUser?.name ?? '?')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-black text-on-surface">Usuario</h1>
        <p className="text-on-surface-variant mt-1">Administra tu información personal.</p>
      </div>

      {/* ── Avatar ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-2xl shrink-0">
            {initials}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            title="Cambiar foto">
            <Camera size={16} />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-on-surface">{profile?.name ?? 'Usuario'}</h2>
          <p className="text-on-surface-variant text-sm">{profile?.email}</p>
          <span className="inline-block mt-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
            {roleLabels[profile?.role ?? 'USER']}
          </span>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && <p className="text-sm text-error font-bold bg-error/10 px-4 py-2 rounded-lg">{error}</p>}
      {saved  && <p className="text-sm text-green-700 font-bold bg-green-50 px-4 py-2 rounded-lg">✅ Cambios guardados correctamente</p>}

      {/* ── Información personal ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <User size={18} className="text-primary" /> Información personal
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
              <User size={14} /> Nombre completo
            </label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>

          {authUser?.role === 'USER' && (
            <div>
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
                <Hash size={14} /> Código estudiantil
              </label>
              <input value={form.studentCode} onChange={e => setForm(f => ({ ...f, studentCode: e.target.value }))}
                placeholder="2020123456"
                className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
              <Mail size={14} /> Correo institucional
            </label>
            <input value={profile?.email ?? ''} disabled
              className="w-full bg-surface-container/50 border-none rounded-lg px-4 py-3 text-sm text-outline cursor-not-allowed" />
          </div>

          <div>
            <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
              <Phone size={14} /> Teléfono
            </label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+57 300 000 0000"
              className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>

          {authUser?.role === 'USER' && (
            <>
              <div>
                <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
                  <GraduationCap size={14} /> Programa/Carrera
                </label>
                <input value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
                  placeholder="Ingeniería de Sistemas"
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant flex items-center gap-1.5 mb-1">
                  <BookOpen size={14} /> Semestre
                </label>
                <input type="number" min="1" max="12" value={form.semester}
                  onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                  className="w-full bg-surface-container border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Información de atención (solo estudiantes) ────────────────────────── */}
      {authUser?.role === 'USER' && (
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-on-surface flex items-center gap-2">
            <Calendar size={18} className="text-primary" /> Información de atención
          </h3>
          <div className="space-y-3">
            {/* Psicólogo asignado */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
              <div>
                <p className="text-sm font-bold text-on-surface">Psicólogo asignado</p>
                <p className="text-sm text-on-surface-variant">
                  {(profile as any)?.assignedPsychologist?.name ?? 'Sin asignar'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm font-bold">
                {(profile as any)?.assignedPsychologist?.name
                  ? (profile as any).assignedPsychologist.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
                  : '?'}
              </div>
            </div>

            {/* Próxima cita */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
              <div>
                <p className="text-sm font-bold text-on-surface">Próxima cita</p>
                {nextCita ? (
                  <p className="text-sm text-on-surface-variant">
                    {new Date(nextCita.date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' '}a las{' '}
                    {new Date(nextCita.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}{nextCita.professional.name}
                  </p>
                ) : (
                  <p className="text-sm text-on-surface-variant">No hay citas programadas</p>
                )}
              </div>
              <Clock size={20} className="text-primary shrink-0" />
            </div>

            {/* Estado actual */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
              <div>
                <p className="text-sm font-bold text-on-surface">Estado actual</p>
                <p className="text-sm text-on-surface-variant">{(profile as any)?.currentStatus ?? 'Activo'}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Activo</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Preferencias ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" /> Preferencias
        </h3>
        <div className="space-y-4">
          {/* Método de contacto */}
          <div>
            <label className="text-sm font-bold text-on-surface-variant block mb-2">Método de contacto preferido</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'email',    label: 'Correo' },
                { value: 'phone',    label: 'Llamada' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, preferredContact: opt.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.preferredContact === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Horario preferido */}
          <div>
            <label className="text-sm font-bold text-on-surface-variant block mb-2">Horario preferido</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'morning',   label: 'Mañana' },
                { value: 'afternoon', label: 'Tarde' },
                { value: 'flexible',  label: 'Flexible' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, preferredSchedule: opt.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.preferredSchedule === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recordatorios toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-on-surface-variant" />
              <span className="text-sm font-bold text-on-surface">Recordatorios activados</span>
            </div>
            <button onClick={() => setForm(f => ({ ...f, remindersEnabled: !f.remindersEnabled }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.remindersEnabled ? 'bg-primary' : 'bg-outline-variant'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.remindersEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Seguridad ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <Shield size={18} className="text-primary" /> Seguridad
        </h3>
        <div className="flex items-center gap-3 p-4 bg-secondary-container/30 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Cuenta vinculada con la universidad</p>
            <p className="text-xs text-on-surface-variant">Tu acceso se gestiona a través de la autenticación institucional</p>
          </div>
        </div>
      </div>

      {/* ── Botón guardar ─────────────────────────────────────────────────────── */}
      <div className="pt-2 pb-6">
        <p className="text-xs text-outline mb-3">
          Miembro desde{' '}
          {profile?.createdAt
            ? new Date(profile.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
            : '—'}
        </p>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors">
          <Save size={18} /> {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
