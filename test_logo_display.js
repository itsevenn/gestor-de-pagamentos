// Teste para verificar o carregamento do logo e nome do clube
console.log('=== TESTE DE CARREGAMENTO DO LOGO ===');

// Verificar localStorage
const clubName = localStorage.getItem('app-club-name');
const clubLogo = localStorage.getItem('app-club-logo');

console.log('Nome do Clube:', clubName);
console.log('Logo do Clube:', clubLogo ? 'Carregado' : 'Não carregado');

// Verificar se os valores padrão estão sendo usados
const DEFAULT_CLUB_NAME = 'SUSSUARANA CLUBE DE DESBRAVADORES';
const DEFAULT_CLUB_SUBTITLE = 'GESTOR DO CICLISTA';

console.log('Nome padrão:', DEFAULT_CLUB_NAME);
console.log('Subtítulo padrão:', DEFAULT_CLUB_SUBTITLE);

// Simular carregamento do componente
const displayName = clubName || DEFAULT_CLUB_NAME;
console.log('Nome que deve aparecer:', displayName);

// Verificar se o componente está renderizando
console.log('=== VERIFICAÇÃO DO COMPONENTE ===');
console.log('1. Título "GESTOR DO CICLISTA" deve aparecer em destaque');
console.log('2. Logo deve aparecer (se carregado) ou placeholder');
console.log('3. Nome do clube deve aparecer:', displayName);

// Teste de visibilidade
console.log('=== TESTE DE VISIBILIDADE ===');
console.log('Classes CSS aplicadas:');
console.log('- Título: text-4xl font-black tracking-widest bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl text-white');
console.log('- Nome do clube: text-sm font-semibold tracking-wide text-white/90');

console.log('=== FIM DO TESTE ==='); 