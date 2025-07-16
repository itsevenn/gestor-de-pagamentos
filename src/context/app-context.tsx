
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
    addClient: (client: Client) => void;
    updateClient: (updatedClient: Client) => void;
    deleteClient: (clientId: string, reason: string) => void;
    restoreClient: (clientId: string) => void;
    addAuditLog: (log: Omit<AuditLog, 'id' | 'date'>) => void;
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

    const addClient = (client: Client) => {
        setClients(prevClients => [...prevClients, client]);
        addAuditLog({
            user: 'Admin',
            action: 'Cliente Criado',
            details: `Cliente ${client.name} foi adicionado.`,
        });
    };

    const updateClient = (updatedClient: Client) => {
        setClients(prevClients => 
            prevClients.map(client => client.id === updatedClient.id ? updatedClient : client)
        );
        addAuditLog({
            user: 'Admin',
            action: 'Cliente Atualizado',
            details: `Dados do cliente ${updatedClient.name} foram atualizados.`,
        });
    };

    const deleteClient = (clientId: string, reason: string) => {
        const clientToDelete = clients.find(c => c.id === clientId);
        if (clientToDelete) {
            const deletedClient = {
                ...clientToDelete,
                deletionReason: reason,
                deletionDate: new Date().toISOString().split('T')[0],
            };
            setClients(prevClients => prevClients.filter(client => client.id !== clientId));
            setDeletedClients(prevDeleted => [...prevDeleted, deletedClient]);
            addAuditLog({
                user: 'Admin',
                action: 'Cliente Excluído',
                details: `Cliente ${clientToDelete.name} foi excluído. Motivo: ${reason}`,
            });
        }
    };

    const restoreClient = (clientId: string) => {
        const clientToRestore = deletedClients.find(c => c.id === clientId);
        if (clientToRestore) {
            const { deletionReason, deletionDate, ...restoredClient } = clientToRestore;
            setDeletedClients(prevDeleted => prevDeleted.filter(client => client.id !== clientId));
            setClients(prevClients => [...prevClients, restoredClient]);
            addAuditLog({
                user: 'Admin',
                action: 'Cliente Restaurado',
                details: `Cliente ${clientToRestore.name} foi restaurado.`,
            });
        }
    };

    const contextValue = {
        clients,
        invoices,
        auditLogs,
        deletedClients,
        addClient,
        updateClient,
        deleteClient,
        restoreClient,
        addAuditLog
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
    return { invoices: context.invoices };
};

export const useAuditLogs = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAuditLogs must be used within an AppProvider');
    }
    return { auditLogs: context.auditLogs };
};
