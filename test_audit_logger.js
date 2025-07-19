// Carregar variáveis de ambiente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular o AuditLogger
class AuditLogger {
  static async log(action, entityType, details, entityId, entityName, changes) {
    try {
      console.log('🔍 AuditLogger: Iniciando log...', { action, entityType, details });
      
      // Verificar se o cliente Supabase está configurado
      if (!supabase) {
        console.error('❌ Cliente Supabase não está configurado');
        return;
      }
      
      // Usar apenas os campos que existem na tabela audit_logs
      const logData = {
        id: crypto.randomUUID(), // Gerar UUID manualmente
        date: new Date().toISOString(),
        user: 'test@example.com',
        action: action,
        details: details
      };

      // Adicionar changes apenas se existir na tabela
      if (changes) {
        logData.changes = JSON.stringify(changes);
      }

      console.log('📝 AuditLogger: Dados do log:', logData);

      // Tentar inserção
      const { data: insertData, error: simpleError } = await supabase
        .from('audit_logs')
        .insert([logData])
        .select();

      if (simpleError) {
        console.error('❌ Erro na inserção:', simpleError);
        console.error('Detalhes completos do erro:', {
          message: simpleError.message,
          details: simpleError.details,
          hint: simpleError.hint,
          code: simpleError.code,
          fullError: simpleError
        });
      } else {
        console.log('✅ Log de auditoria registrado com sucesso:', insertData);
      }
    } catch (error) {
      console.error('❌ Erro geral ao registrar log de auditoria:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    }
  }

  static async logCiclistaCreated(ciclistaId, ciclistaName, details) {
    await this.log(
      'Ciclista Criado',
      'ciclista',
      details || `Ciclista "${ciclistaName}" foi criado`,
      ciclistaId,
      ciclistaName
    );
  }

  static async logCiclistaUpdated(ciclistaId, ciclistaName, changes, details) {
    await this.log(
      'Ciclista Atualizado',
      'ciclista',
      details || `Dados do ciclista "${ciclistaName}" foram atualizados`,
      ciclistaId,
      ciclistaName,
      changes
    );
  }

  static async logInvoiceCreated(invoiceId, ciclistaName, amount) {
    await this.log(
      'Fatura Criada',
      'invoice',
      `Fatura ${invoiceId} para "${ciclistaName}" criada com valor R$ ${amount.toFixed(2)}`,
      invoiceId,
      ciclistaName
    );
  }

  static async logInvoiceUpdated(invoiceId, ciclistaName, changes, details) {
    await this.log(
      'Fatura Atualizada',
      'invoice',
      details || `Fatura ${invoiceId} para "${ciclistaName}" foi atualizada`,
      invoiceId,
      ciclistaName,
      changes
    );
  }
}

async function testAuditLogger() {
    console.log('🔍 Testando AuditLogger...');
    
    try {
        // 1. Testar log simples
        console.log('\n1. Testando log simples...');
        await AuditLogger.log('TEST_ACTION', 'system', 'Teste do AuditLogger');

        // 2. Testar log de ciclista criado
        console.log('\n2. Testando log de ciclista criado...');
        await AuditLogger.logCiclistaCreated('test-id-1', 'João Silva', 'Ciclista criado via teste');

        // 3. Testar log de ciclista atualizado
        console.log('\n3. Testando log de ciclista atualizado...');
        const changes = [
            { field: 'nomeCiclista', oldValue: 'João Silva', newValue: 'João Silva Santos' }
        ];
        await AuditLogger.logCiclistaUpdated('test-id-1', 'João Silva', changes, 'Nome atualizado');

        // 4. Testar log de fatura criada
        console.log('\n4. Testando log de fatura criada...');
        await AuditLogger.logInvoiceCreated('invoice-1', 'João Silva', 150.00);

        // 5. Testar log de fatura atualizada
        console.log('\n5. Testando log de fatura atualizada...');
        const invoiceChanges = [
            { field: 'currentAmount', oldValue: 150.00, newValue: 200.00 }
        ];
        await AuditLogger.logInvoiceUpdated('invoice-1', 'João Silva', invoiceChanges, 'Valor aumentado');

        // 6. Verificar logs criados
        console.log('\n6. Verificando logs criados...');
        const { data: logs, error: logsError } = await supabase
            .from('audit_logs')
            .select('*')
            .order('date', { ascending: false })
            .limit(10);

        if (logsError) {
            console.error('❌ Erro ao buscar logs:', logsError);
        } else {
            console.log('✅ Logs encontrados:', logs?.length || 0);
            const testLogs = logs?.filter(log => log.action.includes('TEST') || log.action.includes('Ciclista') || log.action.includes('Fatura'));
            console.log('Logs de teste criados:', testLogs?.length || 0);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testAuditLogger().then(() => {
    console.log('\n🏁 Teste concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 