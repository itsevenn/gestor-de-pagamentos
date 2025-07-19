'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CLUB_NAME_STORAGE_KEY = 'app-club-name';
const CLUB_LOGO_STORAGE_KEY = 'app-club-logo';
const DEFAULT_CLUB_NAME = 'SUSSUARANA CLUBE DE DESBRAVADORES';
const DEFAULT_CLUB_SUBTITLE = 'GESTOR DO CICLISTA';

export function Logo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [clubName, setClubName] = useState(DEFAULT_CLUB_NAME);

  useEffect(() => {
    const loadData = () => {
      const storedClubLogo = localStorage.getItem(CLUB_LOGO_STORAGE_KEY);
      const storedClubName = localStorage.getItem(CLUB_NAME_STORAGE_KEY);
      
      setLogoUrl(storedClubLogo);
      setClubName(storedClubName || DEFAULT_CLUB_NAME);
    };

    // Carregar dados iniciais
    loadData();

    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleStorageChange); // Para mudanças locais

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);



  if (logoUrl === null) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="w-[120px] h-[120px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Título Principal com Destaque Absoluto */}
      <div className="text-center space-y-2 w-full">
        <h1 className="text-4xl font-black text-sidebar-foreground tracking-widest bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl">
          GESTOR DO CICLISTA
        </h1>
      </div>

      {/* Logo Container */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo Sussuarana Clube de Desbravadores"
              width={120}
              height={120}
              className="object-cover w-full h-full"
              data-ai-hint="logo company"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-xs mb-1">120 x 120</div>
                <div className="text-xs">Logo</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nome do Clube */}
      <div className="text-center space-y-1 w-full">
        <h2 className="text-sm font-semibold text-sidebar-foreground/90 tracking-wide">
          {clubName}
        </h2>
      </div>

      {/* Separador */}
      <div className="w-full h-px bg-sidebar-foreground/10" />
    </div>
  );
}
