import React from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Home, Calendar, Clock, User, FlameKindling } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        if (user?.role === 'PSYCHOLOGIST') return 'Panel del Psicólogo';
        if (user?.role === 'ADMIN') return 'Panel del Administrador';
        return 'Panel Estudiantil';
      case '/appointments': return 'Citas';
      case '/agenda': return 'Agenda';
      case '/profile': return 'Usuario';
      case '/notifications': return 'Notificaciones';
      case '/settings': return 'Configuración';
      case '/admin': return 'Panel del Administrador';
      default: return 'Equilibria';
    }
  };

  return (
    <div className="min-h-screen bg-backgroundBase">
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        <TopBar title={getTitle()} />
        <div className="pt-20 px-6 pb-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/80 backdrop-blur-xl border border-outline-variant/30 flex justify-around items-center h-16 z-50 rounded-2xl shadow-2xl overflow-hidden">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
        >
          <Home size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Inicio</span>
        </NavLink>
        <NavLink 
          to="/appointments" 
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
        >
          <Calendar size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Citas</span>
        </NavLink>
        <div className="flex flex-col items-center justify-center w-full h-full">
           <button 
            onClick={() => navigate('/urgent-help')}
            className="w-12 h-12 bg-error rounded-full flex items-center justify-center text-white shadow-lg shadow-error/30 -mt-8 border-4 border-backgroundBase"
           >
            <FlameKindling size={24} />
           </button>
           <span className="text-[10px] font-bold uppercase tracking-wider text-error mt-1">S.O.S</span>
        </div>
        <NavLink 
          to="/agenda" 
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
        >
          <Clock size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Agenda</span>
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
        >
          <User size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MainLayout;
