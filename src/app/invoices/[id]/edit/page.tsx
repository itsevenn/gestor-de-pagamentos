
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
import { ArrowLeft, Receipt, User, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInvoices, useCiclistas } from '@/context/app-context';
import { Separator } from '@/components/ui/separator';
import { use, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  ciclistaId: z.string().min(1, 'Ciclista é obrigatório'),
  originalAmount: z.string().min(1, 'Valor original é obrigatório'),
  currentAmount: z.string().min(1, 'Valor atual é obrigatório'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  status: z.enum(['pending', 'paid', 'overdue', 'refunded']),
  paymentMethod: z.string().optional(),
  issueDate: z.string().min(1, 'Data de emissão é obrigatória'),
});

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const router = useRouter();
  const { invoices, updateInvoice } = useInvoices();
  const { ciclistas } = useCiclistas();
  const invoice = invoices.find((inv) => inv.id === id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ciclistaId: '',
      originalAmount: '',
      currentAmount: '',
      dueDate: '',
      status: 'pending',
      paymentMethod: '',
      issueDate: '',
    },
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        ciclistaId: invoice.ciclistaId,
        originalAmount: invoice.originalAmount.toString(),
        currentAmount: invoice.currentAmount.toString(),
        dueDate: invoice.dueDate,
        status: invoice.status,
        paymentMethod: invoice.paymentMethod || '',
        issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
      });
    }
  }, [invoice, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!invoice) return;

    updateInvoice({
      id: invoice.id,
      ...values,
      originalAmount: Number(values.originalAmount),
      currentAmount: Number(values.currentAmount),
    });

    toast({
      title: 'Fatura Atualizada!',
      description: `A fatura ${invoice.id.toUpperCase()} foi atualizada com sucesso.`,
    });
    router.push('/invoices');
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fatura não encontrada</h1>
            <Button asChild>
              <Link href="/invoices">Voltar para Lista</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              asChild
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
            >
              <Link href="/invoices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Editar Fatura
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Modificar informações da fatura {invoice.id.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-slate-700 dark:to-slate-600">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              Informações da Fatura
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Atualize os campos necessários para modificar a fatura
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ciclista */}
                  <FormField
                    control={form.control}
                    name="ciclistaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="h-4 w-4 text-blue-500" />
                          Ciclista
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                              <SelectValue placeholder="Selecione um ciclista" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ciclistas.map(ciclista => (
                              <SelectItem key={ciclista.id} value={ciclista.id}>
                                {ciclista.nomeCiclista}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CreditCard className="h-4 w-4 text-green-500" />
                          Status
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="overdue">Vencido</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valor Original */}
                  <FormField
                    control={form.control}
                    name="originalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          Valor Original
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valor Atual */}
                  <FormField
                    control={form.control}
                    name="currentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          Valor Atual
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Data de Vencimento */}
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          Data de Vencimento
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Data de Emissão */}
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          Data de Emissão
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Método de Pagamento */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <CreditCard className="h-4 w-4 text-indigo-500" />
                          Método de Pagamento
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: PIX, Cartão, Dinheiro"
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-600" />

                {/* Botões */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Link href="/invoices">Cancelar</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-md"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Atualizar Fatura
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
