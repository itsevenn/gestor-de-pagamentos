import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export type AuditAction = 
  | 'CICLISTA_CREATED'
  | 'CICLISTA_UPDATED'
  | 'CICLISTA_DELETED'
  | 'CICLISTA_RESTORED'
  | 'INVOICE_CREATED'
  | 'INVOICE_UPDATED'
  | 'INVOICE_DELETED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_REFUNDED'
  | 'PHOTO_UPLOADED'
  | 'PHOTO_DELETED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PROFILE_UPDATED'
  | 'SYSTEM_ACTION';

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: 'ciclista' | 'invoice' | 'user' | 'system';
  entityId?: string;
  entityName?: string;
  details: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
};

export class AuditLogger {
  private static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  private static async getUserProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  }

  static async log(
    action: AuditAction,
    entityType: AuditLogEntry['entityType'],
    details: string,
    entityId?: string,
    entityName?: string,
    changes?: AuditLogEntry['changes']
  ): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      const profile = user ? await this.getUserProfile(user.id) : null;
      
      const logEntry: Omit<AuditLogEntry, 'id'> = {
        timestamp: new Date().toISOString(),
        userId: user?.id || 'system',
        userName: profile?.email || user?.email || 'Sistema',
        action,
        entityType,
        entityId,
        entityName,
        details,
        changes,
        ipAddress: 'N/A', // Pode ser implementado com middleware
        userAgent: 'N/A'  // Pode ser implementado com middleware
      };

      await supabase.from('audit_logs').insert([{
        id: uuidv4(),
        ...logEntry
      }]);

      console.log('📝 Audit Log:', {
        action,
        entityType,
        entityName,
        details,
        user: logEntry.userName
      });
    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
    }
  }

  // Métodos específicos para cada tipo de ação
  static async logCiclistaCreated(ciclistaId: string, ciclistaName: string, details?: string) {
    await this.log(
      'CICLISTA_CREATED',
      'ciclista',
      details || `Ciclista "${ciclistaName}" foi criado`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logCiclistaUpdated(
    ciclistaId: string, 
    ciclistaName: string, 
    changes: AuditLogEntry['changes'],
    details?: string
  ) {
    await this.log(
      'CICLISTA_UPDATED',
      'ciclista',
      details || `Dados do ciclista "${ciclistaName}" foram atualizados`,
      ciclistaId,
      ciclistaName,
      changes
    );
  }

  static async logCiclistaDeleted(ciclistaId: string, ciclistaName: string, reason: string) {
    await this.log(
      'CICLISTA_DELETED',
      'ciclista',
      `Ciclista "${ciclistaName}" foi excluído. Motivo: ${reason}`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logCiclistaRestored(ciclistaId: string, ciclistaName: string) {
    await this.log(
      'CICLISTA_RESTORED',
      'ciclista',
      `Ciclista "${ciclistaName}" foi restaurado`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logInvoiceCreated(invoiceId: string, ciclistaName: string, amount: number) {
    await this.log(
      'INVOICE_CREATED',
      'invoice',
      `Fatura de R$ ${amount.toFixed(2)} foi criada para "${ciclistaName}"`,
      invoiceId,
      ciclistaName
    );
  }

  static async logInvoiceUpdated(
    invoiceId: string, 
    ciclistaName: string, 
    changes: AuditLogEntry['changes'],
    details?: string
  ) {
    await this.log(
      'INVOICE_UPDATED',
      'invoice',
      details || `Fatura de "${ciclistaName}" foi atualizada`,
      invoiceId,
      ciclistaName,
      changes
    );
  }

  static async logPaymentReceived(invoiceId: string, ciclistaName: string, amount: number, method: string) {
    await this.log(
      'PAYMENT_RECEIVED',
      'invoice',
      `Pagamento de R$ ${amount.toFixed(2)} recebido via ${method} para "${ciclistaName}"`,
      invoiceId,
      ciclistaName
    );
  }

  static async logPaymentRefunded(invoiceId: string, ciclistaName: string, amount: number, reason: string) {
    await this.log(
      'PAYMENT_REFUNDED',
      'invoice',
      `Reembolso de R$ ${amount.toFixed(2)} para "${ciclistaName}". Motivo: ${reason}`,
      invoiceId,
      ciclistaName
    );
  }

  static async logPhotoUploaded(ciclistaId: string, ciclistaName: string) {
    await this.log(
      'PHOTO_UPLOADED',
      'ciclista',
      `Foto de perfil foi carregada para "${ciclistaName}"`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logPhotoDeleted(ciclistaId: string, ciclistaName: string) {
    await this.log(
      'PHOTO_DELETED',
      'ciclista',
      `Foto de perfil foi removida de "${ciclistaName}"`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logUserLogin(userEmail: string) {
    await this.log(
      'USER_LOGIN',
      'user',
      `Usuário "${userEmail}" fez login no sistema`,
      undefined,
      userEmail
    );
  }

  static async logUserLogout(userEmail: string) {
    await this.log(
      'USER_LOGOUT',
      'user',
      `Usuário "${userEmail}" fez logout do sistema`,
      undefined,
      userEmail
    );
  }

  static async logProfileUpdated(userId: string, userEmail: string, changes: AuditLogEntry['changes']) {
    await this.log(
      'PROFILE_UPDATED',
      'user',
      `Perfil do usuário "${userEmail}" foi atualizado`,
      userId,
      userEmail,
      changes
    );
  }

  static async logSystemAction(action: string, details: string) {
    await this.log(
      'SYSTEM_ACTION',
      'system',
      details,
      undefined,
      undefined
    );
  }
}

// Função utilitária para comparar objetos e detectar mudanças
export function detectChanges(oldData: any, newData: any): AuditLogEntry['changes'] {
  const changes: AuditLogEntry['changes'] = [];
  
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes.push({
        field: key,
        oldValue: oldData[key],
        newValue: newData[key]
      });
    }
  }
  
  return changes.length > 0 ? changes : undefined;
}

// Função para formatar valores para exibição
export function formatValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Função para obter logs de um ciclista específico
export async function getCiclistaAuditLogs(ciclistaId: string): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entityId', ciclistaId)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data as AuditLogEntry[];
}

// Função para obter logs de um usuário específico
export async function getUserAuditLogs(userId: string): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('userId', userId)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data as AuditLogEntry[];
}

// Função para obter todos os logs com paginação
export async function getAllAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data as AuditLogEntry[];
} 