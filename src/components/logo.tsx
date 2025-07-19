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
      {/* Título Principal - Igual à imagem */}
      <div className="text-center space-y-2 w-full">
        <h1 className="text-4xl font-black text-white tracking-widest">
          GESTOR DO CICLISTA
        </h1>
      </div>

      {/* Logo Container - Quadrado branco grande */}
      <div className="w-[140px] h-[140px] bg-white rounded-xl shadow-lg">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo Sussuarana Clube de Desbravadores"
            width={140}
            height={140}
            className="object-cover w-full h-full rounded-xl"
            data-ai-hint="logo company"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white rounded-xl">
            <div className="text-center text-gray-400">
              <div className="text-xs mb-1">140 x 140</div>
              <div className="text-xs">Logo</div>
            </div>
          </div>
        )}
      </div>

      {/* Nome do Clube - Apenas "SUSSUARANA" */}
      <div className="text-center space-y-1 w-full">
        <h2 className="text-lg font-semibold text-white">
          SUSSUARANA
        </h2>
      </div>
    </div>
  );
}
