import { NextRequest, NextResponse } from 'next/server';
import { getCiclistaAuditLogs, getInvoiceAuditLogs, getUserAuditLogs, getAllAuditLogs } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  console.log('🔍 API Audit Logs: Iniciando requisição...');
  
  try {
    const { searchParams } = new URL(request.url);
    const ciclistaId = searchParams.get('ciclistaId');
    const invoiceId = searchParams.get('invoiceId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 API Audit Logs: Parâmetros:', { ciclistaId, invoiceId, userId, limit, offset });

    let logs = [];

    try {
      if (ciclistaId) {
        console.log('🔍 API Audit Logs: Buscando logs do ciclista:', ciclistaId);
        logs = await getCiclistaAuditLogs(ciclistaId);
      } else if (invoiceId) {
        console.log('🔍 API Audit Logs: Buscando logs da fatura:', invoiceId);
        logs = await getInvoiceAuditLogs(invoiceId);
      } else if (userId) {
        console.log('🔍 API Audit Logs: Buscando logs do usuário:', userId);
        logs = await getUserAuditLogs(userId);
      } else {
        console.log('🔍 API Audit Logs: Buscando todos os logs');
        logs = await getAllAuditLogs(limit, offset);
      }
    } catch (dbError) {
      console.error('❌ API Audit Logs: Erro ao buscar logs do banco:', dbError);
      // Retornar array vazio em caso de erro do banco
      logs = [];
    }

    // Garantir que logs seja sempre um array
    if (!Array.isArray(logs)) {
      console.warn('⚠️ API Audit Logs: Logs não é um array, convertendo:', logs);
      logs = [];
    }

    console.log('🔍 API Audit Logs: Retornando logs:', logs.length);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('❌ API Audit Logs: Erro geral:', error);
    return NextResponse.json([], { status: 500 });
  }
} 