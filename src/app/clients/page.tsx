
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Eye } from 'lucide-react';
import { useClients } from '@/context/app-context';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DeletedClientsHistory } from '@/components/deleted-clients-history';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ClientsPage() {
  const { clients, deleteClient } = useClients();
  const { toast } = useToast();
  const [deletionReason, setDeletionReason] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handleDelete = () => {
    if (selectedClientId) {
      deleteClient(selectedClientId, deletionReason || 'Nenhum motivo fornecido.');
      toast({
        title: 'Cliente Excluído!',
        description: 'O cliente foi movido para o histórico.',
      });
      setDeletionReason('');
      setSelectedClientId(null);
    }
  };

  return (
    <AlertDialog onOpenChange={(open) => {
      if (!open) {
        setSelectedClientId(null);
      }
    }}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Clientes</h1>
          <Button asChild>
            <Link href="/clients/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Gerencie seus clientes e veja seus detalhes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Ciclista</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Celular</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.nomeCiclista}</TableCell>
                    <TableCell>{client.cpf}</TableCell>
                    <TableCell>{client.celular}</TableCell>
                    <TableCell>{client.matricula}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${client.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${client.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </Link>
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem
                                  onSelect={(e) => { e.preventDefault(); setSelectedClientId(client.id) }}
                                  className="text-destructive focus:text-destructive focus:bg-red-100 dark:focus:bg-red-900/50"
                                >
                                 <Trash2 className="mr-2 h-4 w-4" /> Excluir
                               </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Você tem certeza absoluta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá mover o cliente para o histórico de clientes excluídos. Por favor, informe o motivo da exclusão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="reason">Motivo da Exclusão</Label>
            <Textarea 
              placeholder="Digite o motivo aqui..." 
              id="reason"
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)} 
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletionReason('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>

        <DeletedClientsHistory />
      </div>
    </AlertDialog>
  );
}
