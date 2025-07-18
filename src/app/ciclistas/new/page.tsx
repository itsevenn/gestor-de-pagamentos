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
import Link from 'next/link';
import { ArrowLeft, Trash2, Upload, User, Calendar, MapPin, Phone, CreditCard, FileText, Users, Home, Bike, CheckCircle, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCiclistas } from '@/context/app-context';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const formSchema = z.object({
  photoUrl: z.any().optional(),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  dataAdvento: z.string().min(1, 'Data do Advento é obrigatória'),
  nomeCiclista: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tipoSanguineo: z.string().min(1, 'Tipo sanguíneo é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  idade: z.string().min(1, 'Idade é obrigatória'),
  nacionalidade: z.string().min(1, 'Nacionalidade é obrigatória'),
  naturalidade: z.string().min(1, 'Naturalidade é obrigatória'),
  uf: z.string().min(1, 'UF é obrigatória'),
  rg: z.string().min(1, 'RG é obrigatório'),
  cpf: z.string().min(11, 'CPF deve ter pelo menos 11 dígitos'),
  pai: z.string().min(1, 'Nome do pai é obrigatório'),
  mae: z.string().min(1, 'Nome da mãe é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  celular: z.string().min(1, 'Celular é obrigatório'),
  telefoneResidencial: z.string().optional(),
  outrosContatos: z.string().optional(),
  referencia: z.string().optional(),
  cnpj: z.string().optional(),
  notaFiscal: z.string().min(1, 'Nota fiscal é obrigatória'),
  marcaModelo: z.string().min(1, 'Marca/Modelo é obrigatório'),
  numeroSerie: z.string().min(1, 'Número de série é obrigatório'),
  dataAquisicao: z.string().min(1, 'Data de aquisição é obrigatória'),
  observacoes: z.string().optional(),
  nomeConselheiro: z.string().min(1, 'Nome do conselheiro é obrigatório'),
  localData: z.string().min(1, 'Local e data são obrigatórios'),
});

export default function NewCiclistaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { ciclistas, addCiclista } = useCiclistas();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      photoUrl: '',
      matricula: '',
      dataAdvento: new Date().toISOString().split('T')[0],
      nomeCiclista: '',
      tipoSanguineo: '',
      dataNascimento: '',
      idade: '',
      nacionalidade: 'Brasileiro(a)',
      naturalidade: '',
      uf: '',
      rg: '',
      cpf: '',
      pai: '',
      mae: '',
      endereco: '',
      bairro: '',
      cidade: '',
      cep: '',
      estado: '',
      celular: '',
      telefoneResidencial: '',
      outrosContatos: '',
      referencia: '',
      cnpj: '',
      notaFiscal: '',
      marcaModelo: '',
      numeroSerie: '',
      dataAquisicao: '',
      observacoes: '',
      nomeConselheiro: '',
      localData: '',
    },
  });

  useEffect(() => {
    if (ciclistas.length > 0) {
      const maxMatricula = Math.max(...ciclistas.map(c => parseInt(c.matricula, 10)));
      const newMatricula = (maxMatricula + 1).toString().padStart(3, '0');
      form.setValue('matricula', newMatricula);
    } else {
      form.setValue('matricula', '001');
    }
  }, [ciclistas, form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('photoUrl', file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    form.setValue('photoUrl', null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalValues = { ...values };
    if (values.photoUrl && typeof values.photoUrl !== 'string') {
        finalValues.photoUrl = photoPreview || '';
    } else {
        finalValues.photoUrl = photoPreview || '';
    }
    
    addCiclista({
      ...finalValues,
    });

    toast({
      title: 'Ciclista Adicionado!',
      description: `O ciclista ${values.nomeCiclista} foi adicionado com sucesso.`,
    });
    router.push('/ciclistas');
  }

  // Gerar avatar baseado no nome do ciclista
  const nomeCiclista = form.watch('nomeCiclista');
  const ciclistaAvatarUrl = photoPreview;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header com gradiente */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              asChild
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
            >
              <Link href="/ciclistas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Adicionar Novo Ciclista
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Cadastro completo de novos membros do clube
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Informações do Ciclista
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Preencha todos os campos obrigatórios para cadastrar o novo ciclista
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Dados Pessoais */}
              <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Dados Pessoais</h2>
                  </div>
                  
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-4">
                      <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium mb-3">
                        <Upload className="h-4 w-4 text-blue-500" />
                        Foto do Ciclista
                      </FormLabel>
                      <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="relative">
                          {ciclistaAvatarUrl ? (
                            <Image
                              src={ciclistaAvatarUrl}
                              alt={`Foto de ${nomeCiclista}`}
                              width={150}
                              height={150}
                              className="object-cover w-full h-full"
                              data-ai-hint="cyclist photo"
                            />
                          ) : (
                            <UserCircle className="w-full h-full text-gray-400 bg-white dark:bg-gray-800 rounded-xl" />
                          )}
                        </div>
                        <div className="flex flex-col gap-3">
                          <Button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                          >
                                <Upload className="mr-2 h-4 w-4" />
                                Carregar Foto
                            </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleRemovePhoto}
                            className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover Foto
                            </Button>
                            <FormField control={form.control} name="photoUrl" render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input 
                                      type="file" 
                                      className="hidden" 
                                      ref={fileInputRef} 
                                      onChange={handlePhotoChange} 
                                      accept="image/*"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                  </div>
                    
                    <FormField control={form.control} name="matricula" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-purple-500" />
                          Matrícula
                        </FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="dataAdvento" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="h-4 w-4 text-green-500" />
                          Data do Advento
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="nomeCiclista" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="h-4 w-4 text-blue-500" />
                          Nome do Ciclista
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="tipoSanguineo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-red-500" />
                          Tipo Sanguíneo
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="dataNascimento" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          Data de Nascimento
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="idade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="h-4 w-4 text-orange-500" />
                          Idade
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="nacionalidade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          Nacionalidade
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="naturalidade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-green-500" />
                          Naturalidade
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="uf" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          UF
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="rg" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-slate-500" />
                          RG
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="cpf" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-slate-600" />
                          CPF
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
              </div>

                <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

              {/* Filiação */}
              <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Filiação</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="pai" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="h-4 w-4 text-blue-500" />
                          Nome do Pai
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mae" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="h-4 w-4 text-pink-500" />
                          Nome da Mãe
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
              </div>

                <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

              {/* Endereço e Contato */}
              <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                      <Home className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Endereço e Contato</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="endereco" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-green-500" />
                          Endereço
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bairro" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          Bairro
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="cidade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          Cidade
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="cep" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          CEP
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="estado" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-red-500" />
                          Estado
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="celular" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Phone className="h-4 w-4 text-green-500" />
                          Celular
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="telefoneResidencial" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Phone className="h-4 w-4 text-blue-500" />
                          Telefone Residencial
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="outrosContatos" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Phone className="h-4 w-4 text-orange-500" />
                          Outros Contatos
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="referencia" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="h-4 w-4 text-indigo-500" />
                          Referência
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
              </div>

                <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

              {/* Dados da Bicicleta */}
              <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg">
                      <Bike className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Dados da Bicicleta e Fiscais</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField control={form.control} name="cnpj" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-slate-500" />
                          CNPJ
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="notaFiscal" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-green-500" />
                          Nota Fiscal
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="marcaModelo" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Bike className="h-4 w-4 text-blue-500" />
                          Marca/Modelo
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="numeroSerie" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-purple-500" />
                          Número de Série
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dataAquisicao" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          Data da Aquisição
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
              </div>

                <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

              {/* Observações e Finalização */}
               <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Observações e Finalização</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="observacoes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <FileText className="h-4 w-4 text-slate-500" />
                          Observações
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nomeConselheiro" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="h-4 w-4 text-indigo-500" />
                          Nome do Conselheiro
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="localData" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="h-4 w-4 text-green-500" />
                          Local e Data
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                 </div>
               </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <Button 
                    type="button" 
                    variant="outline" 
                    asChild
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    <Link href="/ciclistas">Cancelar</Link>
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Salvar Ciclista
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
