import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Calendar, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationsApi, Notification } from '../api/notifications';

const typeIcons: Record<string, React.ElementType> = {
  INFO:    Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR:   XCircle,
};

const typeColors: Record<string, string> = {
  INFO:    'bg-blue-100 text-blue-700',
  SUCCESS: 'bg-green-100 text-green-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  ERROR:   'bg-red-100 text-red-700',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Hace unos minutos';
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = async () => {
    const data = await notificationsApi.getAll().catch(() => []);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkOne = async (id: number) => {
    await notificationsApi.markOneRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unread = notifications.filter(n => !n.read).length;
  const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.read);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface">Notificaciones</h1>
          <p className="text-on-surface-variant mt-1">
            {unread > 0 ? `Tienes ${unread} notificación${unread > 1 ? 'es' : ''} sin leer` : 'Todo al día'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
            <CheckCheck size={16} /> Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors
              ${filter === f
                ? 'bg-primary text-white border-primary'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
            {f === 'all' ? 'Todas' : 'Sin leer'}
            {f === 'unread' && unread > 0 && (
              <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded-full text-xs">{unread}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="mx-auto mb-3 text-outline opacity-30" />
          <p className="font-bold text-on-surface-variant">
            {filter === 'unread' ? 'No hay notificaciones sin leer' : 'Sin notificaciones aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(n => {
              const Icon = typeIcons[n.type] ?? Info;
              return (
                <motion.div
                  key={n.id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                  className={`bg-white rounded-2xl border shadow-sm p-4 transition-all
                    ${n.read ? 'border-outline-variant/20 opacity-70' : 'border-primary/30 bg-primary/5'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl ${typeColors[n.type] ?? typeColors.INFO}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-on-surface">{n.title}</h3>
                        {!n.read && <span className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">{n.message}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-outline flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(n.createdAt)}
                        </span>
                        {!n.read && (
                          <button onClick={() => handleMarkOne(n.id)}
                            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                            <Check size={12} /> Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;
