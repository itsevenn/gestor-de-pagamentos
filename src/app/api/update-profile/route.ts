import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 API: Iniciando atualização de perfil...');
    
    // Verifica se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 API: Usuário autenticado:', user?.email);
    console.log('🔍 API: Erro de auth:', authError);
    
    if (authError || !user) {
      console.log('❌ API: Usuário não autenticado');
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { name, email } = await request.json();
    console.log('🔍 API: Dados recebidos:', { name, email });

    // Validação dos dados
    if (!name || name.trim().length < 2) {
      console.log('❌ API: Nome inválido');
      return NextResponse.json(
        { error: 'Nome deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      console.log('❌ API: Email inválido');
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    console.log('🔍 API: Atualizando usuário no Supabase Auth...');
    
    // Atualiza os metadados do usuário no Supabase Auth
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: { name: name.trim() }
    });

    console.log('🔍 API: Resultado da atualização:', { updateData, updateError });

    if (updateError) {
      console.error('❌ API: Erro ao atualizar usuário:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil: ' + updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ API: Usuário atualizado com sucesso');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: name.trim(),
        email: email.trim(),
        photoUrl: updateData.user?.user_metadata?.avatar_url
      }
    });

  } catch (error) {
    console.error('❌ API: Erro interno do servidor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 