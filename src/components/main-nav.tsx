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
    <SidebarMenu className="space-y-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.tooltip}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-out
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                  : 'text-blue-200 hover:text-white hover:bg-blue-700/40 hover:shadow-md hover:scale-102'
                }
              `}
            >
              <Link href={item.href} className="flex items-center gap-3 w-full">
                <div className={`
                  p-1.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-blue-600/30 group-hover:bg-blue-500/40'
                  }
                `}>
                  <item.icon className={`
                    h-4 w-4 transition-all duration-200
                    ${isActive 
                      ? 'text-white' 
                      : 'text-blue-300 group-hover:text-white'
                    }
                  `} />
                </div>
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
