import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, X, User, Calendar, BookOpen,
  ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Edit3, Save
} from 'lucide-react';
import { getPatients, getPatientById, updatePsychNotes } from '../api/patients';

interface Patient {
  id: number;
  name: string | null;
  email: string;
  faculty: string | null;
  semester: number | null;
  phone: string | null;
  totalSesiones: number;
  ultimaCita: string | null;
  estadoUltimaCita: string | null;
}

interface Cita {
  id: number;
  date: string;
  type: string;
  mode: string;
  status: string;
  notes: string | null;
  psychNotes: string | null;
  location: string | null;
}

interface PatientDetail {
  student: Patient;
  citas: Cita[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'text-yellow-600 bg-yellow-50 border-yellow-200',  icon: Clock },
  CONFIRMADA: { label: 'Confirmada', color: 'text-blue-600 bg-blue-50 border-blue-200',        icon: CheckCircle },
  COMPLETADA: { label: 'Completada', color: 'text-green-600 bg-green-50 border-green-200',     icon: CheckCircle },
  CANCELADA:  { label: 'Cancelada',  color: 'text-red-600 bg-red-50 border-red-200',           icon: XCircle },
};

const Patients = () => {
  const [patients, setPatients]         = useState<Patient[]>([]);
  const [filtered, setFiltered]         = useState<Patient[]>([]);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<PatientDetail | null>(null);
  const [loadingList, setLoadingList]   = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingCitaId, setEditingCitaId] = useState<number | null>(null);
  const [editingNote, setEditingNote]   = useState('');
  const [savingNote, setSavingNote]     = useState(false);

  useEffect(() => {
    getPatients()
      .then(data => { setPatients(data); setFiltered(data); })
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.faculty?.toLowerCase().includes(q)
    ));
  }, [search, patients]);

  const openPatient = async (id: number) => {
    setLoadingDetail(true);
    try {
      const data = await getPatientById(id);
      setSelected(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const startEditNote = (cita: Cita) => {
    setEditingCitaId(cita.id);
    setEditingNote(cita.psychNotes ?? '');
  };

  const saveNote = async (citaId: number) => {
    setSavingNote(true);
    try {
      await updatePsychNotes(citaId, editingNote);
      setSelected(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          citas: prev.citas.map(c =>
            c.id === citaId ? { ...c, psychNotes: editingNote } : c
          ),
        };
      });
      setEditingCitaId(null);
    } finally {
      setSavingNote(false);
    }
  };

  const formatFecha = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      timeZone: 'America/Bogota',
    });

  const formatHora = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota',
    });

  return (
    <div className="flex h-full gap-6">

      {/* ── Lista de pacientes ────────────────────────────────────────── */}
      <div className={`flex flex-col gap-4 transition-all duration-300 ${selected ? 'w-80 shrink-0' : 'w-full'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Mis Pacientes</h1>
            <p className="text-sm text-on-surface-variant mt-1">{patients.length} estudiante(s) atendido(s)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
            <Users size={20} className="text-secondary" />
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o facultad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        {/* Lista */}
        {loadingList ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No se encontraron pacientes</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto">
            {filtered.map(patient => {
              const status = patient.estadoUltimaCita ? statusConfig[patient.estadoUltimaCita] : null;
              const isSelected = selected?.student.id === patient.id;
              return (
                <motion.button
                  key={patient.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => openPatient(patient.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-secondary-container border-secondary/30'
                      : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {patient.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm truncate">{patient.name ?? 'Sin nombre'}</p>
                      <p className="text-xs text-outline truncate">{patient.faculty ?? patient.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-outline">{patient.totalSesiones} sesión(es)</span>
                      {status && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-outline shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Panel lateral — Ficha clínica ────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="flex-1 flex flex-col gap-4 overflow-y-auto"
          >
            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Header ficha */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg">
                      {selected.student.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">{selected.student.name ?? 'Sin nombre'}</h2>
                      <p className="text-sm text-outline">{selected.student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Datos personales */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={16} className="text-secondary" />
                    <h3 className="font-semibold text-on-surface text-sm">Datos del Estudiante</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Facultad',  value: selected.student.faculty ?? 'No registrada' },
                      { label: 'Semestre',  value: selected.student.semester ? `Semestre ${selected.student.semester}` : 'No registrado' },
                      { label: 'Teléfono',  value: selected.student.phone ?? 'No registrado' },
                      { label: 'Sesiones',  value: `${selected.citas.length} sesión(es)` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface-container rounded-lg p-3">
                        <p className="text-[11px] text-outline uppercase tracking-wide mb-1">{label}</p>
                        <p className="text-sm font-semibold text-on-surface">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historial de sesiones */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={16} className="text-secondary" />
                    <h3 className="font-semibold text-on-surface text-sm">Historial Clínico</h3>
                  </div>

                  {selected.citas.length === 0 ? (
                    <p className="text-sm text-outline text-center py-4">Sin sesiones registradas</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {selected.citas.map(cita => {
                        const st = statusConfig[cita.status];
                        const StatusIcon = st?.icon ?? AlertCircle;
                        const isEditing = editingCitaId === cita.id;

                        return (
                          <div key={cita.id} className="border border-outline-variant/20 rounded-xl overflow-hidden">
                            {/* Header sesión */}
                            <div className="flex items-center justify-between px-4 py-3 bg-surface-container">
                              <div className="flex items-center gap-3">
                                <Calendar size={14} className="text-secondary" />
                                <div>
                                  <p className="text-sm font-semibold text-on-surface">{formatFecha(cita.date)}</p>
                                  <p className="text-xs text-outline">{formatHora(cita.date)} · {cita.type} · {cita.mode}</p>
                                </div>
                              </div>
                              <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${st?.color}`}>
                                <StatusIcon size={11} />
                                {st?.label}
                              </span>
                            </div>

                            {/* Notas del estudiante */}
                            {cita.notes && (
                              <div className="px-4 py-3 border-t border-outline-variant/10">
                                <p className="text-[11px] text-outline uppercase tracking-wide mb-1">Motivo del estudiante</p>
                                <p className="text-sm text-on-surface-variant">{cita.notes}</p>
                              </div>
                            )}

                            {/* Notas clínicas del psicólogo */}
                            <div className="px-4 py-3 border-t border-outline-variant/10">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] text-outline uppercase tracking-wide">Notas clínicas</p>
                                {!isEditing && cita.status === 'COMPLETADA' && (
                                  <button
                                    onClick={() => startEditNote(cita)}
                                    className="flex items-center gap-1 text-xs text-secondary hover:underline"
                                  >
                                    <Edit3 size={12} /> Editar
                                  </button>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="flex flex-col gap-2">
                                  <textarea
                                    value={editingNote}
                                    onChange={e => setEditingNote(e.target.value)}
                                    rows={4}
                                    placeholder="Escribe las observaciones clínicas de esta sesión..."
                                    className="w-full text-sm p-3 rounded-lg bg-surface-container border border-secondary/30 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => setEditingCitaId(null)}
                                      className="text-xs px-3 py-1.5 rounded-lg text-outline hover:bg-surface-container transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      onClick={() => saveNote(cita.id)}
                                      disabled={savingNote}
                                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-secondary text-white hover:bg-secondary/90 disabled:opacity-60 transition-colors"
                                    >
                                      <Save size={12} />
                                      {savingNote ? 'Guardando...' : 'Guardar'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-on-surface-variant">
                                  {cita.psychNotes ?? (
                                    <span className="italic text-outline">
                                      {cita.status === 'COMPLETADA'
                                        ? 'Sin notas clínicas — haz clic en Editar para agregar'
                                        : 'Las notas clínicas se pueden agregar cuando la cita esté completada'}
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;