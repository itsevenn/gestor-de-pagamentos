'use server';

import { db } from './db';
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
  const result = await db.query('SELECT * FROM ciclistas');
  console.log('DEBUG getCiclistas - raw result:', result.rows);
  return result.rows as Ciclista[];
};

export const getDeletedCiclistas = async (): Promise<Ciclista[]> => {
    const result = await db.query('SELECT * FROM ciclistas_deletados');
    return result.rows as Ciclista[];
};

export const addCiclistaDb = async (ciclistaData: Omit<Ciclista, 'id'>) => {
    const newId = uuidv4();
    let newCiclista: any = { id: newId, ...ciclistaData };
    // Proteção extra: se vier nomeciclista minúsculo, converte para camelCase
    if ('nomeciclista' in newCiclista && !('nomeCiclista' in newCiclista)) {
        newCiclista.nomeCiclista = newCiclista['nomeciclista'];
        delete newCiclista['nomeciclista'];
    }
    // Debug: imprimir objeto e colunas
    console.log('DEBUG newCiclista:', newCiclista);
    const columns = Object.keys(newCiclista).map(col => `"${col}"`).join(', ');
    console.log('DEBUG columns:', columns);
    const placeholders = Object.keys(newCiclista).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(newCiclista);
    await db.query(`INSERT INTO ciclistas (${columns}) VALUES (${placeholders})`, values);
    return newId;
}

export const updateCiclistaDb = async (ciclista: Ciclista) => {
    const { id, ...ciclistaData } = ciclista;
    
    // Debug: imprimir dados que estão sendo atualizados
    console.log('DEBUG updateCiclistaDb - ciclistaData:', ciclistaData);
    
    // Proteção extra: remove duplicatas ignorando case e garante camelCase
    const seen = new Set<string>();
    const filteredCiclistaData: Record<string, any> = {};
    for (const key of Object.keys(ciclistaData)) {
        const lower = key.toLowerCase();
        if (!seen.has(lower)) {
            seen.add(lower);
            filteredCiclistaData[key] = ciclistaData[key];
        }
    }
    
    // Debug: imprimir dados filtrados
    console.log('DEBUG updateCiclistaDb - filteredCiclistaData:', filteredCiclistaData);
    
    const setClause = Object.keys(filteredCiclistaData).map((key, i) => `"${key}" = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(filteredCiclistaData)];
    
    // Debug: imprimir query e valores
    console.log('DEBUG updateCiclistaDb - query:', `UPDATE ciclistas SET ${setClause} WHERE id = $1`);
    console.log('DEBUG updateCiclistaDb - values:', values);
    
    await db.query(`UPDATE ciclistas SET ${setClause} WHERE id = $1`, values);
}

export const deleteCiclistaDb = async (ciclistaId: string, reason: string) => {
    // Assume que você tem uma tabela separada `ciclistas_deletados`
    const ciclistaResult = await db.query('SELECT * FROM ciclistas WHERE id = $1', [ciclistaId]);
    if (ciclistaResult.rows.length > 0) {
        const ciclistaData = ciclistaResult.rows[0];
        const deletedCiclistaData = {
            ...ciclistaData,
            deletionReason: reason,
            deletionDate: new Date().toISOString().split('T')[0],
        };

        const columns = Object.keys(deletedCiclistaData).join(', ');
        const placeholders = Object.keys(deletedCiclistaData).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(deletedCiclistaData);

        await db.query(`INSERT INTO ciclistas_deletados (${columns}) VALUES (${placeholders})`, values);
        await db.query('DELETE FROM ciclistas WHERE id = $1', [ciclistaId]);
    }
}

export const restoreCiclistaDb = async (ciclistaId: string) => {
    const deletedCiclistaResult = await db.query('SELECT * FROM ciclistas_deletados WHERE id = $1', [ciclistaId]);
    if (deletedCiclistaResult.rows.length > 0) {
        const { deletionReason, deletionDate, ...restoredCiclistaData } = deletedCiclistaResult.rows[0];
        
        const columns = Object.keys(restoredCiclistaData).join(', ');
        const placeholders = Object.keys(restoredCiclistaData).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(restoredCiclistaData);

        await db.query(`INSERT INTO ciclistas (${columns}) VALUES (${placeholders})`, values);
        await db.query('DELETE FROM ciclistas_deletados WHERE id = $1', [ciclistaId]);
    }
}


// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
    const result = await db.query('SELECT * FROM invoices');
    console.log('DEBUG getInvoices - raw result:', result.rows);
    return result.rows as Invoice[];
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
    await db.query(`INSERT INTO invoices (${columns}) VALUES (${placeholders})`, values);
    return newId;
}

export const updateInvoiceDb = async (invoice: Invoice) => {
    const { id, ...invoiceData } = invoice;
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
    const columns = Object.keys(newLog)
      .map(col => col === 'user' ? '"user"' : col)
      .join(', ');
    const placeholders = Object.keys(newLog).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(newLog);
    await db.query(`INSERT INTO audit_logs (${columns}) VALUES (${placeholders})`, values);
}
