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
import { PlusCircle, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoicesPage() {
  const { invoices } = useInvoices();
  const { clients, deletedClients } = useClients();
  const allClients = [...clients, ...deletedClients];

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const getClientInfo = (clientId: string) => {
    const client = allClients.find(c => c.id === clientId);
    const isDeleted = deletedClients.some(c => c.id === clientId);
    return {
        name: client?.nomeCiclista || 'Cliente Desconhecido',
        isDeleted: isDeleted
    };
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
                <TableHead>Cliente</TableHead>
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
                            <Button asChild variant="outline" size="sm">
                            <Link href={`/invoices/${invoice.id}`}>Ver Detalhes</Link>
                            </Button>
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
