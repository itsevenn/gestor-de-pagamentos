
'use client';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from '@/components/ui/button';
import { useInvoices, useCiclistas } from '@/context/app-context';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle, UserX, Edit, Eye, CheckCircle, Clock, FileText, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Invoice } from '@/lib/data';
import { AuthGuard } from '@/components/auth-guard';

type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Pix' | 'Boleto';

export default function InvoicesPage() {
  const { invoices, updateInvoice, loading: loadingInvoices } = useInvoices();
  const { ciclistas, deletedCiclistas, loading: loadingCiclistas } = useCiclistas();
  const allClients = [...ciclistas, ...deletedCiclistas];
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');

  const loading = loadingInvoices || loadingCiclistas;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const getCiclistaInfo = (ciclistaId: string) => {
    const ciclista = allClients.find(c => c.id === ciclistaId);
    const isDeleted = deletedCiclistas.some(c => c.id === ciclistaId);
    return {
      name: ciclista?.nomeCiclista || 'Ciclista Desconhecido',
      isDeleted,
      ciclista,
    };
  };
  
  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentMethod(invoice.paymentMethod || '');
  }

  const closePaymentDialog = () => {
    setSelectedInvoice(null);
    setPaymentMethod('');
  }

  const handleMarkAsPaid = () => {
    if (selectedInvoice && paymentMethod) {
      updateInvoice({ 
          ...selectedInvoice, 
          status: 'paid', 
          paymentMethod: paymentMethod as PaymentMethod,
          paymentDate: new Date().toISOString().split('T')[0],
      }, `marcada como paga com ${paymentMethod}. Valor: ${formatCurrency(selectedInvoice.currentAmount)}`);
      toast({
        title: 'Status da Fatura Atualizado!',
        description: `A fatura ${selectedInvoice.id.toUpperCase()} foi marcada como paga.`,
      });
      closePaymentDialog();
    } else {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Por favor, selecione um método de pagamento.',
        });
    }
  };

  const handleMarkAsPending = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if(invoice) {
      const { paymentDate, ...invoiceWithoutPaymentDate } = invoice;
      updateInvoice({ ...invoiceWithoutPaymentDate, status: 'pending' }, 'marcada como pendente.');
      toast({
        title: 'Status da Fatura Atualizado!',
        description: `A fatura ${invoice.id.toUpperCase()} foi marcada como pendente.`,
      });
    }
  };
  
  const statusConfig = {
    paid: { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700', label: 'Pago' },
    pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700', label: 'Pendente' },
    overdue: { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700', label: 'Atrasado' },
    refunded: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-700', label: 'Reembolsado' },
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col gap-8">
            {/* Header */}
        <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faturas</h1>
                <p className="text-gray-600 dark:text-gray-400">Gerencie todas as faturas do sistema</p>
              </div>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <Link href="/invoices/new">
                    <PlusCircle className="mr-2 h-5 w-5" />
                Criar Fatura
            </Link>
          </Button>
        </div>

            {/* Card Principal */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Todas as Faturas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Uma lista de todas as faturas em seu sistema.
                </CardDescription>
          </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                {invoices.map((invoice) => {
                      const ciclistaInfo = getCiclistaInfo(invoice.ciclistaId);
                  const isAmountAdjusted = invoice.currentAmount !== invoice.originalAmount;

                  return (
                        <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {invoice.id.toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">{ciclistaInfo.name}</span>
                              {ciclistaInfo.isDeleted && (
                                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                          <UserX className="h-3 w-3" />
                                          Excluído
                                      </Badge>
                                  )}
                              </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(invoice.currentAmount)}
                              </span>
                              {isAmountAdjusted && (
                                <s className="text-xs text-gray-500 dark:text-gray-400" title={`Valor Original: ${formatCurrency(invoice.originalAmount)}`}>
                                  {formatCurrency(invoice.originalAmount)}
                                </s>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <Badge variant={statusConfig[invoice.status].variant} className={cn('capitalize px-3 py-1', statusConfig[invoice.status].className)}>
                              {statusConfig[invoice.status].label}
                              </Badge>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {invoice.dueDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Link href={`/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                              <Link href={`/invoices/${invoice.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Abrir menu de ações" title="Abrir menu de ações">
                                    <span className="sr-only">Abrir menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <DropdownMenuLabel className="text-gray-900 dark:text-white">Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Link href={`/invoices/${invoice.id}`}>
                                      <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                    </Link>
                                  </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Link href={`/invoices/${invoice.id}/edit`}>
                                      <Edit className="mr-2 h-4 w-4" /> Editar Fatura
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openPaymentDialog(invoice); }} className="text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                                      <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Paga
                                    </DropdownMenuItem>
                                  )}
                                  {invoice.status === 'paid' && (
                                  <DropdownMenuItem onClick={() => handleMarkAsPending(invoice.id)} className="text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                                      <Clock className="mr-2 h-4 w-4" /> Marcar como Pendente
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                        </div>
                  );
              })}
                  </div>
                )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
      
      <AlertDialog open={!!selectedInvoice} onOpenChange={(open) => !open && closePaymentDialog()}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                Selecione o método de pagamento para confirmar que a fatura foi paga.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="payment-method" className="text-gray-700 dark:text-gray-300">Método de Pagamento</Label>
                <Select onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} defaultValue={paymentMethod}>
                    <SelectTrigger id="payment-method" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Selecione um método" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="Credit Card">Cartão de Crédito</SelectItem>
                        <SelectItem value="Bank Transfer">Transferência Bancária</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={closePaymentDialog} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPaid} className="bg-blue-600 hover:bg-blue-700 text-white">Confirmar Pagamento</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
}
