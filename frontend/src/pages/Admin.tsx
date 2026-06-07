import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Calendar, CheckCircle, Clock, Search, ChevronLeft, ChevronRight,
  BarChart2, XCircle, AlertTriangle, Trash2, Edit2, ShieldCheck,
  TrendingUp, UserCheck, X, Save, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminApi, AdminStats } from '../api/admin';
import { citasApi } from '../api/citas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface UserData {
  id: number; name: string; email: string; role: string;
  faculty?: string; createdAt: string; _count?: { citas: number };
}
interface SlotConfig {
  id: number; professionalId: number; dayOfWeek: number;
  startHour: number; endHour: number; durationMin: number; active: boolean;
}
interface PsychReport {
  id: number; name: string; email: string;
  total: number; completadas: number; canceladas: number; pendientes: number; esteMes: number;
}
interface CancelReport {
  id: number; name: string; email: string; totalCitas: number; canceladas: number;
  cancelaciones: { id: number; date: string; type: string; student: { name: string; email: string }; updatedAt: string }[];
}

const roleColors: Record<string, string> = {
  USER: 'bg-blue-100 text-blue-700', PSYCHOLOGIST: 'bg-purple-100 text-purple-700', ADMIN: 'bg-red-100 text-red-700',
};
const roleLabels: Record<string, string> = { USER: 'Estudiante', PSYCHOLOGIST: 'Psicólogo/a', ADMIN: 'Admin' };
const statusColors: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700', CONFIRMADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-700', COMPLETADA: 'bg-blue-100 text-blue-700',
};
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const timeToMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const minutesToTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

type Tab = 'dashboard' | 'users' | 'citas' | 'psychologists' | 'availability' | 'reports';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'citas', label: 'Citas', icon: Calendar },
  { id: 'psychologists', label: 'Psicólogos', icon: UserCheck },
  { id: 'availability', label: 'Horarios', icon: Clock },
  { id: 'reports', label: 'Reportes', icon: TrendingUp },
];

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-black text-on-surface">{value}</p>
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  </motion.div>
);

