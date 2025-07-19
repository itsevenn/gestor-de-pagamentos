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
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Retângulo cinza escuro grande - sem texto */}
      <div className="w-32 h-48 bg-gray-600 rounded-lg"></div>

      {/* Barra horizontal cinza escura - sem texto */}
      <div className="w-32 h-8 bg-gray-600 rounded-lg"></div>
    </div>
  );
}
