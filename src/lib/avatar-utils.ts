/**
 * Utilitários para geração de avatares
 */

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