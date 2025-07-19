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
    { href: '/ciclistas', label: 'Ciclistas', icon: Users, tooltip: 'Ciclistas' },
    { href: '/invoices', label: 'Faturas', icon: FileText, tooltip: 'Faturas' },
    { href: '/reports', label: 'Relatórios', icon: LineChart, tooltip: 'Relatórios' },
  ];

  return (
    <SidebarMenu className="space-y-2 p-4">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.tooltip}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'text-blue-300 hover:text-white hover:bg-blue-900/30'
                }
              `}
            >
              <Link href={item.href} className="flex items-center gap-3 w-full">
                <item.icon className={`
                  h-5 w-5 transition-all duration-200
                  ${isActive 
                    ? 'text-yellow-400' 
                    : 'text-blue-300 group-hover:text-yellow-400'
                  }
                `} />
                <span className={`
                  transition-all duration-200
                  ${isActive 
                    ? 'font-semibold text-white' 
                    : 'font-medium group-hover:font-semibold'
                  }
                `}>
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
