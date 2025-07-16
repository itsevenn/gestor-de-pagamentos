'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

const LOGO_STORAGE_KEY = 'app-logo';
const DEFAULT_LOGO_URL = 'https://placehold.co/50x50.png';

export function Logo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    setLogoUrl(storedLogo || DEFAULT_LOGO_URL);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        localStorage.setItem(LOGO_STORAGE_KEY, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  if (logoUrl === null) {
    return null; // ou um esqueleto de carregamento
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={logoUrl}
        alt="Logo Gestor do Ciclista"
        width={50}
        height={50}
        className="rounded-md object-cover"
        data-ai-hint="logo company"
      />
      <h1 className="text-xl font-bold text-center font-headline text-sidebar-foreground">
          GESTOR DO CICLISTA
      </h1>
      <Button variant="outline" size="sm" onClick={handleUploadClick} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Carregar Logo
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
