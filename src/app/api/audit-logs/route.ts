import { NextRequest, NextResponse } from 'next/server';
import { getCiclistaAuditLogs, getUserAuditLogs, getAllAuditLogs } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ciclistaId = searchParams.get('ciclistaId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let logs;

    if (ciclistaId) {
      logs = await getCiclistaAuditLogs(ciclistaId);
    } else if (userId) {
      logs = await getUserAuditLogs(userId);
    } else {
      logs = await getAllAuditLogs(limit, offset);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 