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
import { useInvoices, useClients } from '@/context/app-context';

export default function ReportsPage() {
  const { invoices } = useInvoices();
  const { clients } = useClients();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.nomeCiclista || 'Cliente Desconhecido';
  };

  const monthlyReceivables = invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => {
    const month = new Date(inv.issueDate).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += inv.originalAmount;
    return acc;
  }, {} as Record<string, number>);

  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Relatórios</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recebimentos Mensais</CardTitle>
            <CardDescription>Total recebido por mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Total Recebido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(monthlyReceivables).map(([month, total]) => (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{month}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes Inadimplentes</CardTitle>
            <CardDescription>Faturas que estão atualmente atrasadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{getClientName(invoice.clientId)}</TableCell>
                    <TableCell className='text-destructive'>{formatCurrency(invoice.currentAmount)}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
