/**
 * Utilitários para geração de avatares
 */

import { supabase } from './supabaseClient';
import { AuditLogger } from './audit-logger';

// Função para gerar avatar baseado nas iniciais usando DiceBear API
export function getAvatarUrl(name: string, email: string, size: number = 200): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Usar DiceBear API para gerar avatares baseados em iniciais
  // Cores: azul, roxo, ciano
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=4f46e5,7c3aed,06b6d4&textColor=ffffff&fontSize=${Math.max(20, size * 0.2)}&fontWeight=600&size=${size}`;
}

// Função para gerar avatar com cores personalizadas
export function getCustomAvatarUrl(name: string, colors: string[] = ['4f46e5', '7c3aed', '06b6d4'], size: number = 200): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const backgroundColor = colors.join(',');
  
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=${backgroundColor}&textColor=ffffff&fontSize=${Math.max(20, size * 0.2)}&fontWeight=600&size=${size}`;
}

// Função para gerar avatar com tema escuro
export function getDarkAvatarUrl(name: string, size: number = 200): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Cores mais escuras para tema dark
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=1e293b,334155,475569&textColor=ffffff&fontSize=${Math.max(20, size * 0.2)}&fontWeight=600&size=${size}`;
}

// Função para gerar avatar com tema claro
export function getLightAvatarUrl(name: string, size: number = 200): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Cores mais claras para tema light
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=3b82f6,8b5cf6,06b6d4&textColor=ffffff&fontSize=${Math.max(20, size * 0.2)}&fontWeight=600&size=${size}`;
}

// Função para obter avatar baseado no tema atual
export function getThemeAvatarUrl(name: string, isDark: boolean = false, size: number = 200): string {
  return isDark ? getDarkAvatarUrl(name, size) : getLightAvatarUrl(name, size);
}

// Função para gerar fallback de avatar (texto simples)
export function getAvatarFallback(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
} 

export const uploadAvatar = async (file: File, ciclistaId: string): Promise<string> => {
  try {
    console.log('Iniciando upload de avatar:', { fileName: file.name, size: file.size, type: file.type });
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${ciclistaId}-${Date.now()}.${fileExt}`;
    
    console.log('Nome do arquivo gerado:', fileName);
    
    // Upload direto para o bucket 'avatars' no Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    console.log('Upload realizado com sucesso:', data);

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Não foi possível obter a URL pública da imagem');
    }

    console.log('URL pública gerada:', urlData.publicUrl);
    
    // Registrar no sistema de auditoria
    try {
      // Buscar nome do ciclista para o log
      const { data: ciclistaData } = await supabase
        .from('ciclistas')
        .select('nomeCiclista')
        .eq('id', ciclistaId)
        .single();
      
      if (ciclistaData) {
        await AuditLogger.logPhotoUploaded(ciclistaId, ciclistaData.nomeCiclista);
      }
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria de upload:', auditError);
      // Não falhar o upload por causa do erro de auditoria
    }
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro no upload de avatar:', error);
    
    // Verificar se é um erro de rede
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    
    // Verificar se é um erro de autenticação
    if (error instanceof Error && error.message.includes('JWT')) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    throw error;
  }
};

export const deleteAvatar = async (photoUrl: string): Promise<void> => {
  try {
    console.log('Iniciando remoção de avatar:', photoUrl);
    
    // Extrair nome do arquivo da URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (!fileName) {
      throw new Error('URL da imagem inválida');
    }
    
    console.log('Nome do arquivo a ser removido:', fileName);
    
    // Remover arquivo do Supabase Storage
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);
    
    if (error) {
      console.error('Erro ao remover arquivo:', error);
      throw new Error(`Falha ao remover arquivo: ${error.message}`);
    }
    
    console.log('Arquivo removido com sucesso');
    
    // Registrar no sistema de auditoria
    try {
      // Extrair ciclistaId do nome do arquivo (formato: ciclistaId-timestamp.ext)
      const ciclistaId = fileName.split('-')[0];
      
      if (ciclistaId && ciclistaId !== 'temp') {
        // Buscar nome do ciclista para o log
        const { data: ciclistaData } = await supabase
          .from('ciclistas')
          .select('nomeCiclista')
          .eq('id', ciclistaId)
          .single();
        
        if (ciclistaData) {
          await AuditLogger.logPhotoDeleted(ciclistaId, ciclistaData.nomeCiclista);
        }
      }
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria de remoção:', auditError);
      // Não falhar a remoção por causa do erro de auditoria
    }
    
  } catch (error) {
    console.error('Erro ao remover avatar:', error);
    throw error;
  }
};

export const validateImageFile = (file: File): boolean => {
  // Verificar tipo de arquivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
  }

  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
  }

  return true;
}; 