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
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ClientProfilePDF } from '@/components/client-profile-pdf';
import { PaymentReceiptPDF } from '@/components/payment-receipt-pdf';
import type { Client, Invoice } from '@/lib/data';

export default function ReportsPage() {
  const { invoices } = useInvoices();
  const { clients } = useClients();

  const [selectedProfileClientId, setSelectedProfileClientId] = useState<string | null>(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const selectedProfileClient = useMemo(() => clients.find(c => c.id === selectedProfileClientId) || null, [clients, selectedProfileClientId]);

  const [selectedReceiptInvoiceId, setSelectedReceiptInvoiceId] = useState<string | null>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  
  const paidInvoices = useMemo(() => invoices.filter(inv => inv.status === 'paid'), [invoices]);
  const selectedReceiptInvoice = useMemo(() => paidInvoices.find(inv => inv.id === selectedReceiptInvoiceId) || null, [paidInvoices, selectedReceiptInvoiceId]);
  const receiptClient = useMemo(() => clients.find(c => c.id === selectedReceiptInvoice?.clientId) || null, [clients, selectedReceiptInvoice]);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.nomeCiclista || 'Ciclista Desconhecido';
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

  const generatePdf = async (elementId: string, fileName: string) => {
    const pdfContainer = document.getElementById(elementId);
    if (pdfContainer) {
        const canvas = await html2canvas(pdfContainer, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let newHeight = pdfWidth / ratio;
        
        if (newHeight > pdfHeight) {
           newHeight = pdfHeight;
        }

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, newHeight);
        pdf.save(fileName);
    }
  }

  const handleGenerateProfilePdf = async () => {
    if (!selectedProfileClient) return;
    setIsGeneratingProfile(true);
    await generatePdf('profile-pdf-container', `perfil_${selectedProfileClient.nomeCiclista.replace(/ /g, '_')}.pdf`);
    setIsGeneratingProfile(false);
  };

  const handleGenerateReceiptPdf = async () => {
    if (!selectedReceiptInvoice) return;
    setIsGeneratingReceipt(true);
    await generatePdf('receipt-pdf-container', `recibo_${selectedReceiptInvoice.id.toUpperCase()}.pdf`);
    setIsGeneratingReceipt(false);
  }

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
            <CardTitle>Ciclistas Inadimplentes</CardTitle>
            <CardDescription>Faturas que estão atualmente atrasadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ciclista</TableHead>
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

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
              <CardTitle>Relatório de Ciclista</CardTitle>
              <CardDescription>Gere um arquivo PDF com o perfil completo de um ciclista.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="client-select">Selecione um Ciclista</Label>
                  <Select onValueChange={setSelectedProfileClientId}>
                      <SelectTrigger id="client-select">
                          <SelectValue placeholder="Escolha um ciclista..." />
                      </SelectTrigger>
                      <SelectContent>
                          {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>{client.nomeCiclista}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateProfilePdf} disabled={!selectedProfileClientId || isGeneratingProfile} variant="secondary">
                  {isGeneratingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {isGeneratingProfile ? 'Gerando...' : 'Exportar Perfil para PDF'}
                </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comprovante de Pagamento</CardTitle>
              <CardDescription>Gere um comprovante em PDF para uma fatura paga.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="invoice-select">Selecione uma Fatura Paga</Label>
                  <Select onValueChange={setSelectedReceiptInvoiceId}>
                      <SelectTrigger id="invoice-select">
                          <SelectValue placeholder="Escolha uma fatura..." />
                      </SelectTrigger>
                      <SelectContent>
                          {paidInvoices.map(invoice => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                                  {`Fatura ${invoice.id.toUpperCase()} - ${getClientName(invoice.clientId)} - ${formatCurrency(invoice.currentAmount)}`}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateReceiptPdf} disabled={!selectedReceiptInvoiceId || isGeneratingReceipt}>
                  {isGeneratingReceipt ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {isGeneratingReceipt ? 'Gerando...' : 'Exportar Comprovante para PDF'}
                </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hidden components for PDF generation */}
        <div className="absolute -left-[9999px] top-auto w-[800px] bg-white">
           {selectedProfileClient && <div id="profile-pdf-container"><ClientProfilePDF client={selectedProfileClient} /></div>}
           {selectedReceiptInvoice && receiptClient && <div id="receipt-pdf-container"><PaymentReceiptPDF invoice={selectedReceiptInvoice} client={receiptClient} /></div>}
        </div>
    </div>
  );
}
