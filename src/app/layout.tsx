
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
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
import { AppProvider } from '@/context/app-context';
import { Logo } from '@/components/logo';
import { ThemeProvider } from '@/hooks/use-theme';

export const metadata: Metadata = {
  title: 'GESTOR DO CICLISTA',
  description: 'Gerencie seus ciclistas com facilidade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            <SidebarProvider>
              <Sidebar>
                <SidebarHeader className="p-4 flex flex-col gap-4">
                  <div className="flex justify-end">
                    <UserNav />
                  </div>
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
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <div className="relative hidden md:block">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar..." className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nova Fatura
                    </Button>
                    <div className="md:hidden">
                      <UserNav />
                    </div>
                  </div>
                </header>
                <main className="flex-1 p-4 sm:p-6">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </AppProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
