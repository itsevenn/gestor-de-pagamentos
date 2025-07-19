'use server';

import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export type Ciclista = {
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
  ciclistaId: string;
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
// Example SQL for creating the ciclistas table:
/*
CREATE TABLE ciclistas (
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

// Ciclista Functions
export const getCiclistas = async (): Promise<Ciclista[]> => {
  const { data, error } = await supabase.from('ciclistas').select('*');
  if (error) throw error;
  return data as Ciclista[];
};

export const getDeletedCiclistas = async (): Promise<Ciclista[]> => {
    const result = await supabase.from('ciclistas_deletados').select('*');
    return result.data as Ciclista[];
};

export const addCiclistaDb = async (ciclistaData: Omit<Ciclista, 'id'>) => {
  const newId = uuidv4();
  const { error } = await supabase.from('ciclistas').insert([{ id: newId, ...ciclistaData }]);
  if (error) throw error;
  return newId;
};

export const updateCiclistaDb = async (ciclista: Ciclista) => {
  const { id, changeReason, changes, ...ciclistaData } = ciclista;
  const { error } = await supabase.from('ciclistas').update(ciclistaData).eq('id', id);
  if (error) throw error;
};

export const deleteCiclistaDb = async (ciclistaId: string) => {
  const { error } = await supabase.from('ciclistas').delete().eq('id', ciclistaId);
  if (error) throw error;
};

export const restoreCiclistaDb = async (ciclistaId: string) => {
    const deletedCiclistaResult = await supabase.from('ciclistas_deletados').select('*').eq('id', ciclistaId);
    if (deletedCiclistaResult.data && deletedCiclistaResult.data.length > 0) {
        const { deletionReason, deletionDate, ...restoredCiclistaData } = deletedCiclistaResult.data[0];
        
        const columns = Object.keys(restoredCiclistaData).join(', ');
        const placeholders = Object.keys(restoredCiclistaData).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(restoredCiclistaData);

        await supabase.from('ciclistas').insert([{ id: ciclistaId, ...restoredCiclistaData }]);
        await supabase.from('ciclistas_deletados').delete().eq('id', ciclistaId);
    }
}


// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
    const result = await supabase.from('invoices').select('*');
    return result.data as Invoice[];
};

export const addInvoiceDb = async (invoiceData: Omit<Invoice, 'id'>) => {
    const newId = uuidv4();
    let newInvoice: Record<string, any> = { id: newId, ...invoiceData };
    // Proteção extra: se vier ciclistaid minúsculo, converte para camelCase
    if ('ciclistaid' in newInvoice && !('ciclistaId' in newInvoice)) {
        newInvoice.ciclistaId = newInvoice['ciclistaid'];
        delete newInvoice['ciclistaid'];
    }
    const columns = Object.keys(newInvoice).map(col => `"${col}"`).join(', ');
    const placeholders = Object.keys(newInvoice).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(newInvoice);
    await supabase.from('invoices').insert([{ id: newId, ...newInvoice }]);
    return newId;
}

export const updateInvoiceDb = async (invoice: Invoice) => {
    const { id, changeReason, changes, ...invoiceData } = invoice;
    // Proteção extra: remove duplicatas ignorando case
    const seen = new Set<string>();
    const filteredInvoiceData: Record<string, any> = {};
    for (const key of Object.keys(invoiceData)) {
        const lower = key.toLowerCase();
        if (!seen.has(lower)) {
            seen.add(lower);
            filteredInvoiceData[key] = invoiceData[key];
        }
    }
    const setClause = Object.keys(filteredInvoiceData).map((key, i) => `"${key}" = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(filteredInvoiceData)];
    await supabase.from('invoices').update(filteredInvoiceData).eq('id', id);
}

// AuditLog Functions
export const getAuditLogs = async (): Promise<AuditLog[]> => {
    try {
        const result = await supabase.from('audit_logs').select('*').order('date', { ascending: false });
        if (result.error) {
            console.error('Erro ao buscar logs de auditoria:', result.error);
            return [];
        }
        return result.data as AuditLog[];
    } catch (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        return [];
    }
};

export const addAuditLogDb = async (logData: Omit<AuditLog, 'id'>) => {
    try {
        const newId = uuidv4();
        const newLog = { id: newId, ...logData };
        const result = await supabase.from('audit_logs').insert([newLog]);
        if (result.error) {
            console.error('Erro ao adicionar log de auditoria:', result.error);
        }
    } catch (error) {
        console.error('Erro ao adicionar log de auditoria:', error);
    }
}
