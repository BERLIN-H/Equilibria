import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

 const handleGoogleLogin = async () => {
  setError('');
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: 'uniguajira.edu.co',
          prompt: 'select_account', // ← fuerza el selector de cuenta
        },
      },
    });
    if (error) throw error;
  } catch (err: any) {
    setError('Error al iniciar sesión con Google');
    setLoading(false);
  }
};

  return (
    <div className="bg-pattern min-h-screen flex items-center justify-center p-6 font-sans text-on-surface">
      <main className="w-full max-w-[480px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl login-card-shadow p-8 md:p-12 border border-outline-variant/30 relative overflow-hidden"
        >
          <header className="text-center mb-10">
            <h1 className="font-display text-2xl font-medium text-on-surface mb-8 tracking-tight">
              Servicio de Bienestar Equilibria
            </h1>

            <div className="flex justify-center items-center mb-10">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-secondary-container rounded-full opacity-20 animate-pulse"></div>
                <div className="z-10 text-secondary">
                  <Scale size={72} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-display text-xl font-bold text-primary tracking-wide">EQUILIBRIA</p>
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-outline">
                Centro de Apoyo Psicológico
              </p>
            </div>
          </header>

          <div className="space-y-6">
            <p className="text-on-surface-variant text-[14px] leading-relaxed text-center">
              Accede con tu cuenta institucional de la Universidad de La Guajira
              para gestionar tus citas y sesiones.
            </p>

            {error && (
              <p className="text-error text-sm text-center font-medium">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-medium text-base py-4 rounded-lg shadow border border-gray-200 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              {loading ? 'Redirigiendo...' : 'Continuar con Google Institucional'}
            </motion.button>

            <p className="text-outline text-[12px] text-center">
              Solo se permiten cuentas <strong>@uniguajira.edu.co</strong>
            </p>
          </div>

          <footer className="mt-8 pt-8 border-t border-outline-variant/30 flex justify-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span className="text-outline text-[12px] font-semibold">Servidor Institucional Seguro</span>
            </div>
          </footer>
        </motion.div>

        <div className="mt-8 text-center px-4">
          <p className="italic text-on-surface-variant/60 text-[14px]">
            "El equilibrio no es algo que encuentras, es algo que creas."
          </p>
        </div>
      </main>

      <div className="fixed bottom-10 right-10 hidden md:block">
        <button className="bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold text-[12px] px-6 py-3 rounded-full flex items-center gap-2 transition-colors border border-outline-variant/20 shadow-sm">
          <HelpCircle size={18} />
          <span>Centro de Ayuda</span>
        </button>
      </div>
    </div>
  );
};

export default Login;