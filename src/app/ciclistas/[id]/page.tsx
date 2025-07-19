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
import { useInvoices, useCiclistas, useAuditLogs } from '@/context/app-context';
import Link from 'next/link';
import { ArrowLeft, UserX, User, Calendar, MapPin, Phone, CreditCard, FileText, Users, Home, Bike, Activity, Clock, Receipt, CheckCircle, UserCircle } from 'lucide-react';
import { CiclistaChangesHistory } from '@/components/ciclista-changes-history';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const DetailItem = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
    {icon && <div className="text-blue-500">{icon}</div>}
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
      <p className="text-base font-semibold text-slate-900 dark:text-white">{value || '-'}</p>
    </div>
  </div>
);

export default function CiclistaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ciclistas, deletedCiclistas } = useCiclistas();
  const { invoices } = useInvoices();
  const { auditLogs } = useAuditLogs();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('perfil');

  const allClients = [...ciclistas, ...deletedCiclistas];
  const ciclista = allClients.find((c) => c.id === id);
  const isDeleted = deletedCiclistas.some((c) => c.id === id);

  const ciclistaInvoices = invoices.filter((inv) => inv.ciclistaId === id);
  const ciclistaAuditLogs = auditLogs.filter((log) => log.ciclistaId === id);

  const totalPaid = ciclistaInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, inv) => acc + Number(inv.currentAmount), 0);

  const totalPending = ciclistaInvoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + Number(inv.currentAmount), 0);

  const overdueInvoices = ciclistaInvoices.filter((inv) => inv.status === 'overdue');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!ciclista) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ciclista não encontrado</h1>
            <Button asChild>
              <Link href="/ciclistas">Voltar para Lista</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Gerar avatar do ciclista
  const ciclistaAvatarUrl = ciclista.photoUrl;

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
                  {ciclista.nomeCiclista}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Perfil completo do ciclista
                </p>
              </div>
            </div>
            {isDeleted && (
              <Badge variant="destructive" className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-md">
                <UserX className="h-3 w-3" />
                Excluído
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs com design moderno */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="perfil" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="faturas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Receipt className="w-4 h-4 mr-2" />
              Faturas
            </TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="acoes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Activity className="w-4 h-4 mr-2" />
              Ações
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo do Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Detalhes do Ciclista
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Informações completas do perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Foto do Ciclista */}
                  <div className="w-full md:w-1/4">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative rounded-xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
                        {ciclistaAvatarUrl ? (
                          <Image
                            src={ciclistaAvatarUrl}
                            alt={`Foto de ${ciclista.nomeCiclista}`}
                            width={150}
                            height={150}
                            className="object-cover w-full h-full"
                            data-ai-hint="cyclist photo"
                          />
                        ) : (
                          <UserCircle className="w-full h-full text-gray-400 bg-white dark:bg-gray-800 rounded-xl" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dados Pessoais */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailItem label="Matrícula" value={ciclista.matricula} icon={<CreditCard className="w-4 h-4" />} />
                      <DetailItem label="Nome Completo" value={ciclista.nomeCiclista} icon={<User className="w-4 h-4" />} />
                      <DetailItem label="Data de Nascimento" value={ciclista.dataNascimento} icon={<Calendar className="w-4 h-4" />} />
                      <DetailItem label="Idade" value={ciclista.idade} icon={<Activity className="w-4 h-4" />} />
                      <DetailItem label="CPF" value={ciclista.cpf} icon={<CreditCard className="w-4 h-4" />} />
                      <DetailItem label="RG" value={ciclista.rg} icon={<CreditCard className="w-4 h-4" />} />
                      <DetailItem label="Tipo Sanguíneo" value={ciclista.tipoSanguineo} icon={<Activity className="w-4 h-4" />} />
                      <DetailItem label="Nacionalidade" value={ciclista.nacionalidade} icon={<MapPin className="w-4 h-4" />} />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-600" />

                {/* Informações de Contato */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-500" />
                    Informações de Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Celular" value={ciclista.celular} icon={<Phone className="w-4 h-4" />} />
                    <DetailItem label="Telefone Residencial" value={ciclista.telefoneResidencial} icon={<Phone className="w-4 h-4" />} />
                    <DetailItem label="Endereço" value={ciclista.endereco} icon={<Home className="w-4 h-4" />} />
                    <DetailItem label="Bairro" value={ciclista.bairro} icon={<Home className="w-4 h-4" />} />
                    <DetailItem label="Cidade" value={ciclista.cidade} icon={<MapPin className="w-4 h-4" />} />
                    <DetailItem label="Estado" value={ciclista.estado} icon={<MapPin className="w-4 h-4" />} />
                    <DetailItem label="CEP" value={ciclista.cep} icon={<MapPin className="w-4 h-4" />} />
                    <DetailItem label="Outros Contatos" value={ciclista.outrosContatos} icon={<Phone className="w-4 h-4" />} />
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-600" />

                {/* Informações da Bicicleta */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-green-500" />
                    Informações da Bicicleta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Marca/Modelo" value={ciclista.marcaModelo} icon={<Bike className="w-4 h-4" />} />
                    <DetailItem label="Número de Série" value={ciclista.numeroSerie} icon={<Bike className="w-4 h-4" />} />
                    <DetailItem label="Data de Aquisição" value={ciclista.dataAquisicao} icon={<Calendar className="w-4 h-4" />} />
                    <DetailItem label="CNPJ" value={ciclista.cnpj} icon={<CreditCard className="w-4 h-4" />} />
                    <DetailItem label="Nota Fiscal" value={ciclista.notaFiscal} icon={<FileText className="w-4 h-4" />} />
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-600" />

                {/* Informações Adicionais */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Informações Adicionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Nome do Conselheiro" value={ciclista.nomeConselheiro} icon={<Users className="w-4 h-4" />} />
                    <DetailItem label="Data de Advento" value={ciclista.dataAdvento} icon={<Calendar className="w-4 h-4" />} />
                    <DetailItem label="Local e Data" value={ciclista.localData} icon={<MapPin className="w-4 h-4" />} />
                    <DetailItem label="Referência" value={ciclista.referencia} icon={<User className="w-4 h-4" />} />
                  </div>
                  {ciclista.observacoes && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Observações:</p>
                      <p className="text-slate-900 dark:text-white">{ciclista.observacoes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo das Faturas */}
          <TabsContent value="faturas" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      Faturas do Ciclista
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Histórico completo de pagamentos
                    </CardDescription>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Link href={`/invoices/new?ciclistaId=${ciclista.id}`}>
                      Nova Fatura
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Resumo Financeiro */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800 dark:text-green-200">Total Pago</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      R$ {totalPaid.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800 dark:text-yellow-200">Pendente</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      R$ {totalPending.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800 dark:text-red-200">Faturas Vencidas</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {overdueInvoices.length}
                    </p>
                  </div>
                </div>

                {/* Tabela de Faturas */}
                {ciclistaInvoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-700">
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">Valor</TableHead>
                          <TableHead className="font-semibold">Vencimento</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ciclistaInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                            <TableCell className="font-medium">{invoice.id.toUpperCase()}</TableCell>
                            <TableCell>R$ {Number(invoice.currentAmount).toFixed(2)}</TableCell>
                            <TableCell>{invoice.dueDate}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={invoice.status === 'paid' ? 'secondary' : invoice.status === 'overdue' ? 'destructive' : 'default'}
                                className={cn(
                                  invoice.status === 'paid' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                                  invoice.status === 'overdue' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                                  invoice.status === 'pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                )}
                              >
                                {invoice.status === 'paid' ? 'Pago' : invoice.status === 'overdue' ? 'Vencido' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/invoices/${invoice.id}`}>Ver Detalhes</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Nenhuma fatura encontrada para este ciclista.</p>
                    <Button asChild className="mt-4">
                      <Link href={`/invoices/new?ciclistaId=${ciclista.id}`}>
                        Criar Primeira Fatura
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo do Histórico */}
          <TabsContent value="historico" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  Histórico de Atividades do Ciclista
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Todas as modificações realizadas no perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <CiclistaChangesHistory ciclistaId={ciclista.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo das Ações */}
          <TabsContent value="acoes" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  Ações Disponíveis
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Gerencie o perfil do ciclista
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-6 h-auto">
                    <Link href={`/ciclistas/${ciclista.id}/edit`}>
                      <User className="w-6 h-6 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Editar Perfil</div>
                        <div className="text-sm opacity-90">Modificar informações do ciclista</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-6 h-auto">
                    <Link href={`/invoices/new?ciclistaId=${ciclista.id}`}>
                      <Receipt className="w-6 h-6 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Nova Fatura</div>
                        <div className="text-sm opacity-90">Criar fatura para este ciclista</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 h-auto">
                    <Link href={`/ciclistas/${ciclista.id}?tab=faturas`}>
                      <FileText className="w-6 h-6 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Ver Faturas</div>
                        <div className="text-sm opacity-90">Visualizar histórico de pagamentos</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-6 h-auto">
                    <Link href={`/ciclistas/${ciclista.id}?tab=historico`}>
                      <Clock className="w-6 h-6 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Ver Histórico</div>
                        <div className="text-sm opacity-90">Acompanhar atividades recentes</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
