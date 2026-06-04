import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, Eye, EyeOff, ArrowRight, HelpCircle, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
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
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-outline">Centro de Apoyo Psicológico</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                <User size={20} />
              </div>
              <input 
                className="w-full bg-[#E8F4F8] border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary transition-all text-base" 
                placeholder="Correo institucional"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group flex">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                <Key size={20} />
              </div>
              <input 
                className="flex-grow bg-[#E8F4F8] border-none rounded-l-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary transition-all text-base" 
                placeholder="Contraseña"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="bg-[#E8F4F8] border-l border-outline-variant/30 rounded-r-lg px-4 flex items-center text-outline hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-error text-sm text-center font-medium">{error}</p>
            )}
            <div className="pt-2">
              <p className="text-on-surface-variant text-[14px] leading-relaxed text-center sm:text-left">
                Accede con tus credenciales institucionales del portal SMA para gestionar tus citas y sesiones.
              </p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-60 text-white font-display text-lg py-4 rounded-lg shadow-lg shadow-secondary/20 transition-all duration-200 flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
              <ArrowRight size={18} />
            </motion.button>
          </form>

          <footer className="mt-8 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <button className="text-secondary text-[12px] font-semibold hover:underline">¿Olvidaste tu contraseña?</button>
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
