
'use client';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Eye, Users, UserPlus, Search } from 'lucide-react';
import { useCiclistas } from '@/context/app-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DeletedCiclistasHistory } from '@/components/deleted-ciclistas-history';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function CiclistasPage() {
  const { ciclistas, deleteCiclista } = useCiclistas();
  const { toast } = useToast();
  const [deletionReason, setDeletionReason] = useState('');
  const [selectedCiclistaId, setSelectedCiclistaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = () => {
    if (selectedCiclistaId) {
      deleteCiclista(selectedCiclistaId, deletionReason || 'Nenhum motivo fornecido.');
      toast({
        title: 'Ciclista Excluído!',
        description: 'O ciclista foi movido para o histórico.',
      });
      setDeletionReason('');
      setSelectedCiclistaId(null);
    }
  };

  const openDialog = (ciclistaId: string) => {
    setSelectedCiclistaId(ciclistaId);
  }

  const closeDialog = () => {
    setSelectedCiclistaId(null);
    setDeletionReason('');
  }

  // Filtra ciclistas baseado no termo de busca
  const filteredCiclistas = ciclistas.filter(ciclista =>
    ciclista.nomeCiclista.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ciclista.cpf.includes(searchTerm) ||
    ciclista.celular.includes(searchTerm) ||
    ciclista.matricula.includes(searchTerm)
  );

  return (
    <AlertDialog open={!!selectedCiclistaId} onOpenChange={(open) => !open && closeDialog()}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col gap-8">
            {/* Header */}
        <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ciclistas</h1>
                <p className="text-gray-600 dark:text-gray-400">Gerencie seus ciclistas e veja seus detalhes</p>
              </div>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Link href="/ciclistas/new">
                  <UserPlus className="mr-2 h-5 w-5" />
              Adicionar Ciclista
            </Link>
          </Button>
        </div>

            {/* Card Principal */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Lista de Ciclistas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
              Gerencie seus ciclistas e veja seus detalhes.
            </CardDescription>
          </CardHeader>
              <CardContent className="p-6">
                {/* Barra de Busca */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar ciclistas por nome, CPF, celular ou matrícula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Lista de Ciclistas */}
                <div className="space-y-4">
                  {filteredCiclistas.map((ciclista) => (
                    <div key={ciclista.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {ciclista.nomeCiclista}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          CPF: {ciclista.cpf}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {ciclista.celular}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Matrícula: {ciclista.matricula}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Link href={`/ciclistas/${ciclista.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <Link href={`/ciclistas/${ciclista.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Abrir menu de ações" title="Abrir menu de ações">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <DropdownMenuLabel className="text-gray-900 dark:text-white">Ações</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Link href={`/ciclistas/${ciclista.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Link href={`/ciclistas/${ciclista.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDialog(ciclista.id)} className="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                               </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {filteredCiclistas.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'Nenhum ciclista encontrado' : 'Nenhum ciclista cadastrado'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm 
                          ? 'Tente ajustar os termos de busca.' 
                          : 'Comece adicionando seu primeiro ciclista.'
                        }
                      </p>
                      {!searchTerm && (
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                          <Link href="/ciclistas/new">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Adicionar Primeiro Ciclista
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
          </CardContent>
        </Card>
        
            {/* Histórico de Ciclistas Excluídos */}
            <DeletedCiclistasHistory />
          </div>
        </div>
      </div>

      <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 dark:text-white">Tem certeza que deseja excluir este ciclista?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            Esta ação irá mover o ciclista para o histórico de excluídos. Você pode informar o motivo abaixo:
            </AlertDialogDescription>
          <div className="space-y-2">
            <Label htmlFor="deletionReason" className="text-gray-700 dark:text-gray-300">Motivo da exclusão</Label>
            <Textarea 
              id="deletionReason"
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)} 
              placeholder="Motivo da exclusão"
              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </AlertDialogHeader>
          <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
