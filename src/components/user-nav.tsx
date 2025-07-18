
"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { LogOut, User, Settings, UserCircle } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const { user, logout } = useAuth();
  const avatarUrl = user?.photoUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 hover:bg-slate-700/50 transition-all duration-200 border-2 border-transparent hover:border-slate-600/30">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-600/20 hover:ring-slate-500/40 transition-all duration-200"
              style={{ background: '#eee' }}
            />
          ) : (
            <UserCircle className="h-12 w-12 text-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="h-10 w-10 rounded-full object-cover"
                  style={{ background: '#eee' }}
                />
              ) : (
                <UserCircle className="h-10 w-10 text-gray-400" />
              )}
              <div className="flex flex-col">
                <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs leading-none text-gray-500 dark:text-gray-400 mt-1">
                  {user?.email || 'email@exemplo.com'}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Link href="/profile" className="flex items-center">
              <User className="mr-3 h-4 w-4 text-gray-500" />
              <span className="font-medium">Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-3 h-4 w-4 text-gray-500" />
              <span className="font-medium">Configurações</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
