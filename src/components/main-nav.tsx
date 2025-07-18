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
    <SidebarMenu className="space-y-3 p-4">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.tooltip}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/25 scale-105 border border-blue-400/30' 
                  : 'text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:shadow-lg hover:scale-102 border border-transparent hover:border-slate-600/30'
                }
              `}
            >
              <Link href={item.href} className="flex items-center gap-4 w-full">
                <div className={`
                  p-2 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-white/20 shadow-lg' 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                  }
                `}>
                  <item.icon className={`
                    h-6 w-6 transition-all duration-300
                    ${isActive 
                      ? 'text-yellow-300 drop-shadow-lg' 
                      : 'text-blue-400 group-hover:text-yellow-300 group-hover:scale-110'
                    }
                  `} />
                </div>
                <span className={`
                  transition-all duration-300
                  ${isActive 
                    ? 'font-bold text-white drop-shadow-sm' 
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
