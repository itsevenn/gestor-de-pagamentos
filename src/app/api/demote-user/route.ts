import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vnilgkvxudsxqujvogqi.supabase.co';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWxna3Z4dWRzeHF1anZvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzQ2MzYsImV4cCI6MjA2ODM1MDYzNn0.kygdAX7EqZtTztrzyJsiiriDu2gh9zYsR_0jHsEFNpg';
    
    console.log('Verificando variáveis de ambiente:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'Definida' : 'NÃO DEFINIDA');
    console.log('ANON_KEY:', anonKey ? 'Definida' : 'NÃO DEFINIDA');
    
    if (!supabaseUrl || !anonKey) {
      console.error('Variáveis de ambiente não configuradas');
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);
    
    // ✅ CONCLUÍDO: Proteger para que só admins possam acessar
    // Verificar se o usuário que está fazendo a requisição é admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token recebido:', token.substring(0, 20) + '...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log('Usuário autenticado:', user ? 'Sim' : 'Não');
    console.log('Erro de autenticação:', authError);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('Perfil do usuário:', userProfile);
    console.log('Erro do perfil:', profileError);

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem rebaixar usuários.' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se não está tentando rebaixar a si mesmo
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Você não pode rebaixar a si mesmo.' },
        { status: 400 }
      );
    }

    console.log('Tentando rebaixar usuário:', userId);

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao rebaixar usuário:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('Usuário rebaixado com sucesso');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 