
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef } from 'react';

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

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
    },
  });
  
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updatePhoto(result);
        profileForm.setValue('photoUrl', result);
        toast({ title: 'Foto de Perfil Atualizada!' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    updatePhoto(''); // Set to empty string or a default placeholder
    profileForm.setValue('photoUrl', '');
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    toast({ title: 'Foto de Perfil Removida!' });
  };


  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    updateUser({ name: values.name, email: values.email });
    toast({
      title: 'Perfil Atualizado!',
      description: 'Seus detalhes foram salvos com sucesso.',
    });
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Gerenciar Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
           <Card>
            <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                    <AvatarImage src={user.photoUrl || 'https://placehold.co/128x128.png'} alt={user.name} data-ai-hint="person avatar" />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 w-full">
                    <Button type="button" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Carregar Nova Foto
                    </Button>
                    <Button type="button" variant="outline" onClick={handleRemovePhoto}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover Foto
                    </Button>
                    <Input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handlePhotoChange}
                      accept="image/*"
                    />
                </div>
            </CardContent>
           </Card>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
                <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seu nome e endereço de e-mail.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField control={profileForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={profileForm.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Endereço de E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <div className="flex justify-end pt-2">
                            <Button type="submit">Salvar Alterações</Button>
                        </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Atualize sua senha de acesso. Por segurança, recomendamos usar uma senha forte.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                         <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => ( <FormItem><FormLabel>Senha Atual</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={passwordForm.control} name="newPassword" render={({ field }) => ( <FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => ( <FormItem><FormLabel>Confirmar Nova Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <div className="flex justify-end pt-2">
                            <Button type="submit">Mudar Senha</Button>
                        </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

