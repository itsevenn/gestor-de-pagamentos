'use client';

import { useState, useEffect } from 'react';
import { useCiclistas, useInvoices } from '@/context/app-context';

export function useStatistics() {
  const { ciclistas } = useCiclistas();
  const { invoices } = useInvoices();
  const [statistics, setStatistics] = useState({
    totalCiclistas: 0,
    totalInvoices: 0,
    totalReceived: 0
  });

  useEffect(() => {
    // Calcular estatísticas
    const totalCiclistas = ciclistas.length;
    const totalInvoices = invoices.length;
    
    // Calcular total recebido (faturas pagas)
    const totalReceived = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.currentAmount, 0);

    setStatistics({
      totalCiclistas,
      totalInvoices,
      totalReceived
    });
  }, [ciclistas, invoices]);

  return statistics;
} 