
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Upload, User, Mail, Lock, Camera, Shield, Settings, Calendar, Clock, CheckCircle, Edit3, X, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef, useState, useMemo, useEffect } from 'react';
import { getAvatarUrl, getAvatarFallback } from '@/lib/avatar-utils';

const profileFormSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um email válido.'),
  photoUrl: z.any().optional(),
});

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória."),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, updateUser, updatePhoto } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // Gerar URL do avatar
  const avatarUrl = user?.photoUrl;

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      photoUrl: '',
    },
  });

  // Sincroniza os valores do formulário quando o usuário muda
  useEffect(() => {
    console.log('🔍 ProfilePage: Usuário mudou, atualizando formulário:', user);
    
    if (user) {
      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        photoUrl: user.photoUrl || '',
      });
    }
  }, [user, profileForm]);
  
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
  });

  // Calcula a força da senha
  const passwordStrength = useMemo(() => {
    const password = passwordForm.watch('newPassword');
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const labels = ['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)]
    };
  }, [passwordForm.watch('newPassword')]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação do arquivo
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({ 
          title: 'Arquivo muito grande', 
          description: 'A foto deve ter menos de 5MB.',
          variant: 'destructive'
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Tipo de arquivo inválido', 
          description: 'Por favor, selecione apenas imagens.',
          variant: 'destructive'
        });
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
        const result = reader.result as string;
          const success = await updatePhoto(result);
          if (success) {
        profileForm.setValue('photoUrl', result);
            toast({ 
              title: 'Foto de Perfil Atualizada!',
              description: 'Sua foto foi salva com sucesso.'
            });
          }
        } catch (error) {
          toast({
            title: 'Erro ao fazer upload',
            description: 'Ocorreu um erro ao processar a imagem.',
            variant: 'destructive'
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      const success = await updatePhoto('');
      if (success) {
    profileForm.setValue('photoUrl', '');
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
        toast({ 
          title: 'Foto de Perfil Removida!',
          description: 'Sua foto foi removida com sucesso.'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao remover foto',
        description: 'Ocorreu um erro ao remover a imagem.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    console.log('🔍 ProfilePage: Submetendo formulário com valores:', values);
    
    const success = await updateUser({ name: values.name, email: values.email });
    
    console.log('🔍 ProfilePage: Resultado da atualização:', success);
    
    if (success) {
      setIsEditingName(false);
      toast({
        title: 'Perfil Atualizado!',
        description: 'Seus detalhes foram salvos com sucesso.',
      });
    } else {
      console.error('❌ ProfilePage: Falha na atualização do perfil');
    }
  }

  function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    // In a real app, you would validate the current password here
    console.log('Changing password to:', values.newPassword);
    toast({
      title: 'Senha Alterada!',
      description: 'Sua senha foi alterada com sucesso.',
    });
    passwordForm.reset();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Perfil</h1>
            <p className="text-gray-600 dark:text-gray-400">Atualize suas informações pessoais e configurações</p>
          </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Foto de Perfil */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Foto de Perfil
                </CardTitle>
            </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="h-36 w-36 rounded-full border-4 border-white dark:border-gray-700 shadow-xl object-cover relative z-10"
                        style={{ background: '#eee' }}
                      />
                    ) : (
                      <UserCircle className="h-36 w-36 text-gray-400 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-700 shadow-xl relative z-10" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-3 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações do usuário */}
                <div className="text-center space-y-2">
                  {isEditingName && (
                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        ✏️ Editando nome - Clique no ✓ para salvar ou ✗ para cancelar
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={profileForm.watch('name')}
                          onChange={(e) => profileForm.setValue('name', e.target.value)}
                          className="text-center border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg min-w-[200px]"
                          placeholder="Seu nome"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setIsEditingName(false);
                              onProfileSubmit(profileForm.getValues());
                            } else if (e.key === 'Escape') {
                              setIsEditingName(false);
                              profileForm.reset();
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsEditingName(false);
                            onProfileSubmit(profileForm.getValues());
                          }}
                          className="p-1 h-auto text-green-600 hover:text-green-700 dark:hover:text-green-400"
                          title="Salvar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsEditingName(false);
                            profileForm.reset();
                          }}
                          className="p-1 h-auto text-red-600 hover:text-red-700 dark:hover:text-red-400"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingName(true)}
                          className="p-1 h-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Editar nome"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-4">
                  <Button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isUploading ? (
                      <>
                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-3 h-5 w-5" />
                        Carregar Nova Foto
                      </>
                    )}
                    </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleRemovePhoto}
                    disabled={isUploading}
                    className="w-full border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    {isUploading ? (
                      <>
                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-3 h-5 w-5" />
                        Remover Foto
                      </>
                    )}
                    </Button>
                </div>

                    <Input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handlePhotoChange}
                      accept="image/*"
                  disabled={isUploading}
                    />
              </CardContent>
            </Card>

            {/* Estatísticas do Perfil */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Membro desde</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-600 px-3 py-1 rounded-full">
                    {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Último acesso</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-600 px-3 py-1 rounded-full">
                    Hoje
                  </span>
                </div>
            </CardContent>
           </Card>
        </div>

          {/* Coluna Direita - Formulários */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Atualize seu nome e endereço de e-mail.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField 
                      control={profileForm.control} 
                      name="name" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                {...field} 
                                className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Seu nome completo"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    
                    <FormField 
                      control={profileForm.control} 
                      name="email" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço de E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                type="email" 
                                {...field} 
                                className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="seu@email.com"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        Salvar Alterações
                      </Button>
                        </div>
                    </form>
                </Form>
                </CardContent>
            </Card>

            {/* Alterar Senha */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Atualize sua senha de acesso. Por segurança, recomendamos usar uma senha forte.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField 
                      control={passwordForm.control} 
                      name="currentPassword" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Senha Atual</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                type="password" 
                                {...field} 
                                className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Sua senha atual"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    
                    <FormField 
                      control={passwordForm.control} 
                      name="newPassword" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                type="password" 
                                {...field} 
                                className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Mínimo 6 caracteres"
                              />
                            </div>
                          </FormControl>
                          {field.value && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
                                <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <Progress 
                                value={(passwordStrength.score + 1) * 20} 
                                className="h-2"
                              />
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    
                    <FormField 
                      control={passwordForm.control} 
                      name="confirmPassword" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                type="password" 
                                {...field} 
                                className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Confirme sua nova senha"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        Mudar Senha
                      </Button>
                        </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

