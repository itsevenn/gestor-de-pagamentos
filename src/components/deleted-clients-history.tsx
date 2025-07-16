
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
import { useClients } from '@/context/app-context';
import { Button } from './ui/button';
import { MoreHorizontal, Eye, Undo, History } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function DeletedClientsHistory() {
  const { deletedClients, restoreClient } = useClients();
  const { toast } = useToast();

  if (deletedClients.length === 0) {
    return null;
  }

  const handleRestore = (clientId: string) => {
    restoreClient(clientId);
    toast({
        title: 'Cliente Restaurado!',
        description: 'O cliente foi movido de volta para a lista de clientes ativos.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Clientes Excluídos</CardTitle>
        <CardDescription>
          Clientes que foram removidos da lista principal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Data da Exclusão</TableHead>
              <TableHead>Motivo da Exclusão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deletedClients.map((client) => (
              <TableRow key={client.id} className="bg-muted/50">
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.deletionDate}</TableCell>
                <TableCell>{client.deletionReason}</TableCell>
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
                            <Link href={`/clients/${client.id}?tab=audit`}>
                              <History className="mr-2 h-4 w-4" /> Ver Auditoria
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRestore(client.id)}>
                             <Undo className="mr-2 h-4 w-4" /> Restaurar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
