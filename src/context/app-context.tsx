
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
    clients as initialClients, 
    invoices as initialInvoices, 
    auditLogs as initialAuditLogs,
    Client,
    Invoice,
    AuditLog
} from '@/lib/data';

interface AppContextType {
    clients: Client[];
    invoices: Invoice[];
    auditLogs: AuditLog[];
    deletedClients: Client[];
    addClient: (client: Omit<Client, 'id'>) => void;
    updateClient: (updatedClient: Client) => void;
    deleteClient: (clientId: string, reason: string) => void;
    restoreClient: (clientId: string) => void;
    addAuditLog: (log: Omit<AuditLog, 'id' | 'date'>) => void;
    updateInvoice: (updatedInvoice: Invoice) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [deletedClients, setDeletedClients] = useState<Client[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

    const addAuditLog = (log: Omit<AuditLog, 'id' | 'date'>) => {
        const newLog: AuditLog = {
            ...log,
            id: `log-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
        };
        setAuditLogs(prevLogs => [newLog, ...prevLogs]);
    };

    const addClient = (clientData: Omit<Client, 'id'>) => {
        const newClient: Client = {
            id: `cli-${Date.now()}`,
            ...clientData,
        };
        setClients(prevClients => [...prevClients, newClient]);
        addAuditLog({
            user: 'Admin',
            action: 'Ciclista Criado',
            details: `Ciclista ${newClient.nomeCiclista} foi adicionado.`,
        });
    };

    const updateClient = (updatedClient: Client) => {
        setClients(prevClients => 
            prevClients.map(client => client.id === updatedClient.id ? updatedClient : client)
        );
        addAuditLog({
            user: 'Admin',
            action: 'Ciclista Atualizado',
            details: `Dados do ciclista ${updatedClient.nomeCiclista} foram atualizados.`,
        });
    };

    const deleteClient = (clientId: string, reason: string) => {
        const clientToDelete = clients.find(c => c.id === clientId);
        if (clientToDelete) {
            const deletedClient: Client = {
                ...clientToDelete,
                deletionReason: reason,
                deletionDate: new Date().toISOString().split('T')[0],
            };
            setClients(prevClients => prevClients.filter(client => client.id !== clientId));
            setDeletedClients(prevDeleted => [...prevDeleted, deletedClient]);
            addAuditLog({
                user: 'Admin',
                action: 'Ciclista Excluído',
                details: `Ciclista ${clientToDelete.nomeCiclista} foi excluído. Motivo: ${reason}`,
            });
        }
    };

    const restoreClient = (clientId: string) => {
        const clientToRestore = deletedClients.find(c => c.id === clientId);
        if (clientToRestore) {
            const { deletionReason, deletionDate, ...restoredClient } = clientToRestore;
            setDeletedClients(prevDeleted => prevDeleted.filter(client => client.id !== clientId));
            setClients(prevClients => [...prevClients, restoredClient as Client]);
            addAuditLog({
                user: 'Admin',
                action: 'Ciclista Restaurado',
                details: `Ciclista ${clientToRestore.nomeCiclista} foi restaurado.`,
            });
        }
    };

    const updateInvoice = (updatedInvoice: Invoice) => {
        const originalInvoice = invoices.find(inv => inv.id === updatedInvoice.id);
        setInvoices(prevInvoices => 
            prevInvoices.map(invoice => invoice.id === updatedInvoice.id ? updatedInvoice : invoice)
        );

        let details = `Fatura ${updatedInvoice.id.toUpperCase()} foi atualizada.`;
        if (originalInvoice && originalInvoice.status !== updatedInvoice.status) {
            details = `Status da fatura ${updatedInvoice.id.toUpperCase()} alterado para ${updatedInvoice.status}.`;
        }
        addAuditLog({
            user: 'Admin',
            action: 'Fatura Atualizada',
            details: details,
        });
    }

    const contextValue = {
        clients,
        invoices,
        auditLogs,
        deletedClients,
        addClient,
        updateClient,
        deleteClient,
        restoreClient,
        addAuditLog,
        updateInvoice
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useClients = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useClients must be used within an AppProvider');
    }
    return { 
        clients: context.clients, 
        addClient: context.addClient,
        updateClient: context.updateClient,
        deleteClient: context.deleteClient,
        restoreClient: context.restoreClient,
        deletedClients: context.deletedClients,
     };
};

export const useInvoices = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useInvoices must be used within an AppProvider');
    }
    return { 
        invoices: context.invoices,
        updateInvoice: context.updateInvoice 
    };
};

export const useAuditLogs = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAuditLogs must be used within an AppProvider');
    }
    return { auditLogs: context.auditLogs };
};
