
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInvoices, useClients } from '@/context/app-context';
import { useEffect, use, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  clientId: z.string().min(1, "Ciclista é obrigatório"),
  originalAmount: z.coerce.number().min(0, "Valor deve ser positivo"),
  currentAmount: z.coerce.number().min(0, "Valor deve ser positivo"),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  paymentMethod: z.enum(['Credit Card', 'Bank Transfer', 'PayPal', 'Pix', 'Boleto']),
  status: z.enum(['pending', 'paid', 'overdue', 'refunded']),
  observations: z.string().optional(),
  valueCorrectionReason: z.string().optional(),
}).refine(data => {
    // This is a placeholder for server-side logic to check if amounts have changed.
    // In the component, we'll manually trigger this check.
    return true;
}, {});

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const id = use(params).id;
  const { toast } = useToast();
  const router = useRouter();
  const { invoices, updateInvoice } = useInvoices();
  const { clients } = useClients();
  const invoice = invoices.find((inv) => inv.id === id);
  
  const [isAmountChanged, setIsAmountChanged] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      originalAmount: 0,
      currentAmount: 0,
      issueDate: '',
      dueDate: '',
      observations: '',
      valueCorrectionReason: '',
    },
  });

  const watchedOriginalAmount = form.watch('originalAmount');
  const watchedCurrentAmount = form.watch('currentAmount');
  
  useEffect(() => {
    if (invoice) {
      form.reset({
        ...invoice,
        observations: invoice.observations || '',
        valueCorrectionReason: '',
      });
    }
  }, [invoice, form]);

  useEffect(() => {
      if (invoice) {
        const originalAmountChanged = invoice.originalAmount !== watchedOriginalAmount;
        const currentAmountChanged = invoice.currentAmount !== watchedCurrentAmount;
        setIsAmountChanged(originalAmountChanged || currentAmountChanged);
      }
  }, [watchedOriginalAmount, watchedCurrentAmount, invoice]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!invoice) return;

    if (isAmountChanged && !values.valueCorrectionReason) {
        form.setError('valueCorrectionReason', {
            type: 'manual',
            message: 'O motivo da correção do valor é obrigatório.',
        });
        return;
    }

    let auditDetails = `Fatura ${invoice.id.toUpperCase()} atualizada.`;

    if (isAmountChanged) {
        const originalAmountDiff = values.originalAmount !== invoice.originalAmount ? `Valor original alterado de ${invoice.originalAmount} para ${values.originalAmount}.` : '';
        const currentAmountDiff = values.currentAmount !== invoice.currentAmount ? `Valor atual alterado de ${invoice.currentAmount} para ${values.currentAmount}.` : '';
        auditDetails = `Valores da fatura ${invoice.id.toUpperCase()} atualizados. ${originalAmountDiff} ${currentAmountDiff} Motivo: ${values.valueCorrectionReason}`;
    }

    updateInvoice({
      id: invoice.id,
      ...values,
    }, auditDetails);

    toast({
      title: 'Fatura Atualizada!',
      description: `A fatura ${invoice.id.toUpperCase()} foi atualizada com sucesso.`,
    });
    router.push('/invoices');
  }

  if (!invoice) {
    return <div>Fatura não encontrada.</div>
  }

  const clientName = clients.find(c => c.id === invoice.clientId)?.nomeCiclista || 'Desconhecido';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Editar Fatura {invoice.id.toUpperCase()}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Fatura</CardTitle>
          <CardDescription>Atualize os detalhes da fatura para {clientName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Ciclista</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um ciclista" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>{client.nomeCiclista}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um status" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                   <SelectItem value="pending">Pendente</SelectItem>
                                   <SelectItem value="paid">Pago</SelectItem>
                                   <SelectItem value="overdue">Atrasado</SelectItem>
                                   <SelectItem value="refunded">Reembolsado</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="originalAmount" render={({ field }) => ( <FormItem><FormLabel>Valor Original</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="currentAmount" render={({ field }) => ( <FormItem><FormLabel>Valor Atual</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="issueDate" render={({ field }) => ( <FormItem><FormLabel>Data de Emissão</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="dueDate" render={({ field }) => ( <FormItem><FormLabel>Data de Vencimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Método de Pagamento</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um método" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                   <SelectItem value="Credit Card">Cartão de Crédito</SelectItem>
                                   <SelectItem value="Bank Transfer">Transferência Bancária</SelectItem>
                                   <SelectItem value="PayPal">PayPal</SelectItem>
                                   <SelectItem value="Pix">Pix</SelectItem>
                                   <SelectItem value="Boleto">Boleto</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="observations"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Adicione observações sobre a fatura..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {isAmountChanged && (
                        <FormField
                            control={form.control}
                            name="valueCorrectionReason"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Motivo da Correção do Valor</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descreva o motivo da alteração do valor..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
              <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="outline" asChild>
                    <Link href="/invoices">Cancelar</Link>
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
