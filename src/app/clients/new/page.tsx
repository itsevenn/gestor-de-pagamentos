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
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClients } from '@/context/app-context';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  photoUrl: z.string().optional(),
  matricula: z.string().min(1, 'Campo obrigatório'),
  dataAdvento: z.string().min(1, 'Campo obrigatório'),
  nomeCiclista: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  tipoSanguineo: z.string().min(1, 'Campo obrigatório'),
  dataNascimento: z.string().min(1, 'Campo obrigatório'),
  idade: z.string().min(1, 'Campo obrigatório'),
  nacionalidade: z.string().min(1, 'Campo obrigatório'),
  naturalidade: z.string().min(1, 'Campo obrigatório'),
  uf: z.string().min(2, 'UF deve ter 2 caracteres.'),
  rg: z.string().min(1, 'Campo obrigatório'),
  cpf: z.string().min(11, 'CPF inválido.'),
  pai: z.string().min(1, 'Campo obrigatório'),
  mae: z.string().min(1, 'Campo obrigatório'),
  endereco: z.string().min(1, 'Campo obrigatório'),
  bairro: z.string().min(1, 'Campo obrigatório'),
  cidade: z.string().min(1, 'Campo obrigatório'),
  cep: z.string().min(8, 'CEP inválido.'),
  estado: z.string().min(2, 'Estado deve ter 2 caracteres.'),
  celular: z.string().min(10, 'Celular inválido.'),
  telefoneResidencial: z.string().optional(),
  outrosContatos: z.string().optional(),
  referencia: z.string().optional(),
  cnpj: z.string().optional(),
  notaFiscal: z.string().min(1, 'Campo obrigatório'),
  marcaModelo: z.string().min(1, 'Campo obrigatório'),
  numeroSerie: z.string().min(1, 'Campo obrigatório'),
  dataAquisicao: z.string().min(1, 'Campo obrigatório'),
  observacoes: z.string().optional(),
  nomeConselheiro: z.string().min(1, 'Campo obrigatório'),
  localData: z.string().min(1, 'Campo obrigatório'),
});

export default function NewClientPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addClient } = useClients();

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would handle file upload here.
    // For now, we'll just use a placeholder if a file is selected.
    const finalValues = { ...values };
    if (values.photoUrl) {
      finalValues.photoUrl = 'https://placehold.co/150x150.png';
    }
    
    addClient({
      ...finalValues,
    });

    toast({
      title: 'Ciclista Adicionado!',
      description: `O ciclista ${values.nomeCiclista} foi adicionado com sucesso.`,
    });
    router.push('/clients');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Adicionar Novo Ciclista</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Formulário de Cadastro</CardTitle>
          <CardDescription>Preencha os detalhes abaixo para adicionar um novo ciclista.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Dados Pessoais */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="photoUrl" render={({ field }) => ( <FormItem className="md:col-span-4"><FormLabel>Foto do Ciclista</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="matricula" render={({ field }) => ( <FormItem><FormLabel>Matrícula</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="dataAdvento" render={({ field }) => ( <FormItem><FormLabel>Data do Advento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="nomeCiclista" render={({ field }) => ( <FormItem className="md:col-span-2 lg:col-span-2"><FormLabel>Nome do Ciclista</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="tipoSanguineo" render={({ field }) => ( <FormItem><FormLabel>Tipo Sanguíneo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="dataNascimento" render={({ field }) => ( <FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="idade" render={({ field }) => ( <FormItem><FormLabel>Idade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="nacionalidade" render={({ field }) => ( <FormItem><FormLabel>Nacionalidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="naturalidade" render={({ field }) => ( <FormItem><FormLabel>Naturalidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="uf" render={({ field }) => ( <FormItem><FormLabel>UF</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="rg" render={({ field }) => ( <FormItem><FormLabel>RG</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="cpf" render={({ field }) => ( <FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </div>

              <Separator />

              {/* Filiação */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Filiação</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="pai" render={({ field }) => ( <FormItem><FormLabel>Nome do Pai</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="mae" render={({ field }) => ( <FormItem><FormLabel>Nome da Mãe</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </div>

              <Separator />

              {/* Endereço e Contato */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Endereço e Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="endereco" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="bairro" render={({ field }) => ( <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="cidade" render={({ field }) => ( <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="cep" render={({ field }) => ( <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="estado" render={({ field }) => ( <FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="celular" render={({ field }) => ( <FormItem><FormLabel>Celular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="telefoneResidencial" render={({ field }) => ( <FormItem><FormLabel>Telefone Residencial</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="outrosContatos" render={({ field }) => ( <FormItem><FormLabel>Outros Contatos</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                   <FormField control={form.control} name="referencia" render={({ field }) => ( <FormItem><FormLabel>Referência</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </div>

              <Separator />

              {/* Dados da Bicicleta */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Dados da Bicicleta e Fiscais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField control={form.control} name="cnpj" render={({ field }) => ( <FormItem><FormLabel>CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="notaFiscal" render={({ field }) => ( <FormItem><FormLabel>Nota Fiscal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="marcaModelo" render={({ field }) => ( <FormItem><FormLabel>Marca/Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="numeroSerie" render={({ field }) => ( <FormItem><FormLabel>Número de Série</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="dataAquisicao" render={({ field }) => ( <FormItem><FormLabel>Data da Aquisição</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </div>

              <Separator />

              {/* Observações e Finalização */}
               <div>
                <h2 className="text-xl font-semibold mb-4">Observações e Finalização</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="observacoes" render={({ field }) => ( <FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="nomeConselheiro" render={({ field }) => ( <FormItem><FormLabel>Nome do Conselheiro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="localData" render={({ field }) => ( <FormItem><FormLabel>Local e Data</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                 </div>
               </div>

              <div className="flex justify-end gap-2 pt-8">
                 <Button type="button" variant="outline" asChild>
                    <Link href="/clients">Cancelar</Link>
                </Button>
                <Button type="submit">Salvar Ciclista</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
