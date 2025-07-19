'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  User, 
  Receipt, 
  Activity, 
  Search, 
  Filter,
  Calendar,
  Eye,
  FileText,
  CreditCard,
  Camera,
  Settings,
  LogOut,
  LogIn,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { AuditLogEntry, AuditAction } from '@/lib/audit-logger';

interface ActivityHistoryProps {
  ciclistaId?: string;
  userId?: string;
  limit?: number;
  showFilters?: boolean;
}

const actionIcons: Record<AuditAction, React.ReactNode> = {
  'Ciclista Criado': <Plus className="w-4 h-4" />,
  'Ciclista Atualizado': <Edit className="w-4 h-4" />,
  'Ciclista Excluído': <Trash2 className="w-4 h-4" />,
  'Ciclista Restaurado': <RotateCcw className="w-4 h-4" />,
  'Fatura Criada': <FileText className="w-4 h-4" />,
  'Fatura Atualizada': <Edit className="w-4 h-4" />,
  'Fatura Excluída': <Trash2 className="w-4 h-4" />,
  'Pagamento Recebido': <DollarSign className="w-4 h-4" />,
  'Pagamento Reembolsado': <RefreshCw className="w-4 h-4" />,
  'Foto Carregada': <Camera className="w-4 h-4" />,
  'Foto Removida': <Trash2 className="w-4 h-4" />,
  'Usuário Logado': <LogIn className="w-4 h-4" />,
  'Usuário Deslogado': <LogOut className="w-4 h-4" />,
  'Perfil Atualizado': <Settings className="w-4 h-4" />,
  'Ação do Sistema': <Activity className="w-4 h-4" />
};

const actionColors: Record<AuditAction, string> = {
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
  'Usuário Logado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Usuário Deslogado': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  'Perfil Atualizado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Ação do Sistema': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

const actionLabels: Record<AuditAction, string> = {
  'Ciclista Criado': 'Ciclista Criado',
  'Ciclista Atualizado': 'Ciclista Atualizado',
  'Ciclista Excluído': 'Ciclista Excluído',
  'Ciclista Restaurado': 'Ciclista Restaurado',
  'Fatura Criada': 'Fatura Criada',
  'Fatura Atualizada': 'Fatura Atualizada',
  'Fatura Excluída': 'Fatura Excluída',
  'Pagamento Recebido': 'Pagamento Recebido',
  'Pagamento Reembolsado': 'Pagamento Reembolsado',
  'Foto Carregada': 'Foto Carregada',
  'Foto Removida': 'Foto Removida',
  'Usuário Logado': 'Usuário Logado',
  'Usuário Deslogado': 'Usuário Deslogado',
  'Perfil Atualizado': 'Perfil Atualizado',
  'Ação do Sistema': 'Ação do Sistema'
};

export function ActivityHistory({ ciclistaId, userId, limit = 50, showFilters = true }: ActivityHistoryProps) {
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntityType, setFilterEntityType] = useState<string>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        console.log('🔍 ActivityHistory: Iniciando busca de atividades...');
        
        let url = '/api/audit-logs';
        const params = new URLSearchParams();
        
        if (ciclistaId) {
          params.append('ciclistaId', ciclistaId);
          console.log('🔍 ActivityHistory: Filtrando por ciclista:', ciclistaId);
        }
        if (userId) {
          params.append('userId', userId);
          console.log('🔍 ActivityHistory: Filtrando por usuário:', userId);
        }
        if (limit) {
          params.append('limit', limit.toString());
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        console.log('🔍 ActivityHistory: URL da API:', url);
        
        const response = await fetch(url);
        
        console.log('🔍 ActivityHistory: Status da resposta:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 ActivityHistory: Dados recebidos:', data);
        
        // Garantir que data seja um array
        if (Array.isArray(data)) {
          console.log('🔍 ActivityHistory: Definindo atividades:', data.length);
          setActivities(data);
        } else {
          console.warn('⚠️ ActivityHistory: API retornou dados que não são um array:', data);
          setActivities([]);
        }
      } catch (error) {
        console.error('❌ ActivityHistory: Erro ao carregar atividades:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [ciclistaId, userId, limit]);

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
                         activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.entityName && activity.entityName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    const matchesEntityType = filterEntityType === 'all' || activity.entityType === filterEntityType;
    
    return matchesSearch && matchesAction && matchesEntityType;
  });

  const renderChanges = (changes: AuditLogEntry['changes']) => {
    if (!changes || changes.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1">
        {changes.map((change, index) => (
          <div key={index} className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded">
            <span className="font-medium">{change.field}:</span>
            <span className="text-red-600 dark:text-red-400 ml-1">
              {change.oldValue || 'N/A'}
            </span>
            <span className="mx-1">→</span>
            <span className="text-green-600 dark:text-green-400">
              {change.newValue || 'N/A'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600 dark:text-slate-400">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Histórico de Atividades
        </CardTitle>
        <CardDescription>
          Registro de todas as ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      
      {showFilters && (
        <div className="px-6 pb-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {Object.entries(actionLabels).map(([action, label]) => (
                  <SelectItem key={action} value={action}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEntityType} onValueChange={setFilterEntityType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="ciclista">Ciclistas</SelectItem>
                <SelectItem value="invoice">Faturas</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <CardContent>
        {filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className={`p-2 rounded-full ${actionColors[activity.action]}`}>
                  {actionIcons[activity.action]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={actionColors[activity.action]}>
                      {actionLabels[activity.action]}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    {activity.details}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.userName}
                    </span>
                    {activity.entityName && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {activity.entityName}
                      </span>
                    )}
                  </div>
                  
                  {renderChanges(activity.changes)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || filterAction !== 'all' || filterEntityType !== 'all' 
                ? 'Nenhuma atividade encontrada com os filtros aplicados.'
                : 'Nenhuma atividade registrada ainda.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 