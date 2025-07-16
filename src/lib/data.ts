'use server';

import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export type Client = {
  id: string;
  photoUrl?: string;
  matricula: string;
  dataAdvento: string;
  nomeCiclista: string;
  tipoSanguineo: string;
  dataNascimento: string;
  idade: string;
  nacionalidade: string;
  naturalidade: string;
  uf: string;
  rg: string;
  cpf: string;
  pai: string;
  mae: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  estado: string;
  celular: string;
  telefoneResidencial?: string;
  outrosContatos?: string;
  referencia?: string;
  cnpj?: string;
  notaFiscal: string;
  marcaModelo: string;
  numeroSerie: string;
  dataAquisicao: string;
  observacoes?: string;
  nomeConselheiro: string;
  localData: string;
  deletionReason?: string;
  deletionDate?: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  originalAmount: number;
  currentAmount: number;
  dueDate: string;
  issueDate: string;
  paymentDate?: string;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Pix' | 'Boleto';
  status: 'pending' | 'paid' | 'overdue' | 'refunded';
  paymentHistory?: string;
  observations?: string;
};

export type AuditLog = {
    id: string;
    date: string;
    user: string;
    action: string;
    details: string;
}

// NOTE: You will need to create the corresponding tables in your Postgres database.
// Example SQL for creating the clients table:
/*
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    photoUrl TEXT,
    matricula TEXT,
    dataAdvento TEXT,
    nomeCiclista TEXT,
    tipoSanguineo TEXT,
    dataNascimento TEXT,
    idade TEXT,
    nacionalidade TEXT,
    naturalidade TEXT,
    uf TEXT,
    rg TEXT,
    cpf TEXT,
    pai TEXT,
    mae TEXT,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    cep TEXT,
    estado TEXT,
    celular TEXT,
    telefoneResidencial TEXT,
    outrosContatos TEXT,
    referencia TEXT,
    cnpj TEXT,
    notaFiscal TEXT,
    marcaModelo TEXT,
    numeroSerie TEXT,
    dataAquisicao TEXT,
    observacoes TEXT,
    nomeConselheiro TEXT,
    localData TEXT
);
*/

// Client Functions
export const getClients = async (): Promise<Client[]> => {
  const result = await db.query('SELECT * FROM clients');
  return result.rows as Client[];
};

export const getDeletedClients = async (): Promise<Client[]> => {
    const result = await db.query('SELECT * FROM deleted_clients');
    return result.rows as Client[];
};

export const addClientDb = async (clientData: Omit<Client, 'id'>) => {
    const newId = uuidv4();
    const newClient = { id: newId, ...clientData };
    const columns = Object.keys(newClient).join(', ');
    const placeholders = Object.keys(newClient).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(newClient);
    await db.query(`INSERT INTO clients (${columns}) VALUES (${placeholders})`, values);
    return newId;
}

export const updateClientDb = async (client: Client) => {
    const { id, ...clientData } = client;
    const setClause = Object.keys(clientData).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(clientData)];
    await db.query(`UPDATE clients SET ${setClause} WHERE id = $1`, values);
}

export const deleteClientDb = async (clientId: string, reason: string) => {
    // This assumes you have a separate `deleted_clients` table
    const clientResult = await db.query('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length > 0) {
        const clientData = clientResult.rows[0];
        const deletedClientData = {
            ...clientData,
            deletionReason: reason,
            deletionDate: new Date().toISOString().split('T')[0],
        };

        const columns = Object.keys(deletedClientData).join(', ');
        const placeholders = Object.keys(deletedClientData).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(deletedClientData);

        await db.query(`INSERT INTO deleted_clients (${columns}) VALUES (${placeholders})`, values);
        await db.query('DELETE FROM clients WHERE id = $1', [clientId]);
    }
}

export const restoreClientDb = async (clientId: string) => {
    const deletedClientResult = await db.query('SELECT * FROM deleted_clients WHERE id = $1', [clientId]);
    if (deletedClientResult.rows.length > 0) {
        const { deletionReason, deletionDate, ...restoredClientData } = deletedClientResult.rows[0];
        
        const columns = Object.keys(restoredClientData).join(', ');
        const placeholders = Object.keys(restoredClientData).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(restoredClientData);

        await db.query(`INSERT INTO clients (${columns}) VALUES (${placeholders})`, values);
        await db.query('DELETE FROM deleted_clients WHERE id = $1', [clientId]);
    }
}


// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
    const result = await db.query('SELECT * FROM invoices');
    return result.rows as Invoice[];
};

export const addInvoiceDb = async (invoiceData: Omit<Invoice, 'id'>) => {
    const newId = uuidv4();
    const newInvoice = { id: newId, ...invoiceData };
    const columns = Object.keys(newInvoice).join(', ');
    const placeholders = Object.keys(newInvoice).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(newInvoice);
    await db.query(`INSERT INTO invoices (${columns}) VALUES (${placeholders})`, values);
    return newId;
}

export const updateInvoiceDb = async (invoice: Invoice) => {
    const { id, ...invoiceData } = invoice;
    const setClause = Object.keys(invoiceData).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(invoiceData)];
    await db.query(`UPDATE invoices SET ${setClause} WHERE id = $1`, values);
}

// AuditLog Functions
export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const result = await db.query('SELECT * FROM audit_logs ORDER BY date DESC');
    return result.rows as AuditLog[];
};

export const addAuditLogDb = async (logData: Omit<AuditLog, 'id'>) => {
    const newId = uuidv4();
    const newLog = { id: newId, ...logData };
    const columns = Object.keys(newLog).join(', ');
    const placeholders = Object.keys(newLog).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(newLog);
    await db.query(`INSERT INTO audit_logs (${columns}) VALUES (${placeholders})`, values);
}
