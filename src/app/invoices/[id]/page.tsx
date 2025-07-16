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
import { invoices, clients, auditLogs } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Calendar, FileText, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationGenerator } from '@/components/notification-generator';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = invoices.find((inv) => inv.id === params.id);

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const client = clients.find((c) => c.id === invoice.clientId);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const statusConfig = {
    paid: { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700' },
    pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700' },
    overdue: { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700' },
    refunded: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-700' },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/invoices"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Invoice {invoice.id.toUpperCase()}</h1>
        <Badge variant={statusConfig[invoice.status].variant} className={cn('capitalize text-base', statusConfig[invoice.status].className)}>
          {invoice.status}
        </Badge>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="notifications">Smart Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Issued on {invoice.issueDate} to {client?.name}.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <h3 className="font-semibold">Client Information</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Link href={`/clients/${client?.id}`} className="text-primary hover:underline">{client?.name}</Link>
                    </div>
                    <p className="text-sm text-muted-foreground">{client?.contact.email}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold">Payment Details</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Original Amount: {formatCurrency(invoice.originalAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Current Amount Due: {formatCurrency(invoice.currentAmount)}</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Method: {invoice.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due Date: {invoice.dueDate}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>History of all changes related to this invoice.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {auditLogs.map(log => (
                            <TableRow key={log.id}>
                                <TableCell>{log.date}</TableCell>
                                <TableCell>{log.user}</TableCell>
                                <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                                <TableCell>{log.details}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationGenerator invoice={invoice} client={client!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
