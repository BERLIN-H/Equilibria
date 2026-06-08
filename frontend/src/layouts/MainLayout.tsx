import React from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Home, Calendar, Clock, FlameKindling, ShieldCheck, Bell, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const isPsych = user?.role === 'PSYCHOLOGIST';
  const isUser  = user?.role === 'USER';

  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard':     return isPsych ? 'Panel del Psicólogo' : isAdmin ? 'Panel del Administrador' : 'Panel Estudiantil';
      case '/appointments':  return 'Citas';
      case '/agenda':        return 'Agenda';
      case '/patients':      return 'Pacientes';
      case '/profile':       return 'Mi Perfil';
      case '/notifications': return 'Notificaciones';
      case '/settings':      return 'Configuración';
      case '/admin':         return 'Administración';
      default:               return 'Equilibria';
    }
  };

  // Barra móvil adaptada por rol
  const navItems = [
    { to: '/dashboard',    icon: Home,          label: 'Inicio',        show: true },
    { to: '/appointments', icon: Calendar,      label: 'Citas',         show: true },
    { to: '/urgent-help',  icon: FlameKindling, label: 'S.O.S',        show: isUser,  danger: true },
    { to: '/agenda',       icon: Clock,         label: 'Agenda',        show: isUser || isPsych },
    { to: '/patients',     icon: Users,         label: 'Pacientes',     show: isPsych },
    { to: '/admin',        icon: ShieldCheck,   label: 'Admin',         show: isAdmin },
    { to: '/notifications',icon: Bell,          label: 'Avisos',        show: true },
  ].filter(i => i.show);

  return (
    <div className="min-h-screen bg-backgroundBase">
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        <TopBar title={getTitle()} />
        <div className="pt-20 px-6 pb-28 md:pb-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-outline-variant/20 flex items-stretch z-50">
        {navItems.map(({ to, icon: Icon, label, danger }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center justify-center flex-1 gap-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <Icon size={21} className={
                  danger
                    ? isActive ? 'text-error' : 'text-error/50'
                    : isActive ? 'text-primary' : 'text-outline'
                } />
              </motion.div>
              <span className={`text-[9px] font-bold uppercase tracking-wide transition-colors
                ${danger
                  ? isActive ? 'text-error' : 'text-error/50'
                  : isActive ? 'text-primary' : 'text-outline'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;
