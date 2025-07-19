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
    const storedClubLogo = localStorage.getItem(CLUB_LOGO_STORAGE_KEY);
    const storedClubName = localStorage.getItem(CLUB_NAME_STORAGE_KEY);
    
    setLogoUrl(storedClubLogo);
    setClubName(storedClubName || DEFAULT_CLUB_NAME);
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
      {/* Bloco Principal - Retângulo cinza claro */}
      <div className="w-full bg-gray-300 rounded-xl p-6 text-center">
        {/* Título Principal */}
        <h1 className="text-2xl font-black text-gray-800 tracking-widest mb-4">
          GESTOR DO CICLISTA
        </h1>
        
        {/* Logo Container */}
        <div className="w-[100px] h-[100px] bg-white rounded-lg mx-auto mb-4 shadow-sm">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo Sussuarana Clube de Desbravadores"
              width={100}
              height={100}
              className="object-cover w-full h-full rounded-lg"
              data-ai-hint="logo company"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white rounded-lg">
              <div className="text-center text-gray-400">
                <div className="text-xs mb-1">100 x 100</div>
                <div className="text-xs">Logo</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bloco Secundário - Barra horizontal cinza */}
      <div className="w-full bg-gray-300 rounded-xl p-3 text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          SUSSUARANA
        </h2>
      </div>
    </div>
  );
}
