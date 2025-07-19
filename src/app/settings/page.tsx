
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop, Settings, Palette, Bell, Shield, Database, Users, Upload, Image } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
// Importação dinâmica para evitar problemas de SSR
const AdminUsersPage = dynamic(() => import('../admin/users/page'), { ssr: false });

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [clubName, setClubName] = useState('SUSSUARANA CLUBE DE DESBRAVADORES');
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [clubLogo, setClubLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // Garante que o componente seja montado no cliente antes de renderizar o conteúdo dependente do tema
  useEffect(() => {
    setMounted(true);
    const storedClubName = localStorage.getItem('app-club-name');
    if (storedClubName) setClubName(storedClubName);
    
    const storedClubLogo = localStorage.getItem('app-logo');
    if (storedClubLogo) setClubLogo(storedClubLogo);
  }, []);

  const handleEditClick = () => {
    setEditName(clubName);
    setIsEditing(true);
  };

  const handleSaveName = () => {
    setClubName(editName);
    localStorage.setItem('app-club-name', editName);
    setIsEditing(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 handleLogoUpload chamada');
    const file = event.target.files?.[0];
    console.log('🔍 Arquivo selecionado:', file);
    
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    console.log('🔍 Tipo do arquivo:', file.type);
    console.log('🔍 Tamanho do arquivo:', file.size);

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      console.log('❌ Arquivo não é uma imagem');
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande');
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    console.log('✅ Arquivo válido, iniciando upload...');
    setIsUploading(true);
    
    try {
      // Converter para base64 para armazenamento local
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('✅ Arquivo convertido para base64');
        setClubLogo(result);
        localStorage.setItem('app-logo', result);
        setIsUploading(false);
        
        // Disparar evento para atualizar a sidebar
        window.dispatchEvent(new Event('localStorageChange'));
        
        // Limpar o input para permitir carregar o mesmo arquivo novamente
        event.target.value = '';
        
        // Mostrar mensagem de sucesso
        console.log('✅ Logo carregado com sucesso!');
        alert('Logo carregado com sucesso! A logo aparecerá na barra lateral.');
      };
      reader.onerror = () => {
        console.log('❌ Erro ao ler arquivo');
        setIsUploading(false);
        alert('Erro ao ler o arquivo. Tente novamente.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Erro ao fazer upload do logo:', error);
      setIsUploading(false);
      alert('Erro ao fazer upload do logo. Tente novamente.');
    }
  };

  const handleRemoveLogo = () => {
    setClubLogo(null);
    localStorage.removeItem('app-logo');
    
    // Disparar evento para atualizar a sidebar
    window.dispatchEvent(new Event('localStorageChange'));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex flex-col gap-8">
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
            </div>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 dark:bg-gray-600 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
            <p className="text-gray-600 dark:text-gray-400">Personalize sua experiência no sistema</p>
          </div>

          {/* Configurações de Aparência */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Aparência
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Personalize a aparência do aplicativo. Selecione o tema que mais lhe agrada.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className={`w-full justify-start py-4 px-4 rounded-xl transition-all duration-200 ${
                      theme === 'light' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Sun className="mr-3 h-5 w-5" />
                    Claro
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className={`w-full justify-start py-4 px-4 rounded-xl transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Moon className="mr-3 h-5 w-5" />
                    Escuro
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className={`w-full justify-start py-4 px-4 rounded-xl transition-all duration-200 ${
                      theme === 'system' 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Laptop className="mr-3 h-5 w-5" />
                    Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Notificações */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Notificações
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Gerencie suas preferências de notificação e alertas do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Alertas de Faturas</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Receba notificações sobre faturas próximas do vencimento e pagamentos atrasados.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Notificações ativas</span>
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Relatórios Automáticos</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Receba relatórios mensais por email sobre o desempenho financeiro.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Relatórios ativos</span>
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Segurança
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Configurações de segurança e privacidade da sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Autenticação de Dois Fatores</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Adicione uma camada extra de segurança à sua conta.
                  </p>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Configurar 2FA
                  </Button>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Sessões Ativas</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Gerencie suas sessões ativas e dispositivos conectados.
                  </p>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Ver Sessões
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Dados */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                Dados e Backup
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Gerencie seus dados e configure backups automáticos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Exportar Dados</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Faça download de todos os seus dados em formato JSON.
                  </p>
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Exportar Dados
                  </Button>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Backup Automático</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configure backups automáticos dos seus dados.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Backup ativo</span>
                    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Clube */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                Clube
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Altere o nome e logo do clube exibidos no menu lateral.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Nome do Clube */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nome do Clube</h3>
                {user?.role === 'admin' ? (
                  isEditing ? (
                    <div className="flex flex-col gap-2 max-w-md">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                        maxLength={50}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveName} className="bg-blue-600 text-white hover:bg-blue-700">Salvar</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900 dark:text-white text-lg">{clubName}</span>
                      <Button size="sm" variant="outline" onClick={handleEditClick}>Editar nome</Button>
                    </div>
                  )
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">{clubName}</span>
                )}
              </div>

              <Separator />

              {/* Logo do Clube */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Logo do Clube</h3>
                <div className="flex items-start gap-6">
                  {/* Preview do Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                      {clubLogo ? (
                        <img
                          src={clubLogo}
                          alt="Logo do Clube"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <Image className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm">120 x 120</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controles do Logo */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {clubLogo ? 'Logo atual do clube' : 'Nenhum logo carregado'}
                      </p>
                      {clubLogo && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          O logo será exibido no menu lateral e em relatórios.
                        </p>
                      )}
                    </div>

                    {user?.role === 'admin' && (
                      <div className="flex flex-wrap gap-2">
                                                <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={isUploading}
                          id="logo-upload-input"
                        />
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 hover:text-blue-800"
                          disabled={isUploading}
                          onClick={() => {
                            console.log('🔍 Botão Carregar Logo clicado');
                            document.getElementById('logo-upload-input')?.click();
                          }}
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                              Carregando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              {clubLogo ? 'Alterar Logo' : 'Carregar Logo'}
                            </>
                          )}
                        </Button>

                        {clubLogo && (
                          <Button
                            variant="outline"
                            onClick={handleRemoveLogo}
                            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                            disabled={isUploading}
                          >
                            Remover Logo
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Botão para abrir o gerenciador de usuários (apenas admin) */}
          {user?.role === 'admin' && (
            <>
              <Button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-semibold shadow-lg transition-all duration-200"
              >
                <Users className="w-5 h-5" /> Gerenciar Usuários
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                  className="w-full max-w-[90vw] sm:max-w-[480px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] p-0 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-none flex flex-col items-stretch overflow-hidden animate-fade-in relative mx-auto my-auto"
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}
                >
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <Users className="w-6 h-6 text-blue-600" /> Gerenciar Usuários
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    <AdminUsersPage />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
