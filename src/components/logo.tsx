'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, Image as ImageIcon, Settings, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const LOGO_STORAGE_KEY = 'app-logo';
const CLUB_NAME_STORAGE_KEY = 'app-club-name';
const CLUB_SUBTITLE_STORAGE_KEY = 'app-club-subtitle';
const DEFAULT_LOGO_URL = 'https://placehold.co/120x120.png';
const DEFAULT_CLUB_NAME = 'SUSSUARANA CLUBE DE DESBRAVADORES';
const DEFAULT_CLUB_SUBTITLE = 'GESTOR DO CICLISTA';

export function Logo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [clubName, setClubName] = useState(DEFAULT_CLUB_NAME);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    const storedClubName = localStorage.getItem(CLUB_NAME_STORAGE_KEY);
    
    setLogoUrl(storedLogo || DEFAULT_LOGO_URL);
    setClubName(storedClubName || DEFAULT_CLUB_NAME);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validação do arquivo
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('Arquivo muito grande. Selecione uma imagem menor que 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        localStorage.setItem(LOGO_STORAGE_KEY, result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleEditClick = () => {
    setEditName(clubName);
    setIsEditing(true);
  };

  const handleSaveName = () => {
    setClubName(editName);
    localStorage.setItem(CLUB_NAME_STORAGE_KEY, editName);
    setIsEditing(false);
  };

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
      {/* Título GESTOR DO CICLISTA - Acima da imagem */}
      <div className="text-center w-full mb-2">
        <h1 className="text-xl font-bold text-white tracking-wider uppercase bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg shadow-lg">
          GESTOR DO CICLISTA
        </h1>
      </div>

      {/* Logo Container */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative w-[120px] h-[120px] rounded-xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
          <Image
            src={logoUrl}
            alt="Logo Sussuarana Clube de Desbravadores"
            width={120}
            height={120}
            className="object-cover w-full h-full"
            data-ai-hint="logo company"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      {/* Nome do Clube - Fixo */}
      <div className="text-center space-y-2 w-full">
        <h2 className="text-sm font-semibold text-sidebar-foreground/90 tracking-wide">
          {clubName}
        </h2>
      </div>
    </div>
  );
}
