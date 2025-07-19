import { createClient } from '@supabase/supabase-js';

// Função para gerar UUID compatível com browser
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AuditAction = 
  | 'Ciclista Criado'
  | 'Ciclista Atualizado'
  | 'Ciclista Excluído'
  | 'Ciclista Restaurado'
  | 'Fatura Criada'
  | 'Fatura Atualizada'
  | 'Fatura Excluída'
  | 'Pagamento Recebido'
  | 'Pagamento Reembolsado'
  | 'Foto Carregada'
  | 'Foto Removida'
  | 'Usuário Logado'
  | 'Usuário Deslogado'
  | 'Perfil Atualizado'
  | 'Ação do Sistema';

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
      
      // 1. Verificar se o cliente Supabase está configurado
      console.log('🔍 AuditLogger: Verificando cliente Supabase...');
      if (!supabase) {
        console.error('❌ Cliente Supabase não está configurado');
        return;
      }
      
      // 2. Verificar autenticação
      console.log('🔍 AuditLogger: Verificando autenticação...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('🔍 AuditLogger: Dados de autenticação:', authData);
      console.log('🔍 AuditLogger: Erro de autenticação:', authError);
      
      const user = await this.getCurrentUser();
      const profile = user ? await this.getUserProfile(user.id) : null;
      
      console.log('🔍 AuditLogger: Usuário atual:', user?.email);
      console.log('🔍 AuditLogger: Perfil:', profile?.email);
      
      // 3. Testar conexão com a tabela
      console.log('🔍 AuditLogger: Testando conexão com a tabela...');
      const { data: testData, error: testError } = await supabase
        .from('audit_logs')
        .select('count')
        .limit(1);
      
      console.log('🔍 AuditLogger: Teste de conexão - dados:', testData);
      console.log('🔍 AuditLogger: Teste de conexão - erro:', testError);
      
      if (testError) {
        console.error('❌ Erro ao conectar com a tabela audit_logs:', testError);
        console.error('Detalhes do erro de conexão:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        });
        return;
      }
      
      // 4. Usar apenas os campos que existem na tabela audit_logs
      const logData = {
        id: generateUUID(), // Gerar UUID automaticamente
        date: new Date().toISOString(),
        user: profile?.email || user?.email || 'Admin',
        action: action,
        details: details
      };

      console.log('📝 AuditLogger: Dados do log:', logData);

      // 5. Tentar inserção sem .select() primeiro
      console.log('🔍 AuditLogger: Tentando inserção simples...');
      const { data: insertData, error: simpleError } = await supabase
        .from('audit_logs')
        .insert([logData])
        .select();

      if (simpleError) {
        console.error('❌ Erro na inserção simples:', simpleError);
        console.error('Detalhes completos do erro:', {
          message: simpleError.message,
          details: simpleError.details,
          hint: simpleError.hint,
          code: simpleError.code,
          fullError: simpleError
        });
        
        // 6. Tentar inserção com dados mínimos
        console.log('🔄 AuditLogger: Tentando inserção mínima...');
        const minimalData = {
          id: generateUUID(), // Gerar UUID automaticamente
          date: new Date().toISOString(),
          action: action,
          details: details
        };
        
        const { data: minimalInsertData, error: minimalError } = await supabase
          .from('audit_logs')
          .insert([minimalData])
          .select();
        
        if (minimalError) {
          console.error('❌ Erro também na inserção mínima:', minimalError);
          console.error('Detalhes do erro mínimo:', {
            message: minimalError.message,
            details: minimalError.details,
            hint: minimalError.hint,
            code: minimalError.code
          });
          
          // 7. Tentar inserção com apenas um campo
          console.log('🔄 AuditLogger: Tentando inserção com apenas date...');
          const { error: dateOnlyError } = await supabase
            .from('audit_logs')
            .insert([{ 
              id: generateUUID(), // Gerar UUID automaticamente
              date: new Date().toISOString() 
            }]);
          
          if (dateOnlyError) {
            console.error('❌ Erro até na inserção mínima com apenas date:', dateOnlyError);
          } else {
            console.log('✅ Log inserido com apenas date');
          }
        } else {
          console.log('✅ Log inserido com dados mínimos:', minimalInsertData);
        }
      } else {
        console.log('✅ Log de auditoria registrado com sucesso (inserção simples):', insertData);
        
        // 8. Se a inserção simples funcionou, tentar buscar o registro
        const { data: insertedData, error: selectError } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('action', action)
          .eq('details', details)
          .order('date', { ascending: false })
          .limit(1);
        
        if (selectError) {
          console.warn('⚠️ Erro ao buscar registro inserido:', selectError);
        } else {
          console.log('✅ Registro inserido encontrado:', insertedData);
        }
      }
    } catch (error) {
      console.error('❌ Erro geral ao registrar log de auditoria:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    }
  }

  // Métodos específicos para cada tipo de ação
  static async logCiclistaCreated(ciclistaId: string, ciclistaName: string, details?: string) {
    await this.log(
      'Ciclista Criado',
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
      'Ciclista Atualizado',
      'ciclista',
      details || `Dados do ciclista "${ciclistaName}" foram atualizados`,
      ciclistaId,
      ciclistaName,
      changes
    );
  }

  static async logCiclistaDeleted(ciclistaId: string, ciclistaName: string, reason: string) {
    await this.log(
      'Ciclista Excluído',
      'ciclista',
      `Ciclista "${ciclistaName}" foi excluído. Motivo: ${reason}`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logCiclistaRestored(ciclistaId: string, ciclistaName: string) {
    await this.log(
      'Ciclista Restaurado',
      'ciclista',
      `Ciclista "${ciclistaName}" foi restaurado`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logPaymentReceived(invoiceId: string, ciclistaName: string, amount: number, method: string) {
    await this.log(
      'Pagamento Recebido',
      'invoice',
      `Pagamento de R$ ${amount.toFixed(2)} recebido via ${method} para "${ciclistaName}"`,
      invoiceId,
      ciclistaName
    );
  }

  static async logPaymentRefunded(invoiceId: string, ciclistaName: string, amount: number, reason: string) {
    await this.log(
      'Pagamento Reembolsado',
      'invoice',
      `Reembolso de R$ ${amount.toFixed(2)} para "${ciclistaName}". Motivo: ${reason}`,
      invoiceId,
      ciclistaName
    );
  }

  static async logPhotoUploaded(ciclistaId: string, ciclistaName: string) {
    await this.log(
      'Foto Carregada',
      'ciclista',
      `Foto de perfil foi carregada para "${ciclistaName}"`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logPhotoDeleted(ciclistaId: string, ciclistaName: string) {
    await this.log(
      'Foto Removida',
      'ciclista',
      `Foto de perfil foi removida de "${ciclistaName}"`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logProfileUpdated(userId: string, userName: string, changes?: any) {
    await this.log(
      'Perfil Atualizado',
      'user',
      `Perfil do usuário "${userName}" foi atualizado`,
      userId,
      userName,
      changes
    );
  }

  static async logProfilePhotoUploaded(userId: string, userName: string) {
    await this.log(
      'Foto Carregada',
      'user',
      `Foto de perfil foi carregada para o usuário "${userName}"`,
      userId,
      userName
    );
  }

  static async logProfilePhotoUpdated(userId: string, userName: string) {
    await this.log(
      'Perfil Atualizado',
      'user',
      `Foto de perfil foi atualizada para o usuário "${userName}"`,
      userId,
      userName
    );
  }

  static async logProfilePhotoRemoved(userId: string, userName: string) {
    await this.log(
      'Foto Removida',
      'user',
      `Foto de perfil foi removida do usuário "${userName}"`,
      userId,
      userName
    );
  }

  static async logInvoiceCreated(invoiceId: string, ciclistaName: string, amount: number) {
    await this.log(
      'Fatura Criada',
      'invoice',
      `Fatura ${invoiceId.toUpperCase()} criada para "${ciclistaName}" - R$ ${amount.toFixed(2)}`,
      invoiceId,
      ciclistaName
    );
  }

  static async logInvoiceUpdated(invoiceId: string, ciclistaName: string, changes?: any, details?: string) {
    const changeText = details || (changes ? JSON.stringify(changes) : 'Fatura atualizada');
    await this.log(
      'Fatura Atualizada',
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
      'Fatura Excluída',
      'invoice',
      `Fatura ${invoiceId.toUpperCase()} para "${ciclistaName}" foi excluída${reasonText}`,
      invoiceId,
      ciclistaName
    );
  }

  static async logUserLogin(userEmail: string) {
    await this.log(
      'Usuário Logado',
      'user',
      `Usuário "${userEmail}" fez login no sistema`,
      undefined,
      userEmail
    );
  }

  static async logUserLogout(userEmail: string) {
    await this.log(
      'Usuário Deslogado',
      'user',
      `Usuário "${userEmail}" fez logout do sistema`,
      undefined,
      userEmail
    );
  }

  static async logSystemAction(action: string, details: string) {
    await this.log(
      'Ação do Sistema',
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
    console.log('🔍 getCiclistaAuditLogs: Buscando logs para ciclista:', ciclistaId);
    
    // Buscar todos os logs relacionados a ciclistas
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
      .order('date', { ascending: false })
      .limit(100); // Limitar para performance
    
    if (error) {
      console.error('❌ Erro ao buscar logs do ciclista:', error);
      return [];
    }
    
    console.log('✅ getCiclistaAuditLogs: Logs encontrados:', data?.length || 0);
    
    // Filtrar logs que sejam realmente relacionados ao ciclista específico
    const filteredData = (data || []).filter(log => {
      // Verificar se o log contém o ID do ciclista nos detalhes
      if (log.details && log.details.includes(ciclistaId)) {
        return true;
      }
      
      // Verificar se é uma ação relacionada a ciclistas e contém informações relevantes
      if (log.action && log.action.includes('Ciclista')) {
        // Para ações de ciclista, incluir se não tiver ID específico (será filtrado pelo frontend)
        return true;
      }
      
      // Verificar se é uma ação relacionada a fotos
      if (log.action && (log.action.includes('Foto'))) {
        return true;
      }
      
      return false;
    });
    
    console.log('✅ getCiclistaAuditLogs: Logs filtrados:', filteredData.length);
    
    // Converter dados para o formato esperado
    const convertedData = filteredData.map(log => {
      // Tentar fazer parse das mudanças dos detalhes
      let parsedChanges = null;
      let cleanDetails = log.details;
      
      // Verificar se há mudanças no final dos detalhes (formato: "detalhes - [JSON]")
      if (log.details && log.details.includes(' - [')) {
        const parts = log.details.split(' - ');
        if (parts.length > 1) {
          try {
            const changesPart = parts.slice(1).join(' - '); // Juntar caso haja múltiplos ' - '
            parsedChanges = JSON.parse(changesPart);
            cleanDetails = parts[0]; // Usar apenas a primeira parte como detalhes limpos
          } catch (error) {
            console.warn('Erro ao fazer parse das mudanças dos detalhes:', error);
          }
        }
      }
      
      return {
        id: log.id,
        timestamp: log.date,
        userId: log.user || 'system',
        userName: log.user || 'Sistema',
        action: log.action as AuditAction,
        entityType: 'ciclista' as const,
        entityId: ciclistaId,
        entityName: cleanDetails?.split('"')[1] || 'Ciclista',
        details: cleanDetails,
        changes: parsedChanges,
        ipAddress: 'N/A',
        userAgent: 'N/A'
      };
    });
    
    return convertedData;
  } catch (error) {
    console.error('❌ Erro ao buscar logs do ciclista:', error);
    return [];
  }
}

// Função para obter logs de uma fatura específica
export async function getInvoiceAuditLogs(invoiceId: string): Promise<AuditLogEntry[]> {
  try {
    console.log('🔍 getInvoiceAuditLogs: Buscando logs para fatura:', invoiceId);
    
    // Buscar logs que contenham o ID da fatura nos detalhes (tanto em maiúsculas quanto minúsculas)
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .or('action.eq.Fatura Criada,action.eq.Fatura Atualizada,action.eq.Fatura Excluída,action.eq.Pagamento Recebido,action.eq.Pagamento Reembolsado')
      .or(`details.ilike.%${invoiceId}%,details.ilike.%${invoiceId.toUpperCase()}%`)
      .order('date', { ascending: false })
      .limit(100); // Limitar para performance
    
    if (error) {
      console.error('❌ Erro ao buscar logs da fatura:', error);
      return [];
    }
    
    console.log('✅ getInvoiceAuditLogs: Logs encontrados:', data?.length || 0);
    
    // Filtrar logs que sejam realmente relacionados à fatura específica
    const filteredData = (data || []).filter(log => {
      // Verificar se o log contém o ID da fatura nos detalhes (tanto original quanto em maiúsculas)
      if (log.details && (log.details.includes(invoiceId) || log.details.includes(invoiceId.toUpperCase()))) {
        return true;
      }
      
      return false;
    });
    
    console.log('✅ getInvoiceAuditLogs: Logs filtrados:', filteredData.length);
    
    // Converter dados para o formato esperado
    const convertedData = filteredData.map(log => {
      // Tentar fazer parse das mudanças dos detalhes
      let parsedChanges = null;
      let cleanDetails = log.details;
      
      // Verificar se há mudanças no final dos detalhes (formato: "detalhes - [JSON]")
      if (log.details && log.details.includes(' - [')) {
        const parts = log.details.split(' - ');
        if (parts.length > 1) {
          try {
            const changesPart = parts.slice(1).join(' - '); // Juntar caso haja múltiplos ' - '
            parsedChanges = JSON.parse(changesPart);
            cleanDetails = parts[0]; // Usar apenas a primeira parte como detalhes limpos
          } catch (error) {
            console.warn('Erro ao fazer parse das mudanças dos detalhes:', error);
          }
        }
      }
      
      return {
        id: log.id,
        timestamp: log.date,
        userId: log.user || 'system',
        userName: log.user || 'Sistema',
        action: log.action as AuditAction,
        entityType: 'invoice' as const,
        entityId: invoiceId,
        entityName: cleanDetails?.split('"')[1] || 'Fatura',
        details: cleanDetails,
        changes: parsedChanges,
        ipAddress: 'N/A',
        userAgent: 'N/A'
      };
    });
    
    return convertedData;
  } catch (error) {
    console.error('❌ Erro ao buscar logs da fatura:', error);
    return [];
  }
}

// Função para obter logs de um usuário específico
export async function getUserAuditLogs(userId: string): Promise<AuditLogEntry[]> {
  try {
    console.log('🔍 getUserAuditLogs: Buscando logs para usuário:', userId);
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar logs do usuário:', error);
      return [];
    }
    
    console.log('✅ getUserAuditLogs: Logs encontrados:', data?.length || 0);
    
    // Converter dados para o formato esperado
    const convertedData = (data || []).map(log => {
      // Tentar fazer parse das mudanças se existirem
      let parsedChanges = null;
      if (log.changes) {
        try {
          parsedChanges = JSON.parse(log.changes);
        } catch (error) {
          console.warn('Erro ao fazer parse das mudanças:', error);
        }
      }
      
      return {
        id: log.id,
        timestamp: log.date,
        userId: log.user || 'system',
        userName: log.user || 'Sistema',
        action: log.action as AuditAction,
        entityType: 'user' as const,
        entityId: userId,
        entityName: log.user || 'Usuário',
        details: log.details,
        changes: parsedChanges,
        ipAddress: 'N/A',
        userAgent: 'N/A'
      };
    });
    
    return convertedData;
  } catch (error) {
    console.error('❌ Erro ao buscar logs do usuário:', error);
    return [];
  }
}

// Função para obter todos os logs com paginação
export async function getAllAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLogEntry[]> {
  try {
    console.log('🔍 getAllAuditLogs: Buscando todos os logs');
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('❌ Erro ao buscar todos os logs:', error);
      return [];
    }
    
    console.log('✅ getAllAuditLogs: Logs encontrados:', data?.length || 0);
    
    // Converter dados para o formato esperado
    const convertedData = (data || []).map(log => {
      // Tentar fazer parse das mudanças se existirem
      let parsedChanges = null;
      if (log.changes) {
        try {
          parsedChanges = JSON.parse(log.changes);
        } catch (error) {
          console.warn('Erro ao fazer parse das mudanças:', error);
        }
      }
      
      return {
        id: log.id,
        timestamp: log.date,
        userId: log.user || 'system',
        userName: log.user || 'Sistema',
        action: log.action as AuditAction,
        entityType: getEntityTypeFromAction(log.action),
        entityId: null,
        entityName: getEntityNameFromDetails(log.details),
        details: log.details,
        changes: parsedChanges,
        ipAddress: 'N/A',
        userAgent: 'N/A'
      };
    });
    
    return convertedData;
  } catch (error) {
    console.error('❌ Erro ao buscar todos os logs:', error);
    return [];
  }
}

// Função auxiliar para determinar o tipo de entidade baseado na ação
function getEntityTypeFromAction(action: string): 'ciclista' | 'invoice' | 'user' | 'system' {
  if (action.includes('Ciclista') || action.includes('PHOTO')) return 'ciclista';
  if (action.includes('Fatura') || action.includes('INVOICE')) return 'invoice';
  if (action.includes('Perfil') || action.includes('PROFILE')) return 'user';
  return 'system';
}

// Função auxiliar para extrair nome da entidade dos detalhes
function getEntityNameFromDetails(details: string): string {
  // Tentar extrair nome entre aspas
  const match = details.match(/"([^"]+)"/);
  if (match) return match[1];
  
  // Se não encontrar, retornar parte do texto
  if (details.includes('Ciclista')) return 'Ciclista';
  if (details.includes('Fatura')) return 'Fatura';
  if (details.includes('Perfil')) return 'Usuário';
  
  return 'Sistema';
} 