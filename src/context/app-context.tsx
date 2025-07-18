
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
    getCiclistas,
    getInvoices,
    getAuditLogs,
    getDeletedCiclistas,
    addCiclistaDb,
    updateCiclistaDb,
    deleteCiclistaDb,
    restoreCiclistaDb,
    addInvoiceDb,
    updateInvoiceDb,
    addAuditLogDb,
    type Ciclista,
    type Invoice,
    type AuditLog
} from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
    ciclistas: Ciclista[];
    invoices: Invoice[];
    auditLogs: AuditLog[];
    deletedCiclistas: Ciclista[];
    addCiclista: (ciclista: Omit<Ciclista, 'id'>) => void;
    updateCiclista: (updatedCiclista: Ciclista) => void;
    deleteCiclista: (ciclistaId: string, reason: string) => void;
    restoreCiclista: (ciclistaId: string) => void;
    addAuditLog: (log: Omit<AuditLog, 'id' | 'date' | 'user'>) => void;
    addInvoice: (invoiceData: Omit<Invoice, 'id'>) => void;
    updateInvoice: (updatedInvoice: Invoice, auditDetails?: string) => void;
    loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [ciclistas, setCiclistas] = useState<Ciclista[]>([]);
    const [deletedCiclistas, setDeletedCiclistas] = useState<Ciclista[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ciclistasData, invoicesData, auditLogsData, deletedCiclistasData] = await Promise.all([
                    getCiclistas(),
                    getInvoices(),
                    getAuditLogs(),
                    getDeletedCiclistas()
                ]);
                setCiclistas(ciclistasData);
                setInvoices(invoicesData);
                setAuditLogs(auditLogsData);
                setDeletedCiclistas(deletedCiclistasData);
            } catch (error) {
                console.error("Falha ao buscar dados iniciais:", error);
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
        const auditLogs = await getAuditLogs();
        setAuditLogs(auditLogs);
    };

    const addCiclista = async (ciclistaData: Omit<Ciclista, 'id'>) => {
        setLoading(true);
        try {
            const newCiclistaId = await addCiclistaDb(ciclistaData);
            const newCiclista = { ...ciclistaData, id: newCiclistaId };
            setCiclistas(prevCiclistas => [...prevCiclistas, newCiclista]);
            await addAuditLog({
                action: 'Ciclista Criado',
                details: `Ciclista ${newCiclista.nomeCiclista} foi adicionado.`,
            });
        } catch (error) {
            console.error("Erro ao adicionar ciclista:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateCiclista = async (updatedCiclista: Ciclista) => {
        setLoading(true);
        try {
            await updateCiclistaDb(updatedCiclista);
            setCiclistas(prevCiclistas => 
                prevCiclistas.map(ciclista => ciclista.id === updatedCiclista.id ? updatedCiclista : ciclista)
            );
            await addAuditLog({
                action: 'Ciclista Atualizado',
                details: `Dados do ciclista ${updatedCiclista.nomeCiclista} foram atualizados.`,
            });
        } catch (error) {
            console.error("Erro ao atualizar ciclista:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCiclista = async (ciclistaId: string, reason: string) => {
        setLoading(true);
        try {
            const ciclistaToDelete = ciclistas.find(c => c.id === ciclistaId);
            if (ciclistaToDelete) {
                await deleteCiclistaDb(ciclistaId, reason);
                const deletedCiclista = { 
                    ...ciclistaToDelete, 
                    deletionReason: reason, 
                    deletionDate: new Date().toISOString().split('T')[0]
                };
                setCiclistas(prevCiclistas => prevCiclistas.filter(ciclista => ciclista.id !== ciclistaId));
                setDeletedCiclistas(prevDeleted => [...prevDeleted, deletedCiclista]);
                await addAuditLog({
                    action: 'Ciclista Excluído',
                    details: `Ciclista ${ciclistaToDelete.nomeCiclista} foi excluído. Motivo: ${reason}`,
                });
            }
        } catch (error) {
            console.error("Erro ao excluir ciclista:", error);
        } finally {
            setLoading(false);
        }
    };

    const restoreCiclista = async (ciclistaId: string) => {
        setLoading(true);
        try {
            const ciclistaToRestore = deletedCiclistas.find(c => c.id === ciclistaId);
            if(ciclistaToRestore){
                await restoreCiclistaDb(ciclistaId);
                const { deletionReason, deletionDate, ...restoredCiclista } = ciclistaToRestore;
                setDeletedCiclistas(prevDeleted => prevDeleted.filter(ciclista => ciclista.id !== ciclistaId));
                setCiclistas(prevCiclistas => [...prevCiclistas, restoredCiclista as Ciclista]);
                await addAuditLog({
                    action: 'Ciclista Restaurado',
                    details: `Ciclista ${ciclistaToRestore.nomeCiclista} foi restaurado.`,
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
            const ciclistaName = ciclistas.find(c => c.id === newInvoice.ciclistaId)?.nomeCiclista || 'Desconhecido';
            await addAuditLog({
                action: 'Fatura Criada',
                details: `Fatura ${newInvoice.id.toUpperCase()} criada para ${ciclistaName}.`,
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
            const allCiclistas = [...ciclistas, ...deletedCiclistas];
            const ciclista = allCiclistas.find(c => c.id === updatedInvoice.ciclistaId);
            
            let details = `Fatura ${updatedInvoice.id.toUpperCase()} para ${ciclista?.nomeCiclista || 'Desconhecido'} foi atualizada.`;
            if (auditDetails) {
                details = `Fatura ${updatedInvoice.id.toUpperCase()} para ${ciclista?.nomeCiclista || 'Desconhecido'} ${auditDetails}`;
            } else if (originalInvoice && originalInvoice.status !== updatedInvoice.status) {
                details = `Status da fatura ${updatedInvoice.id.toUpperCase()} para ${ciclista?.nomeCiclista || 'Desconhecido'} alterado para ${updatedInvoice.status}.`;
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
        ciclistas,
        invoices,
        auditLogs,
        deletedCiclistas,
        addCiclista,
        updateCiclista,
        deleteCiclista,
        restoreCiclista,
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

export const useCiclistas = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useCiclistas must be used within an AppProvider');
    }
    return { 
        ciclistas: context.ciclistas, 
        addCiclista: context.addCiclista,
        updateCiclista: context.updateCiclista,
        deleteCiclista: context.deleteCiclista,
        restoreCiclista: context.restoreCiclista,
        deletedCiclistas: context.deletedCiclistas,
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
