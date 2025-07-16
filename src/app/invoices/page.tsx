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
import { useInvoices, useClients } from '@/context/app-context';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle, UserX, Edit, Eye, CheckCircle, Clock } from 'lucide-react';
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

export default function InvoicesPage() {
  const { invoices, updateInvoice } = useInvoices();
  const { clients, deletedClients } = useClients();
  const allClients = [...clients, ...deletedClients];
  const { toast } = useToast();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const getClientInfo = (clientId: string) => {
    const client = allClients.find(c => c.id === clientId);
    const isDeleted = deletedClients.some(c => c.id === clientId);
    return {
        name: client?.nomeCiclista || 'Ciclista Desconhecido',
        isDeleted: isDeleted
    };
  };

  const handleStatusChange = (invoiceId: string, newStatus: 'paid' | 'pending') => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if(invoice) {
      updateInvoice({ ...invoice, status: newStatus });
      toast({
        title: 'Status da Fatura Atualizado!',
        description: `A fatura ${invoice.id.toUpperCase()} foi marcada como ${newStatus === 'paid' ? 'paga' : 'pendente'}.`,
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Faturas</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Fatura
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Faturas</CardTitle>
          <CardDescription>Uma lista de todas as faturas em seu sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID da Fatura</TableHead>
                <TableHead>Ciclista</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const clientInfo = getClientInfo(invoice.clientId);
                return (
                    <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id.toUpperCase()}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {clientInfo.name}
                                {clientInfo.isDeleted && (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                        <UserX className="h-3 w-3" />
                                        Excluído
                                    </Badge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.currentAmount)}</TableCell>
                        <TableCell>
                            <Badge variant={statusConfig[invoice.status].variant} className={cn('capitalize', statusConfig[invoice.status].className)}>
                            {statusConfig[invoice.status].label}
                            </Badge>
                        </TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/invoices/${invoice.id}`}>
                                    <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/invoices/${invoice.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar Fatura
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Paga
                                  </DropdownMenuItem>
                                )}
                                {invoice.status === 'paid' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'pending')}>
                                    <Clock className="mr-2 h-4 w-4" /> Marcar como Pendente
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                );
            })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
