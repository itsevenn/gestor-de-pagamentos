'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';

interface InactivityWarningProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  countdown: number;
}

export function InactivityWarning({ isOpen, onStayLoggedIn, onLogout, countdown }: InactivityWarningProps) {
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onLogout]);

  useEffect(() => {
    setTimeLeft(countdown);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-amber-700 dark:text-amber-400">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            Sessão Expirada
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-medium">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300">
              Sua sessão será encerrada automaticamente por inatividade.
            </p>
            
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Clique em "Continuar" para manter sua sessão ativa.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onLogout}
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Sair Agora
          </Button>
          <Button
            onClick={onStayLoggedIn}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 