'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Receipt, 
  Search, 
  Filter,
  Calendar,
  Edit,
  FileText,
  DollarSign,
  RefreshCw,
  Plus,
  Trash2,
  ArrowRight,
  User
} from 'lucide-react';
import { AuditLogEntry, AuditAction } from '@/lib/audit-logger';

interface InvoiceChangesHistoryProps {
  invoiceId: string;
  limit?: number;
  showFilters?: boolean;
}

const invoiceActionIcons: Record<AuditAction, React.ReactNode> = {
  'Ciclista Criado': <Plus className="w-4 h-4" />,
  'Ciclista Atualizado': <Edit className="w-4 h-4" />,
  'Ciclista Excluído': <Trash2 className="w-4 h-4" />,
  'Ciclista Restaurado': <RefreshCw className="w-4 h-4" />,
  'Fatura Criada': <FileText className="w-4 h-4" />,
  'Fatura Atualizada': <Edit className="w-4 h-4" />,
  'Fatura Excluída': <Trash2 className="w-4 h-4" />,
  'Pagamento Recebido': <DollarSign className="w-4 h-4" />,
  'Pagamento Reembolsado': <RefreshCw className="w-4 h-4" />,
  'Foto Carregada': <FileText className="w-4 h-4" />,
  'Foto Removida': <Trash2 className="w-4 h-4" />,
  'Usuário Logado': <FileText className="w-4 h-4" />,
  'Usuário Deslogado': <FileText className="w-4 h-4" />,
  'Perfil Atualizado': <FileText className="w-4 h-4" />,
  'Ação do Sistema': <FileText className="w-4 h-4" />
};

