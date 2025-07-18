/**
 * Utilitários para geração de avatares de ciclistas
 */

// Função para gerar avatar baseado no nome do ciclista
export function getCiclistaAvatarUrl(nomeCiclista: string, size: number = 150): string {
  const initials = nomeCiclista
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Usar DiceBear API para gerar avatares baseados em iniciais
  // Cores: verde, azul, laranja (cores mais vibrantes para ciclistas)
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=10b981,3b82f6,f59e0b&textColor=ffffff&fontSize=${Math.max(30, size * 0.2)}&fontWeight=600&size=${size}`;
}

// Função para gerar avatar com cores personalizadas
export function getCustomCiclistaAvatarUrl(nomeCiclista: string, colors: string[] = ['10b981', '3b82f6', 'f59e0b'], size: number = 150): string {
  const initials = nomeCiclista
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const backgroundColor = colors.join(',');
  
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=${backgroundColor}&textColor=ffffff&fontSize=${Math.max(30, size * 0.2)}&fontWeight=600&size=${size}`;
}

// Função para gerar avatar com tema esportivo
export function getSportCiclistaAvatarUrl(nomeCiclista: string, size: number = 150): string {
  const initials = nomeCiclista
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Cores esportivas: verde, azul, vermelho
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=10b981,3b82f6,ef4444&textColor=ffffff&fontSize=${Math.max(30, size * 0.2)}&fontWeight=600&size=${size}`;
}

// Função para obter avatar baseado no tema
export function getThemeCiclistaAvatarUrl(nomeCiclista: string, isDark: boolean = false, size: number = 150): string {
  return isDark ? getCustomCiclistaAvatarUrl(nomeCiclista, ['1e293b', '334155', '475569'], size) : getSportCiclistaAvatarUrl(nomeCiclista, size);
}

// Função para gerar fallback de avatar (texto simples)
export function getCiclistaAvatarFallback(nomeCiclista: string): string {
  return nomeCiclista
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Função principal para obter avatar do ciclista
export function getCiclistaAvatar(nomeCiclista: string, photoUrl?: string, size: number = 150): string {
  // Se tem foto, usa a foto
  if (photoUrl && photoUrl.trim() !== '') {
    return photoUrl;
  }
  
  // Se não tem foto, gera avatar baseado no nome
  return getCiclistaAvatarUrl(nomeCiclista, size);
} 