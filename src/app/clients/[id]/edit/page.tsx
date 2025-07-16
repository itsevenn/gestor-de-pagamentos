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
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido.'),
  email: z.string().email('E-mail inválido.'),
  phone: z.string().min(10, 'Telefone inválido.'),
  street: z.string().min(2, 'A rua deve ter pelo menos 2 caracteres.'),
  city: z.string().min(2, 'A cidade deve ter pelo menos 2 caracteres.'),
  state: z.string().min(2, 'O estado deve ter pelo menos 2 caracteres.'),
  zipCode: z.string().min(8, 'CEP inválido.'),
});

export default function EditClientPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const { clients, updateClient } = useClients();
  const client = clients.find((c) => c.id === params.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        cpfCnpj: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
    },
  });
  
  useEffect(() => {
    if (client) {
        form.reset({
            name: client.name,
            cpfCnpj: client.cpfCnpj,
            email: client.contact.email,
            phone: client.contact.phone,
            street: client.address.street,
            city: client.address.city,
            state: client.address.state,
            zipCode: client.address.zipCode,
        });
    }
  }, [client, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!client) return;

    updateClient({
        ...client,
        name: values.name,
        cpfCnpj: values.cpfCnpj,
        contact: {
            email: values.email,
            phone: values.phone,
        },
        address: {
            street: values.street,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
        },
    });

    toast({
      title: 'Cliente Atualizado!',
      description: `O cliente ${values.name} foi atualizado com sucesso.`,
    });
    router.push('/clients');
  }

  if (!client) {
    return <div>Cliente não encontrado.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Editar Cliente</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>Atualize os detalhes do cliente abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="cpfCnpj"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: 123.456.789-00 ou 12.345.678/0001-90" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: joao.silva@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: (11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Rua</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Rua das Flores, 123" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: São Paulo" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: SP" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                     <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: 01000-000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                 </div>
              </div>
              <div className="flex justify-end gap-2">
                 <Button type="button" variant="outline" asChild>
                    <Link href="/clients">Cancelar</Link>
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
