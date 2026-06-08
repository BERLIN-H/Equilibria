import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/authStore';

interface TopBarProps { title: string; }

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const roleLabel: Record<string, string> = {
    USER: 'Estudiante', PSYCHOLOGIST: 'Psicólogo/a', ADMIN: 'Administrador',
  };

  const go = (path: string) => { setOpen(false); navigate(path); };
  const handleLogout = () => { setOpen(false); logout(); navigate('/'); };

  return (
    <header className="fixed top-0 right-0 w-full md:left-64 md:w-[calc(100%-16rem)] h-16 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 z-40 border-b border-outline-variant/20">
      <h1 className="font-display text-xl font-bold text-primary">{title}</h1>

      <div className="relative" ref={ref}>
        {/* Botón con borde y fondo que deja claro que es tocable */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container/60 hover:bg-surface-container active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
            {initials}
          </div>
          <div className="flex flex-col text-left max-w-[100px] md:max-w-none">
            <span className="text-xs font-bold text-on-surface leading-tight truncate">{user?.name?.split(' ')[0] ?? 'Usuario'}</span>
            <span className="text-[10px] text-outline hidden md:block">{roleLabel[user?.role ?? ''] ?? user?.role}</span>
          </div>
          <ChevronDown
            size={15}
            className={`text-outline transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden z-50"
            >
              {/* Info usuario */}
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-sm font-bold text-on-surface truncate">{user?.name}</p>
                <p className="text-xs text-outline truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {roleLabel[user?.role ?? ''] ?? user?.role}
                </span>
              </div>

              {/* Opciones */}
              <div className="py-1">
                <button onClick={() => go('/profile')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors">
                  <User size={16} className="text-outline" /> Mi perfil
                </button>
                <button onClick={() => go('/settings')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors">
                  <Settings size={16} className="text-outline" /> Configuración
                </button>
              </div>

              <div className="border-t border-outline-variant/10 py-1">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors font-bold">
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default TopBar;
