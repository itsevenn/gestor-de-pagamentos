import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

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

// Client Functions
export const getClients = async (): Promise<Client[]> => {
  const querySnapshot = await getDocs(collection(db, "clients"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const getDeletedClients = async (): Promise<Client[]> => {
    const querySnapshot = await getDocs(collection(db, "deletedClients"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const addClientDb = async (clientData: Omit<Client, 'id'>) => {
    const docRef = await addDoc(collection(db, "clients"), clientData);
    return docRef.id;
}

export const updateClientDb = async (client: Client) => {
    const { id, ...clientData } = client;
    await updateDoc(doc(db, "clients", id), clientData);
}

export const deleteClientDb = async (clientId: string, reason: string) => {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
        const clientData = clientSnap.data();
        const deletedClientData = {
            ...clientData,
            deletionReason: reason,
            deletionDate: new Date().toISOString().split('T')[0],
        };
        const batch = writeBatch(db);
        batch.set(doc(db, "deletedClients", clientId), deletedClientData);
        batch.delete(clientRef);
        await batch.commit();
    }
}

export const restoreClientDb = async (clientId: string) => {
    const clientRef = doc(db, "deletedClients", clientId);
    const clientSnap = await getDoc(clientRef);
     if (clientSnap.exists()) {
        const clientData = clientSnap.data();
        const { deletionReason, deletionDate, ...restoredClientData } = clientData;

        const batch = writeBatch(db);
        batch.set(doc(db, "clients", clientId), restoredClientData);
        batch.delete(clientRef);
        await batch.commit();
    }
}


// Invoice Functions
export const getInvoices = async (): Promise<Invoice[]> => {
    const querySnapshot = await getDocs(collection(db, "invoices"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
};

export const addInvoiceDb = async (invoiceData: Omit<Invoice, 'id'>) => {
    const docRef = await addDoc(collection(db, "invoices"), invoiceData);
    return docRef.id;
}

export const updateInvoiceDb = async (invoice: Invoice) => {
    const { id, ...invoiceData } = invoice;
    await updateDoc(doc(db, "invoices", id), invoiceData);
}

// AuditLog Functions
export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const querySnapshot = await getDocs(collection(db, "auditLogs"));
    const logs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addAuditLogDb = async (logData: Omit<AuditLog, 'id'>) => {
    await addDoc(collection(db, "auditLogs"), logData);
}
