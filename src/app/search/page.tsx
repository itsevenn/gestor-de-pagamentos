'use client';
import { useSearchParams } from 'next/navigation';
import { useCiclistas, useInvoices } from '@/context/app-context';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users, FileText } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const term = (searchParams.get('term') || '').toLowerCase();
  const { ciclistas } = useCiclistas();
  const { invoices } = useInvoices();

  const filteredCiclistas = ciclistas.filter(c =>
    c.nomeCiclista.toLowerCase().includes(term) ||
    c.cpf.includes(term) ||
    c.celular.includes(term) ||
    c.matricula.includes(term)
  );

  const filteredInvoices = invoices.filter(inv =>
    inv.id.toLowerCase().includes(term) ||
    inv.status.toLowerCase().includes(term) ||
    inv.ciclistaId && ciclistas.find(c => c.id === inv.ciclistaId && c.nomeCiclista.toLowerCase().includes(term))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="w-5 h-5 text-blue-500" />
              Resultados para: <span className="font-bold text-blue-700 dark:text-blue-300">{term}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-2">
                <Users className="w-5 h-5 text-green-500" /> Ciclistas
              </h2>
              {filteredCiclistas.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">Nenhum ciclista encontrado.</div>
              ) : (
                <ul className="space-y-2">
                  {filteredCiclistas.map(c => (
                    <li key={c.id}>
                      <Link href={`/ciclistas/${c.id}`} className="block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                        <span className="font-medium text-gray-900 dark:text-white">{c.nomeCiclista}</span>
                        <span className="ml-2 text-xs text-gray-500">({c.cpf})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-2">
                <FileText className="w-5 h-5 text-purple-500" /> Faturas
              </h2>
              {filteredInvoices.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">Nenhuma fatura encontrada.</div>
              ) : (
                <ul className="space-y-2">
                  {filteredInvoices.map(inv => (
                    <li key={inv.id}>
                      <Link href={`/invoices/${inv.id}`} className="block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors">
                        <span className="font-medium text-gray-900 dark:text-white">Fatura: {inv.id.toUpperCase()}</span>
                        <span className="ml-2 text-xs text-gray-500">Status: {inv.status}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 