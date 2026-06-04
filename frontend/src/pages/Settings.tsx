import React, { useState } from 'react';
import {
  Mail, Bell, Shield, Eye, HelpCircle, Info,
  ChevronDown, Check, Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/authStore';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  content: React.ReactNode;
}

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<string | null>('account');
  const [notifications, setNotifications] = useState({
    email: true, whatsapp: true, reminders: true, updates: false,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true, shareProgress: false,
  });
  const [accessibility, setAccessibility] = useState({
    largeText: false, highContrast: false, reduceMotion: false,
  });

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <motion.button onClick={onChange} whileTap={{ scale: 0.95 }}
      className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-outline-variant'}`}>
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </motion.button>
  );

  const sections: SettingSection[] = [
    {
      id: 'account',
      title: 'Cuenta institucional',
      description: 'Información de tu cuenta universitaria',
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
      content: (
        <div className="space-y-4">
          <div className="bg-secondary-container/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Correo institucional</p>
                <p className="text-sm text-on-surface-variant">{user?.email || 'correo@universidad.edu'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary font-medium">
              <Check size={16} />
              <span>Cuenta vinculada con la universidad</span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">
            Tu cuenta está asociada a tu correo institucional. El acceso se gestiona a través del sistema de autenticación universitario.
          </p>
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura cómo recibir alertas',
      icon: Bell,
      color: 'bg-yellow-100 text-yellow-600',
      content: (
        <div className="space-y-4">
          {[
            { key: 'email',     label: 'Notificaciones por correo',    description: 'Recibe actualizaciones en tu correo institucional' },
            { key: 'whatsapp',  label: 'Notificaciones por WhatsApp',   description: 'Recibe recordatorios de citas por WhatsApp' },
            { key: 'reminders', label: 'Recordatorios de citas',        description: 'Alertas 24h antes de tu cita' },
            { key: 'updates',   label: 'Novedades de la plataforma',    description: 'Información sobre nuevas funciones' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-on-surface">{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.description}</p>
              </div>
              <Toggle
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'privacy',
      title: 'Privacidad y seguridad',
      description: 'Controla tu información',
      icon: Shield,
      color: 'bg-green-100 text-green-600',
      content: (
        <div className="space-y-4">
          {[
            { key: 'showProfile',   label: 'Perfil visible para psicólogos', description: 'Permite que los profesionales vean tu información básica' },
            { key: 'shareProgress', label: 'Compartir progreso',              description: 'Comparte estadísticas anónimas para mejorar el servicio' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-on-surface">{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.description}</p>
              </div>
              <Toggle
                checked={privacy[item.key as keyof typeof privacy]}
                onChange={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
              />
            </div>
          ))}
          <div className="pt-4 border-t border-outline-variant/20">
            <p className="text-xs text-on-surface-variant">
              Tus datos personales están protegidos según la política de privacidad de la universidad.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'accessibility',
      title: 'Accesibilidad',
      description: 'Ajusta la experiencia visual',
      icon: Eye,
      color: 'bg-purple-100 text-purple-600',
      content: (
        <div className="space-y-4">
          {[
            { key: 'largeText',    label: 'Texto grande',       description: 'Aumenta el tamaño de la fuente' },
            { key: 'highContrast', label: 'Alto contraste',     description: 'Mejora la visibilidad de los elementos' },
            { key: 'reduceMotion', label: 'Reducir movimiento',  description: 'Minimiza las animaciones' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-on-surface">{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.description}</p>
              </div>
              <Toggle
                checked={accessibility[item.key as keyof typeof accessibility]}
                onChange={() => setAccessibility(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'support',
      title: 'Soporte',
      description: 'Obtener ayuda y contacto',
      icon: HelpCircle,
      color: 'bg-orange-100 text-orange-600',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Contactar soporte',    sub: 'soporte@universidad.edu',               href: 'mailto:soporte@universidad.edu' },
            { label: 'Preguntas frecuentes', sub: 'Resuelve tus dudas comunes',            href: '#' },
            { label: 'Reportar un problema', sub: 'Infórnanos sobre errores o sugerencias', href: '#' },
          ].map(item => (
            <a key={item.label} href={item.href}
              className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors">
              <div>
                <p className="text-sm font-bold text-on-surface">{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.sub}</p>
              </div>
              <ChevronDown size={20} className="-rotate-90 text-on-surface-variant" />
            </a>
          ))}
        </div>
      ),
    },
    {
      id: 'about',
      title: 'Acerca de la plataforma',
      description: 'Información sobre Equilibria',
      icon: Info,
      color: 'bg-primary/10 text-primary',
      content: (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center text-white mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">Equilibria</h3>
            <p className="text-sm text-on-surface-variant">Versión 1.0.0</p>
          </div>
          <p className="text-sm text-on-surface-variant">
            Plataforma de bienestar psicológico diseñada para estudiantes universitarios, facilitando el acceso a servicios de atención psicológica de manera segura y confidencial.
          </p>
          <div className="pt-4 border-t border-outline-variant/20 space-y-2">
            <a href="#" className="text-sm text-primary hover:underline block">Términos y condiciones</a>
            <a href="#" className="text-sm text-primary hover:underline block">Política de privacidad</a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-black text-on-surface">Configuración</h1>
        <p className="text-on-surface-variant mt-1">Personaliza tu experiencia en Equilibria.</p>
      </motion.div>

      <div className="space-y-3">
        {sections.map((section, index) => {
          const isOpen = activeSection === section.id;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200
                ${isOpen ? 'border-primary/30 shadow-primary/10 shadow-md' : 'border-outline-variant/20'}`}
            >
              <button
                onClick={() => setActiveSection(isOpen ? null : section.id)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-surface-container/40 transition-colors"
              >
                <motion.div
                  animate={{ scale: isOpen ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}
                >
                  <section.icon size={20} />
                </motion.div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-on-surface">{section.title}</p>
                  <p className="text-sm text-on-surface-variant">{section.description}</p>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <ChevronDown size={20} className={`transition-colors ${isOpen ? 'text-primary' : 'text-on-surface-variant'}`} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-outline-variant/20">
                        {section.content}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
