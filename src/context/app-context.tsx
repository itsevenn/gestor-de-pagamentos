
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
    getClients,
    getInvoices,
    getAuditLogs,
    getDeletedClients,
    addClientDb,
    updateClientDb,
    deleteClientDb,
    restoreClientDb,
    addInvoiceDb,
    updateInvoiceDb,
    addAuditLogDb,
    type Client,
    type Invoice,
    type AuditLog
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
    addAuditLog: (log: Omit<AuditLog, 'id' | 'date' | 'user'>) => void;
    addInvoice: (invoiceData: Omit<Invoice, 'id'>) => void;
    updateInvoice: (updatedInvoice: Invoice, auditDetails?: string) => void;
    loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [deletedClients, setDeletedClients] = useState<Client[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [clientsData, invoicesData, auditLogsData, deletedClientsData] = await Promise.all([
                    getClients(),
                    getInvoices(),
                    getAuditLogs(),
                    getDeletedClients()
                ]);
                setClients(clientsData);
                setInvoices(invoicesData);
                setAuditLogs(auditLogsData);
                setDeletedClients(deletedClientsData);
            } catch (error) {
                console.error("Falha ao buscar dados iniciais do Firestore:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addAuditLog = async (log: Omit<AuditLog, 'id' | 'date' | 'user'>) => {
        const newLog: Omit<AuditLog, 'id'> = {
            ...log,
            user: 'Admin', // Ou o usuário logado
            date: new Date().toISOString(),
        };
        await addAuditLogDb(newLog);
        setAuditLogs(prevLogs => [{...newLog, id: `log-${Date.now()}`}, ...prevLogs]);
    };

    const addClient = async (clientData: Omit<Client, 'id'>) => {
        setLoading(true);
        try {
            const newClientId = await addClientDb(clientData);
            const newClient = { ...clientData, id: newClientId };
            setClients(prevClients => [...prevClients, newClient]);
            await addAuditLog({
                action: 'Ciclista Criado',
                details: `Ciclista ${newClient.nomeCiclista} foi adicionado.`,
            });
        } catch (error) {
            console.error("Erro ao adicionar ciclista:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateClient = async (updatedClient: Client) => {
        setLoading(true);
        try {
            await updateClientDb(updatedClient);
            setClients(prevClients => 
                prevClients.map(client => client.id === updatedClient.id ? updatedClient : client)
            );
            await addAuditLog({
                action: 'Ciclista Atualizado',
                details: `Dados do ciclista ${updatedClient.nomeCiclista} foram atualizados.`,
            });
        } catch (error) {
            console.error("Erro ao atualizar ciclista:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteClient = async (clientId: string, reason: string) => {
        setLoading(true);
        try {
            const clientToDelete = clients.find(c => c.id === clientId);
            if (clientToDelete) {
                await deleteClientDb(clientId, reason);
                const deletedClient = { 
                    ...clientToDelete, 
                    deletionReason: reason, 
                    deletionDate: new Date().toISOString().split('T')[0]
                };
                setClients(prevClients => prevClients.filter(client => client.id !== clientId));
                setDeletedClients(prevDeleted => [...prevDeleted, deletedClient]);
                await addAuditLog({
                    action: 'Ciclista Excluído',
                    details: `Ciclista ${clientToDelete.nomeCiclista} foi excluído. Motivo: ${reason}`,
                });
            }
        } catch (error) {
            console.error("Erro ao excluir ciclista:", error);
        } finally {
            setLoading(false);
        }
    };

    const restoreClient = async (clientId: string) => {
        setLoading(true);
        try {
            const clientToRestore = deletedClients.find(c => c.id === clientId);
            if(clientToRestore){
                await restoreClientDb(clientId);
                const { deletionReason, deletionDate, ...restoredClient } = clientToRestore;
                setDeletedClients(prevDeleted => prevDeleted.filter(client => client.id !== clientId));
                setClients(prevClients => [...prevClients, restoredClient as Client]);
                await addAuditLog({
                    action: 'Ciclista Restaurado',
                    details: `Ciclista ${clientToRestore.nomeCiclista} foi restaurado.`,
                });
            }
        } catch (error) {
            console.error("Erro ao restaurar ciclista:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
        setLoading(true);
        try {
            const newInvoiceId = await addInvoiceDb(invoiceData);
            const newInvoice = { ...invoiceData, id: newInvoiceId };
            setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
            const clientName = clients.find(c => c.id === newInvoice.clientId)?.nomeCiclista || 'Desconhecido';
            await addAuditLog({
                action: 'Fatura Criada',
                details: `Fatura ${newInvoice.id.toUpperCase()} criada para ${clientName}.`,
            });
        } catch (error) {
            console.error("Erro ao adicionar fatura:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateInvoice = async (updatedInvoice: Invoice, auditDetails?: string) => {
        setLoading(true);
        try {
            await updateInvoiceDb(updatedInvoice);
            setInvoices(prevInvoices => 
                prevInvoices.map(invoice => invoice.id === updatedInvoice.id ? updatedInvoice : invoice)
            );

            const originalInvoice = invoices.find(inv => inv.id === updatedInvoice.id);
            const allClients = [...clients, ...deletedClients];
            const client = allClients.find(c => c.id === updatedInvoice.clientId);
            
            let details = `Fatura ${updatedInvoice.id.toUpperCase()} para ${client?.nomeCiclista || 'Desconhecido'} foi atualizada.`;
            if (auditDetails) {
                details = `Fatura ${updatedInvoice.id.toUpperCase()} para ${client?.nomeCiclista || 'Desconhecido'} ${auditDetails}`;
            } else if (originalInvoice && originalInvoice.status !== updatedInvoice.status) {
                details = `Status da fatura ${updatedInvoice.id.toUpperCase()} para ${client?.nomeCiclista || 'Desconhecido'} alterado para ${updatedInvoice.status}.`;
            }
            await addAuditLog({
                action: 'Fatura Atualizada',
                details: details,
            });
        } catch (error) {
            console.error("Erro ao atualizar fatura:", error);
        } finally {
            setLoading(false);
        }
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
        addInvoice,
        updateInvoice,
        loading
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
        loading: context.loading
     };
};

export const useInvoices = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useInvoices must be used within an AppProvider');
    }
    return { 
        invoices: context.invoices,
        addInvoice: context.addInvoice,
        updateInvoice: context.updateInvoice,
        loading: context.loading
    };
};

export const useAuditLogs = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAuditLogs must be used within an AppProvider');
    }
    return { auditLogs: context.auditLogs, loading: context.loading, addAuditLog: context.addAuditLog };
};
