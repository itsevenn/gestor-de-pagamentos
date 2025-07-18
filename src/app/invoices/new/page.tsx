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
import { ArrowLeft, FileText, DollarSign, Calendar, CreditCard, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInvoices, useCiclistas } from '@/context/app-context';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  ciclistaId: z.string().min(1, "Ciclista é obrigatório"),
  originalAmount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  paymentMethod: z.enum(['Credit Card', 'Bank Transfer', 'PayPal', 'Pix', 'Boleto']),
  status: z.enum(['pending', 'paid', 'overdue', 'refunded']),
  observations: z.string().optional(),
});

export default function NewInvoicePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addInvoice } = useInvoices();
  const { ciclistas } = useCiclistas();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ciclistaId: '',
      originalAmount: 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentMethod: 'Pix',
      status: 'pending',
      observations: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addInvoice({
      ...values,
      currentAmount: values.originalAmount,
    });

    const ciclistaName = ciclistas.find(c => c.id === values.ciclistaId)?.nomeCiclista;

    toast({
      title: 'Fatura Criada!',
      description: `A fatura para ${ciclistaName} foi criada com sucesso.`,
    });
    router.push('/invoices');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header com gradiente */}
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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Criar Nova Fatura
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Gerenciamento de faturas e pagamentos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card principal com gradiente */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                  Detalhes da Fatura
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Preencha os detalhes para criar uma nova fatura
                </CardDescription>
              </div>
            </div>
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
                            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Status
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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

                  {/* Valor da Fatura */}
                  <FormField 
                    control={form.control} 
                    name="originalAmount" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          Valor da Fatura
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0,00"
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
                            {...field} 
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          <Calendar className="h-4 w-4 text-red-500" />
                          Data de Vencimento
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
                </div>

                {/* Observações */}
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <FileText className="h-4 w-4 text-slate-500" />
                        Observações
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Adicione observações sobre a fatura..." 
                          {...field} 
                          className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botões de ação */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button 
                    type="button" 
                    variant="outline" 
                    asChild
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    <Link href="/invoices">Cancelar</Link>
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Salvar Fatura
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
