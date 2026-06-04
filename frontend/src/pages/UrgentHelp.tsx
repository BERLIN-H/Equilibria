import React from 'react';
import { Phone, MessageCircle, AlertCircle, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const emergencyResources = [
  {
    title: 'Línea de crisis universitaria',
    description: 'Atención psicológica de emergencia 24/7',
    phone: '018000123456',
    icon: Phone,
    color: 'bg-primary',
  },
  {
    title: 'Línea 106',
    description: 'Atención a la salud mental - Colombia',
    phone: '106',
    icon: Phone,
    color: 'bg-secondary',
  },
  {
    title: 'Chat de apoyo',
    description: 'Habla con un profesional ahora mismo',
    phone: null,
    icon: MessageCircle,
    color: 'bg-red-500',
    action: true,
  },
];

const selfHelpTips = [
  'Respira profundamente: inhala 4 segundos, mantén 4 segundos, exhala 4 segundos.',
  'Busca un lugar seguro y tranquilo si es posible.',
  'Recuerda que esta sensación pasará.',
  'No estás solo/a. Hay personas que quieren ayudarte.',
  'Está bien pedir ayuda. Es un acto de valentía.',
];

const UrgentHelp = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Volver */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Volver al inicio</span>
      </button>

      {/* Header */}
      <div className="text-center py-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"
        >
          <AlertCircle size={40} className="text-red-500" />
        </motion.div>
        <h1 className="text-3xl font-display font-black text-on-surface">Ayuda Urgente</h1>
        <p className="text-on-surface-variant mt-2 max-w-md mx-auto">
          Si estás pasando por una crisis emocional, no estás solo/a. Aquí encontrarás recursos para obtener ayuda inmediata.
        </p>
      </div>

      {/* Recursos de emergencia */}
      <div className="space-y-3">
        {emergencyResources.map((resource, index) => (
          <motion.div key={resource.title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {resource.phone ? (
              <a href={`tel:${resource.phone}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl ${resource.color} flex items-center justify-center text-white shrink-0`}>
                  <resource.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-on-surface">{resource.title}</h3>
                  <p className="text-sm text-on-surface-variant">{resource.description}</p>
                  <p className="text-lg font-bold text-primary mt-1">{resource.phone}</p>
                </div>
              </a>
            ) : (
              <button className="w-full flex items-center gap-4 bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-5 hover:shadow-md transition-shadow text-left">
                <div className={`w-14 h-14 rounded-xl ${resource.color} flex items-center justify-center text-white shrink-0`}>
                  <resource.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-on-surface">{resource.title}</h3>
                  <p className="text-sm text-on-surface-variant">{resource.description}</p>
                  <p className="text-sm font-bold text-red-500 mt-1">Iniciar chat ahora</p>
                </div>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mientras esperas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Heart size={24} className="text-secondary" />
          <h2 className="font-bold text-on-surface">Mientras esperas ayuda</h2>
        </div>
        <ul className="space-y-3">
          {selfHelpTips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-on-surface-variant">
              <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                {index + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Nota importante */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-on-surface">Si es una emergencia médica</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Llama inmediatamente al <strong>123</strong> (Número único de emergencias) o acude al servicio de urgencias más cercano.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgentHelp;
