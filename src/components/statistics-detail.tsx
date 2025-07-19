'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStatistics } from '@/hooks/use-statistics';
import { useInvoices } from '@/context/app-context';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText } from 'lucide-react';

export function StatisticsDetail() {
  const { totalCiclistas, totalInvoices, totalReceived } = useStatistics();
  const { invoices } = useInvoices();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcular estatísticas detalhadas
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const paymentRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
  
  // Calcular valor total das faturas
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.currentAmount, 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.currentAmount, 0);

  return (
    <div className="space-y-4">
      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total de Ciclistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalCiclistas}</div>
            <p className="text-xs text-blue-600 mt-1">Ciclistas registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total de Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalInvoices}</div>
            <p className="text-xs text-green-600 mt-1">Faturas emitidas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-purple-600 mt-1">Valor total recebido</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes das Faturas */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Status das Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
              <div className="text-sm text-green-700">Pagas</div>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                {paymentRate}%
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingInvoices}</div>
              <div className="text-sm text-yellow-700">Pendentes</div>
              <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800">
                R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
              <div className="text-sm text-red-700">Vencidas</div>
              <Badge variant="destructive" className="mt-1">
                Atenção
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-blue-700">Valor Total</div>
              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">
                Emitidas
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores de Performance */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Indicadores de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Taxa de Pagamento</div>
                  <div className="text-sm text-gray-600">Percentual de faturas pagas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{paymentRate}%</div>
                <div className="text-sm text-gray-500">
                  {paidInvoices} de {totalInvoices} faturas
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">Faturas Vencidas</div>
                  <div className="text-sm text-gray-600">Faturas com pagamento atrasado</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
                <div className="text-sm text-gray-500">
                  {totalInvoices > 0 ? Math.round((overdueInvoices / totalInvoices) * 100) : 0}% do total
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 