import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { citasApi, Cita } from '../api/citas';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const statusColors: Record<string, string> = {
  PENDIENTE:  'bg-yellow-400',
  CONFIRMADA: 'bg-green-500',
  CANCELADA:  'bg-red-400',
  COMPLETADA: 'bg-blue-400',
};

const statusBadge: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  CANCELADA:  'bg-red-100 text-red-800 border-red-200',
  COMPLETADA: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusLabels: Record<string, string> = {
  PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada', COMPLETADA: 'Completada',
};

const Agenda = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    citasApi.getAll().then(setCitas).catch(() => {});
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const citasForDay = (day: number) =>
    citas.filter(c => {
      const d = new Date(c.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const selectedCitas = selectedDay ? citasForDay(selectedDay) : [];
  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-black text-on-surface">Agenda</h1>
        <p className="text-on-surface-variant mt-1">Visualiza tu calendario de citas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-display font-bold text-xl text-on-surface capitalize">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-surface-container rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-outline py-2">{d}</div>
            ))}
          </div>

          {/* Grilla */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayCitas = citasForDay(day);
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDay === day;

              return (
                <motion.button key={day} whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-colors
                    ${isSelected ? 'bg-primary text-white' : isToday ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container text-on-surface'}`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {dayCitas.length > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {Object.entries(statusColors).map(([s, color]) => (
              <div key={s} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                {statusLabels[s]}
              </div>
            ))}
          </div>
        </div>

        {/* Panel del día seleccionado */}
        <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6">
          <h3 className="font-bold text-on-surface mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
              : 'Selecciona un día'}
          </h3>

          {selectedDate && selectedCitas.length === 0 && (
            <div className="text-center py-8">
              <Calendar size={40} className="mx-auto mb-3 text-outline opacity-30" />
              <p className="text-sm text-on-surface-variant">No hay citas programadas</p>
            </div>
          )}

          <div className="space-y-3">
            {selectedCitas.map(c => (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-surface-container rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-on-surface text-sm">{c.type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold border ${statusBadge[c.status]}`}>
                    {statusLabels[c.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Clock size={14} />
                  <span>
                    {new Date(c.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">{c.professional.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
