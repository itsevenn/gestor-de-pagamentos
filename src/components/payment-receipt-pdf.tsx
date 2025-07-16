'use client';
import type { Client, Invoice } from '@/lib/data';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const LOGO_STORAGE_KEY = 'app-logo';
const DEFAULT_LOGO_URL = 'https://placehold.co/100x30.png';

export function PaymentReceiptPDF({ invoice, client }: { invoice: Invoice, client: Client }) {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_URL);

  useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, []);

  const generationDate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    // Adiciona T00:00:00 para garantir que a data seja interpretada como local
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('pt-BR');
  }

  return (
    <div className="bg-white text-gray-800 p-10 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-300">
          <div className="flex items-center gap-4">
            <div className="w-[120px] h-auto">
              <Image
                src={logoUrl}
                alt="Logo da Empresa"
                width={120}
                height={40}
                className="object-contain"
                data-ai-hint="company logo"
              />
            </div>
            <div>
              <p className="font-bold">GESTOR DO CICLISTA</p>
              <p>CNPJ: 00.000.000/0001-00</p>
              <p>contato@gestordociclista.com.br</p>
              <p>0800 000 0000</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold">Comprovante de Pagamento</h1>
            <p className="text-xs text-gray-500">gerado em {generationDate}</p>
          </div>
        </div>

        {/* Payment From */}
        <div className="p-6 border-b border-gray-300">
          <p className="text-gray-500">Pagamento efetuado</p>
          <p className="text-lg font-semibold">por: {client.nomeCiclista}</p>
        </div>

        {/* Payment Details */}
        <div className="p-6 space-y-4 bg-gray-50">
           <div>
              <p className="text-gray-500">Valor pago</p>
              <p className="text-xl font-bold">{formatCurrency(invoice.currentAmount)}</p>
           </div>
           <div>
              <p className="text-gray-500">Data do pagamento</p>
              <p className="text-lg font-semibold">{formatDate(invoice.paymentDate)}</p>
           </div>
           <div>
              <p className="text-gray-500">Método de pagamento</p>
              <p className="text-lg font-semibold">{invoice.paymentMethod}</p>
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 text-center text-xs text-gray-500">
          <p>Este documento não possui valor fiscal.</p>
          <p>Comprovante gerado por GESTOR DO CICLISTA.</p>
        </div>
      </div>
    </div>
  );
}
