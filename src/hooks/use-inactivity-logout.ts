import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export const useInactivityLogout = (timeoutMinutes: number = 10) => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const resetTimer = () => {
    // Limpar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Esconder aviso se estiver visível
    setShowWarning(false);

    if (!isAuthenticated) return;

    // Timer de aviso (1 minuto antes do logout)
    const warningTime = (timeoutMinutes - 1) * 60 * 1000;
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
    }, warningTime);

    // Timer principal de logout
    const logoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(async () => {
      console.log('🕐 Logout automático por inatividade');
      await logout();
      router.push('/login');
    }, logoutTime);
  };

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    resetTimer(); // Resetar timer se usuário escolher continuar
  };

  const handleLogoutNow = async () => {
    setShowWarning(false);
    console.log('🕐 Logout manual por inatividade');
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Limpar timers se não estiver autenticado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      setShowWarning(false);
      return;
    }

    // Eventos que resetam o timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'visibilitychange'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Adicionar listeners para todos os eventos
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Iniciar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isAuthenticated, timeoutMinutes, logout, router]);

  return { 
    resetTimer, 
    showWarning, 
    handleStayLoggedIn, 
    handleLogoutNow 
  };
}; 