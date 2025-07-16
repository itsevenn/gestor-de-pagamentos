'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInvoices, useClients, useAuditLogs } from '@/context/app-context';
import Link from 'next/link';
import { ArrowLeft, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const DetailItem = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-base font-semibold">{value || '-'}</p>
  </div>
);

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const id = use(params).id;
  const { clients, deletedClients } = useClients();
  const { invoices } = useInvoices();
  const { auditLogs } = useAuditLogs();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState(defaultTab);


  const allClients = [...clients, ...deletedClients];
  const client = allClients.find((c) => c.id === id);
  const isDeleted = deletedClients.some((c) => c.id === id);
  const clientInvoices = invoices.filter((inv) => inv.clientId === id);
  const clientAuditLogs = auditLogs.filter(log => log.details.includes(client?.nomeCiclista || ''));

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  if (!client) {
    return <div>Ciclista não encontrado</div>;
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const statusConfig = {
    paid: { variant: 'secondary', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700', label: 'Pago' },
    pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700', label: 'Pendente' },
    overdue: { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700', label: 'Atrasado' },
    refunded: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-700', label: 'Reembolsado' },
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{client.nomeCiclista}</h1>
        {isDeleted && (
            <Badge variant="destructive" className="flex items-center gap-1">
                <UserX className="h-3 w-3" />
                Excluído
            </Badge>
        )}
      </div>

      <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Ciclista</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailItem label="Matrícula" value={client.matricula} />
                  <DetailItem label="Data do Advento" value={client.dataAdvento} />
                  <DetailItem label="Tipo Sanguíneo" value={client.tipoSanguineo} />
                  <DetailItem label="Data de Nascimento" value={client.dataNascimento} />
                  <DetailItem label="Idade" value={client.idade} />
                  <DetailItem label="Nacionalidade" value={client.nacionalidade} />
                  <DetailItem label="Naturalidade" value={client.naturalidade} />
                  <DetailItem label="UF" value={client.uf} />
                  <DetailItem label="RG" value={client.rg} />
                  <DetailItem label="CPF" value={client.cpf} />
                </div>
              </div>
              <Separator/>
              <div>
                <h3 className="text-lg font-semibold mb-2">Filiação</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <DetailItem label="Pai" value={client.pai} />
                   <DetailItem label="Mãe" value={client.mae} />
                </div>
              </div>
              <Separator/>
              <div>
                <h3 className="text-lg font-semibold mb-2">Endereço e Contato</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailItem label="Endereço" value={client.endereco} />
                  <DetailItem label="Bairro" value={client.bairro} />
                  <DetailItem label="Cidade" value={client.cidade} />
                  <DetailItem label="CEP" value={client.cep} />
                  <DetailItem label="Estado" value={client.estado} />
                  <DetailItem label="Celular" value={client.celular} />
                  <DetailItem label="Telefone Residencial" value={client.telefoneResidencial} />
                  <DetailItem label="Outros Contatos" value={client.outrosContatos} />
                  <DetailItem label="Referência" value={client.referencia} />
                </div>
              </div>
              <Separator/>
               <div>
                <h3 className="text-lg font-semibold mb-2">Dados da Bicicleta e Fiscais</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DetailItem label="CNPJ" value={client.cnpj} />
                  <DetailItem label="Nota Fiscal" value={client.notaFiscal} />
                  <DetailItem label="Marca/Modelo" value={client.marcaModelo} />
                  <DetailItem label="Número de Série" value={client.numeroSerie} />
                  <DetailItem label="Data da Aquisição" value={client.dataAquisicao} />
                </div>
              </div>
              <Separator/>
              <div>
                <h3 className="text-lg font-semibold mb-2">Observações e Finalização</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Observações" value={client.observacoes} />
                    <DetailItem label="Nome do Conselheiro" value={client.nomeConselheiro} />
                    <DetailItem label="Local e Data" value={client.localData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Faturas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID da Fatura</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Vencimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientInvoices.length > 0 ? clientInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id.toUpperCase()}</TableCell>
                      <TableCell>{formatCurrency(invoice.currentAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[invoice.status].variant} className={cn('capitalize', statusConfig[invoice.status].className)}>
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/invoices/${invoice.id}`}>Ver Fatura</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Nenhuma fatura encontrada para este ciclista.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
           <Card>
            <CardHeader>
                <CardTitle>Trilha de Auditoria</CardTitle>
                <CardDescription>Histórico de todas as alterações relacionadas a este ciclista.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Detalhes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientAuditLogs.length > 0 ? clientAuditLogs.map(log => (
                            <TableRow key={log.id}>
                                <TableCell>{log.date}</TableCell>
                                <TableCell>{log.user}</TableCell>
                                <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                                <TableCell>{log.details}</TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                              <TableCell colSpan={4} className="text-center">Nenhum registro de auditoria encontrado para este ciclista.</TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
