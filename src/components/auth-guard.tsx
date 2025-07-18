'use client';

import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Logout automático após 20 minutos de inatividade
  useEffect(() => {
    if (!isAuthenticated) return;
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logout && logout();
      }, 20 * 60 * 1000); // 20 minutos
    };
    // Eventos de atividade
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, logout]);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}