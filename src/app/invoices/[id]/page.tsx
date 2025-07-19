'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInvoices, useCiclistas, useAuditLogs } from '@/context/app-context';
import Link from 'next/link';
import { ArrowLeft, Receipt, User, Calendar, CreditCard, CheckCircle, Clock, AlertTriangle, DollarSign, FileText, Activity, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceChangesHistory } from '@/components/invoice-changes-history';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { invoices } = useInvoices();
  const { ciclistas } = useCiclistas();
  const { auditLogs } = useAuditLogs();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('details');

  const invoice = invoices.find((inv) => inv.id === id);
  const ciclista = ciclistas.find((c) => c.id === invoice?.ciclistaId);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fatura não encontrada</h1>
            <Button asChild>
              <Link href="/invoices">Voltar para Lista</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    paid: { 
      variant: 'secondary', 
      className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md', 
      label: 'Pago',
      icon: <CheckCircle className="h-4 w-4" />
    },
    pending: { 
      variant: 'secondary', 
      className: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-md', 
      label: 'Pendente',
      icon: <Clock className="h-4 w-4" />
    },
    overdue: { 
      variant: 'destructive', 
      className: 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-md', 
      label: 'Atrasado',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    refunded: { 
      variant: 'secondary', 
      className: 'bg-gradient-to-r from-slate-500 to-gray-600 text-white border-0 shadow-md', 
      label: 'Reembolsado',
      icon: <FileText className="h-4 w-4" />
    },
  };

  const currentStatus = statusConfig[invoice.status as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              asChild
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
            >
              <Link href="/invoices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Fatura {invoice.id.toUpperCase()}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Detalhes completos da fatura
                </p>
              </div>
            </div>
            <Badge variant={currentStatus.variant} className={cn('capitalize', currentStatus.className)}>
              {currentStatus.icon}
              <span className="ml-1">{currentStatus.label}</span>
            </Badge>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo Principal com Abas */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
                  <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-slate-700 dark:to-slate-600">
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                        <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      Informações da Fatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="text-blue-500">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ID da Fatura</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{invoice.id.toUpperCase()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="text-green-500">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Valor</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">R$ {Number(invoice.currentAmount).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-orange-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="text-orange-500">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Data de Vencimento</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{invoice.dueDate}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="text-purple-500">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ciclista</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{ciclista?.nomeCiclista || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="text-indigo-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{currentStatus.label}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-pink-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="text-pink-500">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Data de Criação</p>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">{invoice.createdAt || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-700 dark:to-slate-600">
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      Histórico de Atividades da Fatura
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Todas as ações realizadas nesta fatura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <InvoiceChangesHistory invoiceId={invoice.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar com Ações */}
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    <Link href={`/invoices/${invoice.id}/edit`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Editar Fatura
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Link href={`/ciclistas/${ciclista?.id}`}>
                      <User className="w-4 h-4 mr-2" />
                      Ver Ciclista
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Link href="/invoices">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar à Lista
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status da Fatura */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  Status da Fatura
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <Badge variant={currentStatus.variant} className={cn('capitalize text-lg px-4 py-2', currentStatus.className)}>
                    {currentStatus.icon}
                    <span className="ml-2">{currentStatus.label}</span>
                  </Badge>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    {invoice.status === 'paid' && 'Esta fatura foi paga com sucesso.'}
                    {invoice.status === 'pending' && 'Esta fatura está aguardando pagamento.'}
                    {invoice.status === 'overdue' && 'Esta fatura está vencida e precisa ser paga.'}
                    {invoice.status === 'refunded' && 'Esta fatura foi reembolsada.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
