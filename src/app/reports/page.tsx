
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
import { useInvoices, useCiclistas } from '@/context/app-context';
import { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, Loader2, BarChart3, TrendingUp, AlertTriangle, FileText, Receipt, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CiclistaProfilePDF } from '@/components/ciclista-profile-pdf';
import { PaymentReceiptPDF } from '@/components/payment-receipt-pdf';
import type { Ciclista, Invoice } from '@/lib/data';
import { AuthGuard } from '@/components/auth-guard';

export default function ReportsPage() {
  const { invoices, loading: loadingInvoices } = useInvoices();
  const { ciclistas, loading: loadingCiclistas } = useCiclistas();

  const loading = loadingInvoices || loadingCiclistas;

  const [selectedProfileCiclistaId, setSelectedProfileCiclistaId] = useState<string | null>(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const selectedProfileCiclista = useMemo(() => ciclistas.find(c => c.id === selectedProfileCiclistaId) || null, [ciclistas, selectedProfileCiclistaId]);

  const [selectedReceiptInvoiceId, setSelectedReceiptInvoiceId] = useState<string | null>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  
  const [monthlyReceivables, setMonthlyReceivables] = useState<Record<string, number>>({});

  const paidInvoices = useMemo(() => invoices.filter(inv => inv.status === 'paid'), [invoices]);
  const selectedReceiptInvoice = useMemo(() => paidInvoices.find(inv => inv.id === selectedReceiptInvoiceId) || null, [paidInvoices, selectedReceiptInvoiceId]);
  const receiptCiclista = useMemo(() => ciclistas.find(c => c.id === selectedReceiptInvoice?.ciclistaId) || null, [ciclistas, selectedReceiptInvoice]);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const getCiclistaName = (ciclistaId: string) => {
    return ciclistas.find(c => c.id === ciclistaId)?.nomeCiclista || 'Ciclista Desconhecido';
  };
  
  useEffect(() => {
    const receivables = invoices
      .filter(inv => inv.status === 'paid' && inv.paymentDate)
      .reduce((acc, inv) => {
        // Usa a data de pagamento para agrupar por mês/ano
        const date = new Date(`${inv.paymentDate}T00:00:00`);
      const month = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      if (!acc[capitalizedMonth]) {
        acc[capitalizedMonth] = 0;
      }
        acc[capitalizedMonth] += Number(inv.currentAmount);
      return acc;
    }, {} as Record<string, number>);
    setMonthlyReceivables(receivables);
  }, [invoices]);

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
    if (!selectedProfileCiclista) return;
    setIsGeneratingProfile(true);
    await generatePdf('profile-pdf-container', `perfil_${selectedProfileCiclista.nomeCiclista.replace(/ /g, '_')}.pdf`);
    setIsGeneratingProfile(false);
  };

  const handleGenerateReceiptPdf = async () => {
    if (!selectedReceiptInvoice) return;
    setIsGeneratingReceipt(true);
    await generatePdf('receipt-pdf-container', `recibo_${selectedReceiptInvoice.id.toUpperCase()}.pdf`);
    setIsGeneratingReceipt(false);
  }

  if (loading) {
  return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
                <p className="text-gray-600 dark:text-gray-400">Análises e exportações do sistema</p>
              </div>

              {/* Cards de Relatórios */}
      <div className="grid gap-6 md:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-4 w-32 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
                      <div className="space-y-4">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cards de Exportação */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-4 w-32 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="space-y-2 w-full">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        <div className="h-10 w-full bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
                      </div>
                      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
              <p className="text-gray-600 dark:text-gray-400">Análises e exportações do sistema</p>
            </div>

            {/* Cards de Relatórios */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    Recebimentos Mensais
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Total recebido por mês.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                {Object.entries(monthlyReceivables).map(([month, total]) => (
                      <div key={month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{month}</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(total)}</span>
                      </div>
                ))}
                  </div>
          </CardContent>
        </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    Ciclistas Inadimplentes
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Faturas que estão atualmente atrasadas.
                  </CardDescription>
          </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                {overdueInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {getCiclistaName(invoice.ciclistaId)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Vencimento: {invoice.dueDate}
                          </div>
                        </div>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(invoice.currentAmount)}
                        </span>
                      </div>
                    ))}
                    {overdueInvoices.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Nenhuma fatura atrasada encontrada
                      </div>
                    )}
                  </div>
          </CardContent>
        </Card>
      </div>

            {/* Cards de Exportação */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Relatório de Ciclista
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Gere um arquivo PDF com o perfil completo de um ciclista.
                  </CardDescription>
            </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 w-full">
                      <Label htmlFor="client-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Selecione um Ciclista</Label>
                      <Select onValueChange={setSelectedProfileCiclistaId}>
                        <SelectTrigger id="client-select" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Escolha um ciclista..." />
                      </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {ciclistas.map(ciclista => (
                            <SelectItem key={ciclista.id} value={ciclista.id}>{ciclista.nomeCiclista}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                    <Button 
                      onClick={handleGenerateProfilePdf} 
                      disabled={!selectedProfileCiclistaId || isGeneratingProfile} 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full md:w-auto flex-shrink-0"
                    >
                      {isGeneratingProfile ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                  {isGeneratingProfile ? 'Gerando...' : 'Exportar Perfil'}
                </Button>
                  </div>
            </CardContent>
          </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Comprovante de Pagamento
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Gere um comprovante em PDF para uma fatura paga.
                  </CardDescription>
            </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 w-full">
                      <Label htmlFor="invoice-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Selecione uma Fatura Paga</Label>
                  <Select onValueChange={setSelectedReceiptInvoiceId}>
                        <SelectTrigger id="invoice-select" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Escolha uma fatura..." />
                      </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {paidInvoices.map(invoice => (
                              <SelectItem key={invoice.id} value={invoice.id}>
                              {`Fatura ${invoice.id.toUpperCase()} - ${getCiclistaName(invoice.ciclistaId)} - ${formatCurrency(invoice.currentAmount)}`}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                    <Button 
                      onClick={handleGenerateReceiptPdf} 
                      disabled={!selectedReceiptInvoiceId || isGeneratingReceipt} 
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full md:w-auto flex-shrink-0 whitespace-nowrap"
                    >
                      {isGeneratingReceipt ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                  {isGeneratingReceipt ? 'Gerando...' : 'Exportar Comprovante'}
                </Button>
                  </div>
            </CardContent>
          </Card>
        </div>

        {/* Hidden components for PDF generation */}
        <div className="absolute -left-[9999px] top-auto w-[800px] bg-white">
               {selectedProfileCiclista && <div id="profile-pdf-container"><CiclistaProfilePDF ciclista={selectedProfileCiclista} /></div>}
               {selectedReceiptInvoice && receiptCiclista && <div id="receipt-pdf-container"><PaymentReceiptPDF invoice={selectedReceiptInvoice} client={receiptCiclista} /></div>}
            </div>
          </div>
        </div>
    </div>
    </AuthGuard>
  );
}
