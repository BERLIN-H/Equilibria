import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  User,
  Users,
  Bell,
  Settings,
  LogOut,
  FlameKindling,
  Scale,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: Home,        label: 'Inicio',          path: '/dashboard',     roles: ['USER','PSYCHOLOGIST','ADMIN'] },
    { icon: Calendar,    label: 'Citas',            path: '/appointments',  roles: ['USER','PSYCHOLOGIST','ADMIN'] },
    { icon: Users, label: 'Pacientes', path: '/patients', roles: ['PSYCHOLOGIST'] },
    { icon: Clock,       label: 'Agenda',           path: '/agenda',        roles: ['USER','PSYCHOLOGIST'] },
    { icon: User,        label: 'Usuario',          path: '/profile',       roles: ['USER','PSYCHOLOGIST','ADMIN'] },
    { icon: Bell,        label: 'Notificaciones',   path: '/notifications', roles: ['USER','PSYCHOLOGIST','ADMIN'] },
    { icon: ShieldCheck, label: 'Administración',   path: '/admin',         roles: ['ADMIN'] },
    { icon: Settings,    label: 'Configuración',    path: '/settings',      roles: ['USER','PSYCHOLOGIST','ADMIN'] },
  ].filter(item => !user?.role || item.roles.includes(user.role));

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col bg-surface-container-low border-r border-tertiary/10 shadow-sm p-4 gap-2 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
          <Scale size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-xl font-bold text-primary">Equilibria</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-on-surface-variant">Bienestar Psicológico</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm
              ${isActive
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-highest'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'fill-current' : ''} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col gap-3">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-on-surface truncate">{user.name}</span>
              <span className="text-[11px] text-outline capitalize">{user.role.toLowerCase()}</span>
            </div>
          </div>
        )}

        {user?.role !== 'ADMIN' && user?.role !== 'PSYCHOLOGIST' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/urgent-help')}
            className="w-full py-3 px-4 bg-error text-white rounded-lg flex items-center justify-center gap-2 font-bold shadow-lg shadow-error/20"
          >
            <FlameKindling size={20} />
            <span className="text-sm">Ayuda Urgente</span>
          </motion.button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors text-sm font-semibold"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