const Admin: React.FC = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [allCitas, setAllCitas] = useState<any[]>([]);
  const [citasLoading, setCitasLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [psychReports, setPsychReports] = useState<PsychReport[]>([]);
  const [cancelReports, setCancelReports] = useState<CancelReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [psychologists, setPsychologists] = useState<UserData[]>([]);
  const [selectedPsych, setSelectedPsych] = useState<number | null>(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({ dayOfWeek: '1', startTime: '08:00', endTime: '11:00', durationMin: '50' });
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [expandedPsych, setExpandedPsych] = useState<number | null>(null);
  

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: '10' };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    const data = await adminApi.getUsers(params).catch(() => ({ data: [], total: 0, totalPages: 1 }));
    setUsers(data.data ?? []); setTotal(data.total ?? 0); setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  const loadCitas = useCallback(async () => {
    setCitasLoading(true);
    const params: Record<string, string> = { limit: '30' };
    if (statusFilter) params.status = statusFilter;
    const data = await adminApi.getAllCitas(params).catch(() => ({ data: [] }));
    setAllCitas(data.data ?? []);
    setCitasLoading(false);
  }, [statusFilter]);

  useEffect(() => { if (tab === 'citas') loadCitas(); }, [tab, loadCitas]);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    const [psychR, cancelR] = await Promise.all([
      adminApi.getPsychologistReport().catch(() => []),
      adminApi.getCancellationReport().catch(() => []),
    ]);
    setPsychReports(Array.isArray(psychR) ? psychR : []);
    setCancelReports(Array.isArray(cancelR) ? cancelR : []);
    setReportsLoading(false);
  }, []);

  useEffect(() => { if (tab === 'reports') loadReports(); }, [tab, loadReports]);

  const loadPsychologists = useCallback(async () => {
    const data = await adminApi.getUsers({ role: 'PSYCHOLOGIST', limit: '50' }).catch(() => ({ data: [] }));
    const list = data.data ?? [];
    setPsychologists(list);
    if (list.length > 0 && !selectedPsych) setSelectedPsych(list[0].id);
  }, [selectedPsych]);

  useEffect(() => {
    if (tab === 'availability' || tab === 'psychologists') loadPsychologists();
  }, [tab, loadPsychologists]);

  const loadSlots = useCallback(async () => {
    if (!selectedPsych) return;
    const data = await citasApi.getSlotConfig().catch(() => []);
    setSlots(Array.isArray(data) ? data.filter((s: SlotConfig) => s.professionalId === selectedPsych) : []);
  }, [selectedPsych]);

  useEffect(() => { if (selectedPsych) loadSlots(); }, [selectedPsych, loadSlots]);

  const handleSaveSlot = async () => {
    if (!selectedPsych) return;
    setSavingSlot(true);
    try {
      await citasApi.createSlot({
        dayOfWeek: parseInt(slotForm.dayOfWeek),
        startHour: timeToMinutes(slotForm.startTime),
        endHour: timeToMinutes(slotForm.endTime),
        durationMin: parseInt(slotForm.durationMin),
      });
      await loadSlots();
      setShowSlotForm(false);
    } catch (e) { console.error(e); }
    setSavingSlot(false);
  };

  const handleDeleteSlot = async (id: number) => {
    await citasApi.deleteSlot(id).catch(() => { });
    await loadSlots();
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    await adminApi.updateUser(editUser.id, { role: editUser.role, name: editUser.name }).catch(() => { });
    setEditUser(null);
    loadUsers();
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    await adminApi.deleteUser(id).catch(() => { });
    loadUsers();
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(26, 82, 118);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EQUILIBRIA', 14, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Centro de Apoyo Psicológico — Universidad de La Guajira', 14, 20);
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`, 140, 20);

    let y = 36;

    // Actividad por psicólogo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Actividad por Psicólogo', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Psicólogo', 'Email', 'Total', 'Completadas', 'Canceladas', 'Pendientes', 'Este mes']],
      body: psychReports.map(p => [
        p.name ?? '—',
        p.email,
        p.total,
        p.completadas,
        p.canceladas,
        p.pendientes,
        p.esteMes,
      ]),
      headStyles: { fillColor: [26, 82, 118], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 244, 248] },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 14;

    // Reporte de cancelaciones
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Cancelaciones por Psicólogo', 14, y);
    y += 6;

    const cancelRows: any[] = [];
    cancelReports.forEach(p => {
      if (p.cancelaciones.length === 0) {
        cancelRows.push([p.name, p.email, '—', '—', '—', `${p.canceladas}/${p.totalCitas}`]);
      } else {
        p.cancelaciones.forEach((c, i) => {
          cancelRows.push([
            i === 0 ? p.name : '',
            i === 0 ? p.email : '',
            c.student.name,
            c.type,
            new Date(c.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
            i === 0 ? `${p.canceladas}/${p.totalCitas}` : '',
          ]);
        });
      }
    });

    autoTable(doc, {
      startY: y,
      head: [['Psicólogo', 'Email', 'Estudiante', 'Tipo', 'Fecha cita', 'Cancelaciones']],
      body: cancelRows,
      headStyles: { fillColor: [180, 30, 30], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [255, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount} — Equilibria`, 14, 290);
    }

    doc.save(`reporte-equilibria-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1 — Actividad psicólogos
    const psychData = psychReports.map(p => ({
      'Psicólogo': p.name ?? '—',
      'Email': p.email,
      'Total citas': p.total,
      'Completadas': p.completadas,
      'Canceladas': p.canceladas,
      'Pendientes': p.pendientes,
      'Este mes': p.esteMes,
    }));
    const ws1 = XLSX.utils.json_to_sheet(psychData);
    ws1['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Actividad Psicólogos');

    // Hoja 2 — Cancelaciones
    const cancelData: any[] = [];
    cancelReports.forEach(p => {
      if (p.cancelaciones.length === 0) {
        cancelData.push({ 'Psicólogo': p.name, 'Email psicólogo': p.email, 'Estudiante': '—', 'Tipo': '—', 'Fecha': '—', 'Total cancelaciones': p.canceladas });
      } else {
        p.cancelaciones.forEach(c => {
          cancelData.push({
            'Psicólogo': p.name,
            'Email psicólogo': p.email,
            'Estudiante': c.student.name,
            'Tipo': c.type,
            'Fecha': new Date(c.date).toLocaleDateString('es-CO'),
            'Total cancelaciones': p.canceladas,
          });
        });
      }
    });
    const ws2 = XLSX.utils.json_to_sheet(cancelData);
    ws2['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Cancelaciones');

    // Hoja 3 — Resumen general
    if (stats) {
      const resumen = [
        { 'Métrica': 'Total estudiantes', 'Valor': stats.totalUsers },
        { 'Métrica': 'Total citas', 'Valor': stats.totalCitas },
        { 'Métrica': 'Citas completadas', 'Valor': stats.citasCompletadas },
        { 'Métrica': 'Citas pendientes', 'Valor': stats.citasPendientes },
        { 'Métrica': 'Citas este mes', 'Valor': stats.citasThisMonth },
        { 'Métrica': 'Alertas SOS', 'Valor': stats.sosAlerts },
        { 'Métrica': 'Fecha generación', 'Valor': new Date().toLocaleDateString('es-CO') },
      ];
      const ws3 = XLSX.utils.json_to_sheet(resumen);
      ws3['!cols'] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Resumen General');
    }

    XLSX.writeFile(wb, `reporte-equilibria-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-black text-on-surface">Panel de Administración</h1>
        <p className="text-on-surface-variant mt-1">Gestión completa de la plataforma Equilibria.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === t.id ? 'bg-primary text-white shadow-md' : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'}`}>
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={Users} label="Estudiantes" value={stats.totalUsers} color="bg-blue-100 text-blue-600" />
            <StatCard icon={Calendar} label="Total citas" value={stats.totalCitas} color="bg-primary/10 text-primary" />
            <StatCard icon={CheckCircle} label="Completadas" value={stats.citasCompletadas} color="bg-green-100 text-green-600" />
            <StatCard icon={Clock} label="Pendientes" value={stats.citasPendientes} color="bg-yellow-100 text-yellow-600" />
            <StatCard icon={TrendingUp} label="Citas este mes" value={stats.citasThisMonth} color="bg-purple-100 text-purple-600" />
            <StatCard icon={AlertTriangle} label="Alertas SOS" value={stats.sosAlerts} color="bg-red-100 text-red-600" />
          </div>
        </div>
      )}

      {/* ── USUARIOS ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-9 pr-4 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary" />
            </div>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary">
              <option value="">Todos los roles</option>
              <option value="USER">Estudiantes</option>
              <option value="PSYCHOLOGIST">Psicólogos</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
              <p className="text-sm text-on-surface-variant">{total} usuario(s) encontrado(s)</p>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {u.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-sm truncate">{u.name}</p>
                      <p className="text-xs text-outline truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
                    <span className="text-xs text-outline hidden md:block">{u._count?.citas ?? 0} citas</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditUser(u)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30">
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="text-sm text-on-surface-variant">Página {page} de {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30">
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CITAS ── */}
      {tab === 'citas' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-center">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="COMPLETADA">Completada</option>
            </select>
            <button onClick={loadCitas} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
              <RefreshCw size={18} className="text-on-surface-variant" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
            {citasLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : allCitas.length === 0 ? (
              <p className="text-center text-on-surface-variant py-12">No hay citas registradas.</p>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {allCitas.map(c => (
                  <div key={c.id} className="px-4 py-3 hover:bg-surface-container/30 transition-colors">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-bold text-on-surface text-sm">{c.student?.name ?? '—'}</p>
                        <p className="text-xs text-outline">con {c.professional?.name ?? '—'} · {c.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-outline">
                          {new Date(c.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {new Date(c.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[c.status]}`}>{c.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PSICÓLOGOS ── */}
      {tab === 'psychologists' && (
        <div className="space-y-4">
          {psychologists.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">Cargando psicólogos...</div>
          ) : (
            <div className="space-y-3">
              {psychologists.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      {p.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface">{p.name}</p>
                      <p className="text-sm text-outline">{p.email}</p>
                    </div>
                    <span className="text-sm text-on-surface-variant">{p._count?.citas ?? 0} citas</span>
                    <button onClick={() => setEditUser(p)} className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-colors">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HORARIOS ── */}
      {tab === 'availability' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <select value={selectedPsych ?? ''} onChange={e => setSelectedPsych(parseInt(e.target.value))}
              className="px-4 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary">
              {psychologists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={() => setShowSlotForm(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90">
              + Agregar horario
            </button>
          </div>

          {/* Formulario nuevo slot */}
          <AnimatePresence>
            {showSlotForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-primary/30 shadow-md p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-on-surface">Nuevo bloque de disponibilidad</h3>
                  <button onClick={() => setShowSlotForm(false)}><X size={18} className="text-outline" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Día</label>
                    <select value={slotForm.dayOfWeek} onChange={e => setSlotForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                      className="w-full px-3 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary">
                      {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Hora inicio</label>
                    <input type="time" value={slotForm.startTime} onChange={e => setSlotForm(f => ({ ...f, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Hora fin</label>
                    <input type="time" value={slotForm.endTime} onChange={e => setSlotForm(f => ({ ...f, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Duración (min)</label>
                    <input type="number" value={slotForm.durationMin} onChange={e => setSlotForm(f => ({ ...f, durationMin: e.target.value }))}
                      className="w-full px-3 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowSlotForm(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-xl">Cancelar</button>
                  <button onClick={handleSaveSlot} disabled={savingSlot}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                    <Save size={16} />{savingSlot ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de slots */}
          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
            {slots.length === 0 ? (
              <p className="text-center text-on-surface-variant py-12 text-sm">No hay horarios configurados para este psicólogo.</p>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {slots.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary text-sm w-24">{DAY_NAMES[s.dayOfWeek]}</span>
                      <span className="text-sm text-on-surface">{minutesToTime(s.startHour)} – {minutesToTime(s.endHour)}</span>
                      <span className="text-xs text-outline bg-surface-container px-2 py-1 rounded-lg">{s.durationMin} min/sesión</span>
                    </div>
                    <button onClick={() => handleDeleteSlot(s.id)} className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REPORTES ── */}
      {tab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-on-surface">Reportes</h2>
            <div className="flex items-center gap-2">
              <button onClick={loadReports} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
                <RefreshCw size={16} /> Actualizar
              </button>
              <button
                onClick={exportExcel}
                disabled={reportsLoading || psychReports.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                <TrendingUp size={16} /> Excel
              </button>
              <button
                onClick={exportPDF}
                disabled={reportsLoading || psychReports.length === 0}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                <BarChart2 size={16} /> PDF
              </button>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* Resumen por psicólogo */}
              <div>
                <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <BarChart2 size={18} className="text-primary" /> Actividad por psicólogo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {psychReports.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5">
                      <p className="font-bold text-on-surface">{p.name}</p>
                      <p className="text-xs text-outline mb-4">{p.email}</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { label: 'Total', value: p.total, color: 'text-primary' },
                          { label: 'Completadas', value: p.completadas, color: 'text-green-600' },
                          { label: 'Canceladas', value: p.canceladas, color: 'text-red-500' },
                          { label: 'Este mes', value: p.esteMes, color: 'text-purple-600' },
                        ].map(item => (
                          <div key={item.label} className="bg-surface-container rounded-xl p-2">
                            <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                            <p className="text-[10px] text-outline">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reporte de cancelaciones */}
              <div>
                <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <XCircle size={18} className="text-red-500" /> Cancelaciones por psicólogo
                </h3>
                <div className="space-y-3">
                  {cancelReports.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                      <button onClick={() => setExpandedPsych(expandedPsych === p.id ? null : p.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                            {p.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-on-surface text-sm">{p.name}</p>
                            <p className="text-xs text-outline">{p.canceladas} cancelaciones de {p.totalCitas} citas totales</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {p.canceladas > 0 && (
                            <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">
                              {Math.round(p.canceladas / Math.max(p.totalCitas, 1) * 100)}% tasa
                            </span>
                          )}
                          <ChevronRight size={18} className={`text-outline transition-transform ${expandedPsych === p.id ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedPsych === p.id && p.cancelaciones.length > 0 && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}>
                            <div className="border-t border-outline-variant/10 divide-y divide-outline-variant/10">
                              {p.cancelaciones.map(c => (
                                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-bold text-on-surface">{c.student.name}</p>
                                    <p className="text-xs text-outline">{c.type}</p>
                                  </div>
                                  <p className="text-xs text-outline">
                                    {new Date(c.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                        {expandedPsych === p.id && p.cancelaciones.length === 0 && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                            <p className="text-center text-sm text-on-surface-variant py-4">Sin cancelaciones registradas.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal editar usuario */}
      <AnimatePresence>
        {editUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-on-surface">Editar usuario</h3>
                <button onClick={() => setEditUser(null)}><X size={20} className="text-outline" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Nombre</label>
                  <input value={editUser.name ?? ''} onChange={e => setEditUser(u => u ? { ...u, name: e.target.value } : u)}
                    className="w-full px-4 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Rol</label>
                  <select value={editUser.role} onChange={e => setEditUser(u => u ? { ...u, role: e.target.value } : u)}
                    className="w-full px-4 py-2 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary">
                    <option value="USER">Estudiante</option>
                    <option value="PSYCHOLOGIST">Psicólogo/a</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-xl">Cancelar</button>
                <button onClick={handleUpdateUser} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90">
                  <Save size={16} /> Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
