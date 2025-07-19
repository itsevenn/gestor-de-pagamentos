/**
 * Utilitários para geração de avatares
 */

import { supabase } from './supabaseClient';

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
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${ciclistaId}-${Date.now()}.${fileExt}`;
    
    // Upload para o bucket 'avatars' no Supabase Storage
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

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('Não foi possível obter a URL pública da imagem');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erro no upload de avatar:', error);
    throw error;
  }
};

export const deleteAvatar = async (photoUrl: string): Promise<void> => {
  try {
    // Extrair o nome do arquivo da URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Deletar arquivo do storage
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    if (error) {
      console.error('Erro ao deletar avatar:', error);
      throw new Error(`Falha ao deletar imagem: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao deletar avatar:', error);
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