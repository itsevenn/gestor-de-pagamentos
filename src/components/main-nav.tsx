'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, LineChart } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function MainNav() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Painel', icon: Home, tooltip: 'Painel' },
    { href: '/clients', label: 'Clientes', icon: Users, tooltip: 'Clientes' },
    { href: '/invoices', label: 'Faturas', icon: FileText, tooltip: 'Faturas' },
    { href: '/reports', label: 'Relatórios', icon: LineChart, tooltip: 'Relatórios' },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.tooltip}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
