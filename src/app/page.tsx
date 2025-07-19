
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInvoices, useCiclistas } from '@/context/app-context';
import { AlertCircle, ArrowRight, DollarSign, Receipt, RefreshCw, TrendingUp, Users, FileText, BarChart3, Settings, User, Calendar, Clock, Award, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { AuthGuard } from '@/components/auth-guard';

export default function Home() {
  const { invoices, loading: loadingInvoices } = useInvoices();
  const { ciclistas, deletedCiclistas, loading: loadingCiclistas } = useCiclistas();
  const { toast } = useToast();
  
  // Estado para o carrossel de imagens
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Efeito para mudança automática das imagens do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 4);
    }, 4000); // Muda a cada 4 segundos

    return () => clearInterval(interval);
  }, []);
  

  
  const loading = loadingInvoices || loadingCiclistas;

  const allClients = [...ciclistas, ...deletedCiclistas];

  const totalDue = invoices.reduce((acc, inv) => (inv.status === 'pending' || inv.status === 'overdue') ? acc + Number(inv.currentAmount) : acc, 0);
  const totalReceived = invoices.reduce((acc, inv) => inv.status === 'paid' ? acc + Number(inv.currentAmount) : acc, 0);
  const totalRefunds = invoices.reduce((acc, inv) => inv.status === 'refunded' ? acc + Number(inv.originalAmount) : acc, 0);
  const totalOverdue = invoices.reduce((acc, inv) => inv.status === 'overdue' ? acc + Number(inv.currentAmount) : acc, 0);

  // Cálculo de totais por mês
  const now = new Date();
  const startCurrentMonth = startOfMonth(now);
  const endCurrentMonth = endOfMonth(now);
  const startPrevMonth = startOfMonth(subMonths(now, 1));
  const endPrevMonth = endOfMonth(subMonths(now, 1));

  // Faturas pagas do mês atual
  const paidCurrentMonth = invoices.filter(inv => {
    if (inv.status !== 'paid' || !inv.paymentDate) return false;
    const date = parseISO(inv.paymentDate);
    return isWithinInterval(date, { start: startCurrentMonth, end: endCurrentMonth });
  });
  // Faturas pagas do mês anterior
  const paidPrevMonth = invoices.filter(inv => {
    if (inv.status !== 'paid' || !inv.paymentDate) return false;
    const date = parseISO(inv.paymentDate);
    return isWithinInterval(date, { start: startPrevMonth, end: endPrevMonth });
  });

  const totalReceivedCurrentMonth = paidCurrentMonth.reduce((acc, inv) => acc + Number(inv.currentAmount), 0);
  const totalReceivedPrevMonth = paidPrevMonth.reduce((acc, inv) => acc + Number(inv.currentAmount), 0);

  // Cálculo da variação percentual
  let percentChangeMsg = '';
  if (totalReceivedPrevMonth > 0) {
    const percentChange = ((totalReceivedCurrentMonth - totalReceivedPrevMonth) / totalReceivedPrevMonth) * 100;
    percentChangeMsg = `${percentChange.toFixed(1)}% do último mês`;
  } else if (totalReceivedCurrentMonth > 0) {
    percentChangeMsg = 'Novo recebimento este mês';
  } else {
    percentChangeMsg = '0% do último mês';
  }

  const getCiclistaName = (ciclistaId: string) => {
    return allClients.find(c => c.id === ciclistaId)?.nomeCiclista || 'Ciclista Desconhecido';
  };
  
  const getCiclistaContact = (ciclistaId: string) => {
    return allClients.find(c => c.id === ciclistaId)?.celular || '';
  }



  useEffect(() => {
    const today = new Date();
    // Only show toasts for active clients' invoices
    const activeCiclistaIds = new Set(ciclistas.map(c => c.id));
    const activeInvoices = invoices.filter(inv => activeCiclistaIds.has(inv.ciclistaId));

    activeInvoices.forEach(invoice => {
      if (invoice.status === 'overdue') {
        toast({
          variant: 'destructive',
          title: 'Fatura Atrasada!',
          description: `A fatura ${invoice.id.toUpperCase()} para ${getCiclistaName(invoice.ciclistaId)} está atrasada.`,
          action: (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/invoices/${invoice.id}`}>Ver Fatura</Link>
            </Button>
          )
        });
      } else if (invoice.status === 'pending') {
        const dueDate = parseISO(invoice.dueDate);
        const daysUntilDue = differenceInDays(dueDate, today);

        if (daysUntilDue >= 0 && daysUntilDue <= 7) {
            toast({
              title: 'Vencimento Próximo',
              description: `A fatura ${invoice.id.toUpperCase()} para ${getCiclistaName(invoice.ciclistaId)} vence em ${daysUntilDue} dia(s).`,
              action: (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/invoices/${invoice.id}`}>Ver Fatura</Link>
                </Button>
              )
            });
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const statusConfig = {
    paid: {
      variant: 'secondary',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700',
      label: 'Pago'
    },
    pending: {
      variant: 'secondary',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      label: 'Pendente'
    },
    overdue: {
      variant: 'destructive',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700',
      label: 'Atrasado'
    },
    refunded: {
      variant: 'secondary',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      label: 'Reembolsado'
    },
  };

  if (loading) {
    // Skeleton para cards e tabela
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel</h1>
                <p className="text-gray-600 dark:text-gray-400">Visão geral do seu sistema de gestão</p>
              </div>

              {/* Cards de Métricas */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tabela de Faturas */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-48 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-500 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col gap-8">
            {/* Hero Section - Ciclismo e Saúde */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 shadow-2xl">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative px-8 py-12 md:px-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Texto */}
                  <div className="text-white space-y-6">
                    <div className="space-y-4">
                      <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        <span className="text-blue-100">Gerencie seus</span>
                        <br />
                        <span className="text-white">ciclistas com eficiência!</span>
                      </h1>
                      <p className="text-xl text-blue-100 leading-relaxed">
                        Encontre tudo o que você precisa para administrar seu clube de ciclismo em um só lugar!
                      </p>
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-200 hover:text-blue-800 font-semibold px-8 py-3 border border-blue-400 shadow-md hover:shadow-lg transition-all duration-200">
                        <Link href="/ciclistas/new">
                          Adicionar Ciclista
                        </Link>
                      </Button>
                      <Button asChild size="lg" className="bg-white text-gray-600 hover:bg-gray-200 hover:text-gray-800 font-semibold px-8 py-3 border border-gray-400 shadow-md hover:shadow-lg transition-all duration-200">
                        <Link href="/invoices/new">
                          Nova Fatura
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Card Grande com Carrossel de Imagens */}
                  <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden h-96">
                    <div className="relative w-full h-full">
                      {/* Imagens do Carrossel */}
                      <div className="relative w-full h-full">
                        <img 
                          src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=400&fit=crop&crop=center" 
                          alt="Bicicletas"
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            currentImageIndex === 0 ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center" 
                          alt="Saúde"
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            currentImageIndex === 1 ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=400&fit=crop&crop=center" 
                          alt="Performance"
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            currentImageIndex === 2 ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=400&fit=crop&crop=center" 
                          alt="Comunidade"
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            currentImageIndex === 3 ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </div>
                      
                      {/* Gradiente e Texto */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">
                          {currentImageIndex === 0 && "Bicicletas"}
                          {currentImageIndex === 1 && "Saúde"}
                          {currentImageIndex === 2 && "Performance"}
                          {currentImageIndex === 3 && "Comunidade"}
                        </h3>
                        <p className="text-blue-100 text-lg">
                          {currentImageIndex === 0 && "Gestão completa"}
                          {currentImageIndex === 1 && "Bem-estar total"}
                          {currentImageIndex === 2 && "Acompanhamento"}
                          {currentImageIndex === 3 && "Clube unido"}
                        </p>
                      </div>
                      
                      {/* Indicadores de Página */}
                      <div className="absolute bottom-4 right-6 flex space-x-2">
                        {[0, 1, 2, 3].map((index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              currentImageIndex === index 
                                ? 'bg-white' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              

            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel</h1>
              <p className="text-gray-600 dark:text-gray-400">Visão geral do seu sistema de gestão</p>
            </div>

            {/* Cards de Métricas */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    Total Recebido
                  </CardTitle>
          </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {formatCurrency(totalReceived)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{percentChangeMsg}</p>
          </CardContent>
        </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Total a Receber
                  </CardTitle>
          </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {formatCurrency(totalDue)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pagamentos pendentes</p>
          </CardContent>
        </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    Vencido
                  </CardTitle>
          </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {formatCurrency(totalOverdue)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Requer atenção imediata</p>
          </CardContent>
        </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Reembolsos
                  </CardTitle>
          </CardHeader>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {formatCurrency(totalRefunds)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Processado este mês</p>
          </CardContent>
        </Card>
      </div>

            {/* Tabela de Faturas Recentes */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
                      <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
                    Faturas Recentes
                  </CardTitle>
                  <Button asChild variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Link href="/invoices">
                      Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
          </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Uma visão geral de suas faturas mais recentes.</p>
        </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
              {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {getCiclistaName(invoice.ciclistaId)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getCiclistaContact(invoice.ciclistaId)}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mx-6">
                        {formatCurrency(invoice.currentAmount)}
                      </div>
                      <Badge variant={statusConfig[invoice.status].variant} className={cn('capitalize px-3 py-1', statusConfig[invoice.status].className)}>
                      {statusConfig[invoice.status].label}
                    </Badge>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mx-6">
                        {invoice.dueDate}
                      </div>
                      <Button asChild variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Link href={`/invoices/${invoice.id}`}>Ver Detalhes</Link>
                    </Button>
                    </div>
              ))}
                </div>
        </CardContent>
      </Card>
    </div>
        </div>
      </div>
    </AuthGuard>
  );
}
