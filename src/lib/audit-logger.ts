import { supabase } from './supabaseClient';

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
  | 'PROFILE_PHOTO_UPLOADED'
  | 'PROFILE_PHOTO_UPDATED'
  | 'PROFILE_PHOTO_REMOVED'
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
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
};

export class AuditLogger {
  private static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.warn('Erro ao obter usuário atual:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.warn('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  private static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Erro ao obter perfil do usuário:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('Erro ao obter perfil do usuário:', error);
      return null;
    }
  }

  static async log(
    action: AuditAction,
    entityType: AuditLogEntry['entityType'],
    details: string,
    entityId?: string,
    entityName?: string,
    changes?: any
  ): Promise<void> {
    try {
      console.log('🔍 AuditLogger: Iniciando log...', { action, entityType, details });
      
      const user = await this.getCurrentUser();
      const profile = user ? await this.getUserProfile(user.id) : null;
      
      const logData = {
        timestamp: new Date().toISOString(),
        userId: user?.id || 'system',
        userName: profile?.email || user?.email || 'Sistema',
        action,
        entityType,
        entityId: entityId || null,
        entityName: entityName || null,
        details,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress: 'N/A',
        userAgent: 'N/A'
      };

      console.log('📝 AuditLogger: Dados do log:', logData);

      // Primeiro, verificar se a tabela existe
      console.log('🔍 AuditLogger: Verificando se a tabela existe...');
      const { data: checkData, error: checkError } = await supabase
        .from('audit_logs')
        .select('count')
        .limit(1);

      if (checkError) {
        console.error('❌ AuditLogger: Tabela audit_logs não existe ou não está acessível:', checkError);
        console.error('Detalhes do erro:', {
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint,
          code: checkError.code
        });
        return;
      }

      console.log('✅ AuditLogger: Tabela audit_logs existe, tentando inserção...');

      const { data, error } = await supabase
        .from('audit_logs')
        .insert([logData])
        .select();

      if (error) {
        console.error('❌ Erro ao inserir log de auditoria:', error);
        console.error('Dados que falharam:', logData);
        console.error('Detalhes completos do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        
        // Tentar inserção mínima
        console.log('🔄 AuditLogger: Tentando inserção mínima...');
        const minimalData = {
          timestamp: logData.timestamp,
          userId: logData.userId,
          userName: logData.userName,
          action: logData.action,
          entityType: logData.entityType,
          details: logData.details
        };
        
        const { error: fallbackError } = await supabase
          .from('audit_logs')
          .insert([minimalData]);
        
        if (fallbackError) {
          console.error('❌ Erro também no fallback:', fallbackError);
          console.error('Detalhes do erro de fallback:', {
            message: fallbackError.message,
            details: fallbackError.details,
            hint: fallbackError.hint,
            code: fallbackError.code
          });
        } else {
          console.log('✅ Log inserido com fallback');
        }
      } else {
        console.log('✅ Log de auditoria registrado com sucesso:', data);
      }
    } catch (error) {
      console.error('❌ Erro geral ao registrar log de auditoria:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
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

  static async logProfileUpdated(userId: string, userName: string, changes?: any) {
    await this.log(
      'PROFILE_UPDATED',
      'user',
      `Perfil do usuário "${userName}" foi atualizado`,
      userId,
      userName,
      changes
    );
  }

  static async logProfilePhotoUploaded(userId: string, userName: string) {
    await this.log(
      'PROFILE_PHOTO_UPLOADED',
      'user',
      `Foto de perfil foi carregada para o usuário "${userName}"`,
      userId,
      userName
    );
  }

  static async logProfilePhotoUpdated(userId: string, userName: string) {
    await this.log(
      'PROFILE_PHOTO_UPDATED',
      'user',
      `Foto de perfil foi atualizada para o usuário "${userName}"`,
      userId,
      userName
    );
  }

  static async logProfilePhotoRemoved(userId: string, userName: string) {
    await this.log(
      'PROFILE_PHOTO_REMOVED',
      'user',
      `Foto de perfil foi removida do usuário "${userName}"`,
      userId,
      userName
    );
  }

  static async logInvoiceCreated(invoiceId: string, ciclistaName: string, amount: number) {
    await this.log(
      'INVOICE_CREATED',
      'invoice',
      `Fatura ${invoiceId.toUpperCase()} criada para "${ciclistaName}" - R$ ${amount.toFixed(2)}`,
      invoiceId,
      ciclistaName
    );
  }

  static async logInvoiceUpdated(invoiceId: string, ciclistaName: string, changes?: any, details?: string) {
    const changeText = details || (changes ? JSON.stringify(changes) : 'Fatura atualizada');
    await this.log(
      'INVOICE_UPDATED',
      'invoice',
      `Fatura ${invoiceId.toUpperCase()} para "${ciclistaName}" - ${changeText}`,
      invoiceId,
      ciclistaName,
      changes
    );
  }

  static async logInvoiceDeleted(invoiceId: string, ciclistaName: string, reason?: string) {
    const reasonText = reason ? ` - Motivo: ${reason}` : '';
    await this.log(
      'INVOICE_DELETED',
      'invoice',
      `Fatura ${invoiceId.toUpperCase()} para "${ciclistaName}" foi excluída${reasonText}`,
      invoiceId,
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
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entityId', ciclistaId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar logs do ciclista:', error);
      return [];
    }
    
    return (data || []) as AuditLogEntry[];
  } catch (error) {
    console.error('Erro ao buscar logs do ciclista:', error);
    return [];
  }
}

// Função para obter logs de um usuário específico
export async function getUserAuditLogs(userId: string): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar logs do usuário:', error);
      return [];
    }
    
    return (data || []) as AuditLogEntry[];
  } catch (error) {
    console.error('Erro ao buscar logs do usuário:', error);
    return [];
  }
}

// Função para obter todos os logs com paginação
export async function getAllAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Erro ao buscar todos os logs:', error);
      return [];
    }
    
    return (data || []) as AuditLogEntry[];
  } catch (error) {
    console.error('Erro ao buscar todos os logs:', error);
    return [];
  }
} 