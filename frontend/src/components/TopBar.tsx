import React from 'react';
import { useAuthStore } from '../store/authStore';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { user } = useAuthStore();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const roleLabel: Record<string, string> = {
    USER: 'Estudiante', PSYCHOLOGIST: 'Psicólogo/a', ADMIN: 'Administrador',
  };

  return (
    <header className="fixed top-0 right-0 w-full md:left-64 md:w-[calc(100%-16rem)] h-16 bg-white/80 backdrop-blur-md flex justify-between items-center px-6 z-40 border-b border-outline-variant/20">
      <h1 className="font-display text-xl font-bold text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border-2 border-primary/20">
          {initials}
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-sm font-bold text-on-surface leading-tight">{user?.name ?? 'Usuario'}</span>
          <span className="text-[11px] text-outline">{roleLabel[user?.role ?? ''] ?? user?.role}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
