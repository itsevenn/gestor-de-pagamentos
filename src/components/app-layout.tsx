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
import { useCiclistas } from '@/context/app-context';
import { useInvoices } from '@/context/app-context';
import { useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

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
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex flex-col gap-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* UserNav was moved to the header */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between px-6 border-b bg-slate-800 shadow-lg border-b-0">
          {/* Lado esquerdo - Botão Nova Fatura */}
          <div className="flex items-center">
            <Link href="/invoices/new" passHref>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                <PlusCircle className="mr-2 h-5 w-5" />
                Nova Fatura
              </Button>
            </Link>
          </div>

          {/* Centro - Barra de busca */}
          <div className="flex-1 flex justify-center max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-11 pr-4 h-12 w-full rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all duration-200 outline-none text-base"
              />
            </div>
          </div>

          {/* Lado direito - Avatar do usuário */}
          <div className="flex items-center">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-8 sm:p-10 md:p-12 bg-slate-50 dark:bg-slate-900">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
} 