const invoiceActionColors: Record<AuditAction, string> = {
  'Ciclista Criado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Ciclista Atualizado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Ciclista Excluído': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Ciclista Restaurado': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Fatura Criada': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Fatura Atualizada': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Fatura Excluída': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Pagamento Recebido': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Pagamento Reembolsado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Foto Carregada': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'Foto Removida': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Usuário Logado': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'Usuário Deslogado': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'Perfil Atualizado': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'Ação do Sistema': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export function InvoiceChangesHistory({ invoiceId, limit = 20, showFilters = true }: InvoiceChangesHistoryProps) {
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    const fetchInvoiceActivities = async () => {
      setLoading(true);
      try {
        console.log('🔍 InvoiceChangesHistory: Buscando atividades da fatura:', invoiceId);
        
        let url = '/api/audit-logs';
        const params = new URLSearchParams();
        
        // Filtrar apenas atividades relacionadas a faturas
        params.append('invoiceId', invoiceId);
        params.append('limit', limit.toString());
        
        url += `?${params.toString()}`;
        
        console.log('🔍 InvoiceChangesHistory: URL da API:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 InvoiceChangesHistory: Dados recebidos:', data);
        
        if (Array.isArray(data)) {
          // Filtrar apenas ações relacionadas a faturas
          const invoiceActions = data.filter((activity: AuditLogEntry) => 
            activity.action.includes('Fatura') || 
            activity.action.includes('Pagamento') ||
            (activity.entityType === 'invoice' && activity.entityId === invoiceId)
          );
          
          console.log('🔍 InvoiceChangesHistory: Atividades da fatura filtradas:', invoiceActions.length);
          setActivities(invoiceActions);
        } else {
          console.warn('⚠️ InvoiceChangesHistory: API retornou dados que não são um array:', data);
          setActivities([]);
        }
      } catch (error) {
        console.error('❌ InvoiceChangesHistory: Erro ao carregar atividades da fatura:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoiceActivities();
    }
  }, [invoiceId, limit]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const renderChanges = (changes: AuditLogEntry['changes']) => {
    if (!changes || changes.length === 0) return null;
    
    // Se changes for uma string JSON, tentar fazer parse
    let parsedChanges = changes;
    if (typeof changes === 'string') {
      try {
        parsedChanges = JSON.parse(changes);
      } catch (error) {
        console.warn('Erro ao fazer parse das mudanças:', error);
        return null;
      }
    }
    
    // Garantir que é um array
    if (!Array.isArray(parsedChanges)) {
      return null;
    }
    
    // Função para formatar valores
    const formatValue = (value: any, field: string) => {
      if (value === null || value === undefined || value === '') return 'N/A';
      
      // Formatar valores monetários
      if (field === 'currentAmount' || field === 'amount') {
        return `R$ ${Number(value).toFixed(2)}`;
      }
      
      // Formatar datas
      if (field === 'dueDate' || field === 'createdAt' || field === 'updatedAt') {
        try {
          return new Date(value).toLocaleDateString('pt-BR');
        } catch {
          return value;
        }
      }
      
      // Formatar status
      if (field === 'status') {
        const statusMap: Record<string, string> = {
          'pending': 'Pendente',
          'paid': 'Pago',
          'overdue': 'Atrasado',
          'refunded': 'Reembolsado'
        };
        return statusMap[value] || value;
      }
      
      // Formatar nomes de campos
      const fieldNames: Record<string, string> = {
        'currentAmount': 'Valor',
        'amount': 'Valor',
        'dueDate': 'Data de Vencimento',
        'status': 'Status',
        'ciclistaId': 'Ciclista',
        'createdAt': 'Data de Criação',
        'updatedAt': 'Data de Atualização'
      };
      
      return fieldNames[field] || field;
    };
    
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Detalhes das Alterações:
          </div>
          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            {parsedChanges.length} {parsedChanges.length === 1 ? 'campo' : 'campos'} modificado{parsedChanges.length > 1 ? 's' : ''}
          </Badge>
        </div>
        {parsedChanges.map((change, index) => (
          <div key={index} className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                  <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  {formatValue(change.field, change.field)}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                Campo {index + 1} de {parsedChanges.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Valor Anterior:</div>
                <div className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
                  {formatValue(change.oldValue, change.field)}
                </div>
              </div>
              <div className="mx-4 flex items-center">
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Novo Valor:</div>
                <div className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md border border-green-200 dark:border-green-800">
                  {formatValue(change.newValue, change.field)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          Nenhuma modificação encontrada
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Esta fatura ainda não teve modificações registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar modificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="Fatura Criada">Fatura Criada</SelectItem>
              <SelectItem value="Fatura Atualizada">Fatura Atualizada</SelectItem>
              <SelectItem value="Fatura Excluída">Fatura Excluída</SelectItem>
              <SelectItem value="Pagamento Recebido">Pagamento Recebido</SelectItem>
              <SelectItem value="Pagamento Reembolsado">Pagamento Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Lista de Atividades */}
      <div className="space-y-3">
        {filteredActivities.map((activity, index) => (
          <Card key={activity.id || index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                    {invoiceActionIcons[activity.action]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${invoiceActionColors[activity.action]}`}
                      >
                        {activity.action}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    
                    {/* Descrição da atividade */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {activity.action === 'Fatura Criada' && `Fatura criada com sucesso`}
                      {activity.action === 'Fatura Atualizada' && (
                        (() => {
                          if (activity.changes && Array.isArray(activity.changes) && activity.changes.length > 0) {
                            // Verificar se há mudança de status
                            const statusChange = activity.changes.find(change => change.field === 'status');
                            if (statusChange) {
                              const statusMap: Record<string, string> = {
                                'pending': 'Pendente',
                                'paid': 'Paga',
                                'overdue': 'Atrasada',
                                'refunded': 'Reembolsada'
                              };
                              const oldStatus = statusMap[statusChange.oldValue] || statusChange.oldValue;
                              const newStatus = statusMap[statusChange.newValue] || statusChange.newValue;
                              return `Fatura alterada de ${oldStatus} para ${newStatus}`;
                            }
                            
                            // Verificar se há mudança de valor
                            const valueChange = activity.changes.find(change => 
                              change.field === 'currentAmount' || change.field === 'originalAmount'
                            );
                            if (valueChange) {
                              return `Valor da fatura alterado`;
                            }
                            
                            // Outras mudanças
                            return `Fatura atualizada - ${activity.changes.length} campo(s) modificado(s)`;
                          }
                          return `Fatura atualizada`;
                        })()
                      )}
                      {activity.action === 'Fatura Excluída' && `Fatura excluída`}
                      {activity.action === 'Pagamento Recebido' && `Pagamento recebido`}
                      {activity.action === 'Pagamento Reembolsado' && `Pagamento reembolsado`}
                      {!['Fatura Criada', 'Fatura Atualizada', 'Fatura Excluída', 'Pagamento Recebido', 'Pagamento Reembolsado'].includes(activity.action) && 
                        (activity.details || `${activity.action} da fatura`)}
                    </p>

                    {/* Motivo da alteração */}
                    {activity.details && activity.details.includes('Motivo:') && (
                      <div className="mb-2">
                        <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                          <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <div>
                            <span className="text-xs font-medium text-orange-800 dark:text-orange-300 uppercase tracking-wide">
                              Motivo da Alteração:
                            </span>
                            <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                              {activity.details.split('Motivo:')[1]?.trim() || 'Motivo não especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <User className="w-3 h-3" />
                      <span>{activity.userName}</span>
                    </div>
                    {renderChanges(activity.changes)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredActivities.length === 0 && activities.length > 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Nenhuma modificação encontrada
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      )}
    </div>
  );
} 