import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-secondary-container rounded-full opacity-20 animate-pulse" />
            <Scale size={56} className="text-secondary z-10" />
          </div>
        </motion.div>

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-8xl font-display font-black text-primary mb-2">404</h1>
          <p className="font-display text-xl font-bold text-on-surface mb-2">
            Página no encontrada
          </p>
          <p className="text-on-surface-variant text-sm mb-8">
            La página que buscas no existe o fue movida.
          </p>
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold text-sm transition-colors"
          >
            <ArrowLeft size={18} />
            Volver atrás
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-white hover:bg-secondary/90 font-semibold text-sm shadow-lg shadow-secondary/20 transition-colors"
          >
            <Home size={18} />
            Ir al inicio
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 italic text-on-surface-variant/50 text-xs"
        >
          "El equilibrio no es algo que encuentras, es algo que creas."
        </motion.p>

      </div>
    </div>
  );
};

export default NotFound;