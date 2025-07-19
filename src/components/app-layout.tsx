'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { MainNav } from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { useCiclistas, useInvoices } from '@/context/app-context';
import { useState } from 'react';
import { useInactivityLogout } from '@/hooks/use-inactivity-logout';
import { InactivityWarning } from '@/components/inactivity-warning';
import { useLogo } from '@/hooks/use-logo';
import { useStatistics } from '@/hooks/use-statistics';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const { logoUrl, clubName } = useLogo();
  const { totalCiclistas, totalInvoices, totalReceived } = useStatistics();
  const { loading } = useCiclistas();
  const { invoices } = useInvoices();

  // Hook para logout por inatividade (10 minutos)
  const { showWarning, handleStayLoggedIn, handleLogoutNow } = useInactivityLogout(10);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Lista de rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // Se não está autenticado e não está em uma rota pública, redireciona para login
        router.push('/login');
      } else if (isAuthenticated && isPublicRoute) {
        // Se está autenticado e está em uma rota pública, redireciona para o dashboard
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não está em uma rota pública, mostra loading
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Se está em uma rota pública, renderiza apenas o conteúdo sem o layout da aplicação
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Se está autenticado, renderiza o layout da aplicação com sidebar
  return (
    <>
      <SidebarProvider>
        <Sidebar className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700/50">
          {/* Header da Sidebar com gradiente azul */}
          <SidebarHeader className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-b-3xl shadow-lg">
            {/* Título GESTOR DO CICLISTA em destaque */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white tracking-wider uppercase bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-xl shadow-lg border-2 border-white/20">
                GESTOR DO CICLISTA
              </h1>
            </div>
            
            {/* Logo centralizada */}
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                  <img
                    src={logoUrl}
                    alt="Logo do Clube"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Nome do clube */}
            <div className="text-center">
              <h2 className="text-sm font-semibold text-white/90 tracking-wide">
                {clubName}
              </h2>
            </div>
          </SidebarHeader>
          
          {/* Conteúdo da Sidebar */}
          <SidebarContent className="px-4 py-6">
            <div className="space-y-2">
              {/* Lista de navegação estilizada */}
              <div className="bg-blue-700/30 rounded-2xl p-4 mb-6">
                <h3 className="text-blue-100 font-semibold text-sm mb-3 uppercase tracking-wide">Menu Principal</h3>
                <MainNav />
              </div>
              
              {/* Seção de estatísticas */}
              <div className="bg-blue-700/20 rounded-2xl p-4">
                <h3 className="text-blue-100 font-semibold text-sm mb-3 uppercase tracking-wide">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">Ciclistas</span>
                    <span className="text-white font-bold">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                      ) : (
                        totalCiclistas
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">Faturas</span>
                    <span className="text-white font-bold">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                      ) : (
                        totalInvoices
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">Recebido</span>
                    <span className="text-green-300 font-bold">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                      ) : (
                        `R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      )}
                    </span>
                  </div>
                  {!loading && totalInvoices > 0 && (
                    <div className="pt-2 border-t border-blue-600/30">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200 text-xs">Taxa de Pagamento</span>
                        <span className="text-blue-100 text-xs font-medium">
                          {Math.round((invoices.filter(inv => inv.status === 'paid').length / totalInvoices) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SidebarContent>
          
          {/* Footer da Sidebar - Removido */}
          <SidebarFooter className="p-4">
            {/* Footer vazio - botão de usuário removido */}
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          {/* Header principal com gradiente azul */}
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between px-6 bg-gradient-to-r from-blue-800 to-blue-900 shadow-xl border-b border-blue-700/50">
            {/* Lado esquerdo - Botão Nova Fatura */}
            <div className="flex items-center">
              <Link href="/invoices/new" passHref>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Nova Fatura
                </Button>
              </Link>
            </div>

            {/* Centro - Barra de busca */}
            <div className="flex-1 flex justify-center max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                <Input
                  placeholder="Buscar ciclistas, faturas..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="pl-11 pr-4 h-12 w-full rounded-xl bg-white/10 backdrop-blur-sm border border-blue-600/30 shadow-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 text-white placeholder:text-blue-200 transition-all duration-200 outline-none text-base"
                />
              </div>
            </div>

            {/* Lado direito - Avatar do usuário */}
            <div className="flex items-center">
              <UserNav />
            </div>
          </header>
          
          {/* Conteúdo principal */}
          <main className="flex-1 p-8 sm:p-10 md:p-12 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      
      {/* Componente de aviso de inatividade */}
      <InactivityWarning
        isOpen={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogoutNow}
        countdown={60} // 1 minuto de countdown
      />
    </>
  );
} 