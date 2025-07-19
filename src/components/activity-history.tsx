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
  CICLISTA_CREATED: <Plus className="w-4 h-4" />,
  CICLISTA_UPDATED: <Edit className="w-4 h-4" />,
  CICLISTA_DELETED: <Trash2 className="w-4 h-4" />,
  CICLISTA_RESTORED: <RotateCcw className="w-4 h-4" />,
  INVOICE_CREATED: <FileText className="w-4 h-4" />,
  INVOICE_UPDATED: <Edit className="w-4 h-4" />,
  INVOICE_DELETED: <Trash2 className="w-4 h-4" />,
  PAYMENT_RECEIVED: <DollarSign className="w-4 h-4" />,
  PAYMENT_REFUNDED: <RefreshCw className="w-4 h-4" />,
  PHOTO_UPLOADED: <Camera className="w-4 h-4" />,
  PHOTO_DELETED: <Trash2 className="w-4 h-4" />,
  USER_LOGIN: <LogIn className="w-4 h-4" />,
  USER_LOGOUT: <LogOut className="w-4 h-4" />,
  PROFILE_UPDATED: <Settings className="w-4 h-4" />,
  SYSTEM_ACTION: <Activity className="w-4 h-4" />
};

const actionColors: Record<AuditAction, string> = {
  CICLISTA_CREATED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CICLISTA_UPDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  CICLISTA_DELETED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  CICLISTA_RESTORED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  INVOICE_CREATED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  INVOICE_UPDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  INVOICE_DELETED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  PAYMENT_RECEIVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PAYMENT_REFUNDED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PHOTO_UPLOADED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  PHOTO_DELETED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  USER_LOGIN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  USER_LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  PROFILE_UPDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SYSTEM_ACTION: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

const actionLabels: Record<AuditAction, string> = {
  CICLISTA_CREATED: 'Ciclista Criado',
  CICLISTA_UPDATED: 'Ciclista Atualizado',
  CICLISTA_DELETED: 'Ciclista Excluído',
  CICLISTA_RESTORED: 'Ciclista Restaurado',
  INVOICE_CREATED: 'Fatura Criada',
  INVOICE_UPDATED: 'Fatura Atualizada',
  INVOICE_DELETED: 'Fatura Excluída',
  PAYMENT_RECEIVED: 'Pagamento Recebido',
  PAYMENT_REFUNDED: 'Pagamento Reembolsado',
  PHOTO_UPLOADED: 'Foto Carregada',
  PHOTO_DELETED: 'Foto Removida',
  USER_LOGIN: 'Login Realizado',
  USER_LOGOUT: 'Logout Realizado',
  PROFILE_UPDATED: 'Perfil Atualizado',
  SYSTEM_ACTION: 'Ação do Sistema'
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
        // Temporariamente, usar dados mock até a tabela ser criada
        const mockActivities = [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            userId: 'system',
            userName: 'Sistema',
            action: 'SYSTEM_ACTION' as any,
            entityType: 'system' as any,
            details: 'Sistema de auditoria inicializado',
            changes: undefined
          }
        ];
        
        setActivities(mockActivities);
        
        // TODO: Descomentar quando a tabela audit_logs for criada
        /*
        let url = '/api/audit-logs';
        const params = new URLSearchParams();
        
        if (ciclistaId) {
          params.append('ciclistaId', ciclistaId);
        }
        if (userId) {
          params.append('userId', userId);
        }
        if (limit) {
          params.append('limit', limit.toString());
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Garantir que data seja um array
        if (Array.isArray(data)) {
          setActivities(data);
        } else {
          console.warn('API retornou dados que não são um array:', data);
          setActivities([]);
        }
        */
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
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