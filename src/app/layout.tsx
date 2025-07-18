
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
import { AuthProvider } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { ThemeProvider } from '@/hooks/use-theme';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';

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
          <AuthProvider>
              <AppProvider>
              <AppLayout>
                {children}
              </AppLayout>
              </AppProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
