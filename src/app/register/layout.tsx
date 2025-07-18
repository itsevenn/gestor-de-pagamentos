import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Cadastro - GESTOR DO CICLISTA',
  description: 'Crie sua conta no sistema de gestão de ciclistas.',
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
} 