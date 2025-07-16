
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

export function DeletedClientsHistory() {
  const { deletedClients } = useClients();

  if (deletedClients.length === 0) {
    return null;
  }

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
              <TableHead>E-mail de Contato</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deletedClients.map((client) => (
              <TableRow key={client.id} className="bg-muted/50">
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.contact.email}</TableCell>
                <TableCell>{client.cpfCnpj}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
