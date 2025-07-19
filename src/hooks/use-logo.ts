'use client';

import { useState, useEffect } from 'react';

const LOGO_STORAGE_KEY = 'app-logo';
const CLUB_NAME_STORAGE_KEY = 'app-club-name';

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>('https://placehold.co/80x80.png');
  const [clubName, setClubName] = useState<string>('SUSSUARANA CLUBE DE DESBRAVADORES');

  useEffect(() => {
    // Carregar dados do localStorage
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    const storedClubName = localStorage.getItem(CLUB_NAME_STORAGE_KEY);
    
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
    
    if (storedClubName) {
      setClubName(storedClubName);
    }

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOGO_STORAGE_KEY && e.newValue) {
        setLogoUrl(e.newValue);
      }
      if (e.key === CLUB_NAME_STORAGE_KEY && e.newValue) {
        setClubName(e.newValue);
      }
    };

    // Listener para mudanças locais (mesma aba)
    const handleLocalStorageChange = () => {
      const newLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      const newClubName = localStorage.getItem(CLUB_NAME_STORAGE_KEY);
      
      if (newLogo !== logoUrl) {
        setLogoUrl(newLogo || 'https://placehold.co/80x80.png');
      }
      if (newClubName !== clubName) {
        setClubName(newClubName || 'SUSSUARANA CLUBE DE DESBRAVADORES');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleLocalStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleLocalStorageChange);
    };
  }, [logoUrl, clubName]);

  return { logoUrl, clubName };
} 