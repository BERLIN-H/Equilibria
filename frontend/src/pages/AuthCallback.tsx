import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const AuthCallback = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // Supabase emite el evento cuando procesa el hash de la URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const res = await fetch('/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
            });

            if (!res.ok) {
              const body = await res.json();
              subscription.unsubscribe();
              if (body.error?.includes('uniguajira')) {
                navigate('/?error=dominio');
              } else {
                navigate('/?error=auth');
              }
              return;
            }

            const data = await res.json();
            setAuth(data.user, session.access_token);
            subscription.unsubscribe();
            navigate('/dashboard');
          } catch {
            subscription.unsubscribe();
            navigate('/?error=auth');
          }
        } else if (event === 'SIGNED_OUT') {
          subscription.unsubscribe();
          navigate('/');
        }
      }
    );

    // Timeout por si el evento nunca llega
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      navigate('/');
    }, 10000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-on-surface-variant">Verificando cuenta institucional...</p>
    </div>
  );
};

export default AuthCallback;