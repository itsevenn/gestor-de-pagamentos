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
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ClientProfilePDF } from '@/components/client-profile-pdf';
import type { Client } from '@/lib/data';

export default function ReportsPage() {
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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

  const handleClientChange = (clientId: string) => {
      setSelectedClientId(clientId);
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client || null);
  }

  const handleGeneratePdf = async () => {
    if (!selectedClient) return;

    setIsGenerating(true);
    const pdfContainer = document.getElementById('pdf-container');
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
        const newHeight = pdfWidth / ratio;
        
        // Se a altura for maior que a página, precisará de múltiplas páginas
        // Esta implementação é simplificada para uma página.
        if (newHeight <= pdfHeight) {
           pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, newHeight);
        } else {
           pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save(`perfil_${selectedClient.nomeCiclista.replace(/ /g, '_')}.pdf`);
    }
    setIsGenerating(false);
  };

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

       <Card>
          <CardHeader>
            <CardTitle>Relatório de Ciclista</CardTitle>
            <CardDescription>Gere um arquivo PDF com o perfil completo de um ciclista.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="max-w-sm space-y-2">
                <Label htmlFor="client-select">Selecione um Ciclista</Label>
                <Select onValueChange={handleClientChange}>
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
              <Button onClick={handleGeneratePdf} disabled={!selectedClientId || isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Gerando...' : 'Exportar Perfil para PDF'}
              </Button>
          </CardContent>
        </Card>

        {/* Hidden component for PDF generation */}
        <div className="absolute -left-[9999px] top-auto w-[800px]">
           {selectedClient && <div id="pdf-container"><ClientProfilePDF client={selectedClient} /></div>}
        </div>
    </div>
  );
}
