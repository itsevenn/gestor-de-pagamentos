
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
    Ciclista, 
    Invoice, 
    AuditLog
} from '@/lib/data';

interface AppContextType {
    ciclistas: Ciclista[];
    invoices: Invoice[];
    auditLogs: AuditLog[];
    deletedCiclistas: Ciclista[];
    addCiclista: (ciclista: Ciclista) => void;
    updateCiclista: (updatedCiclista: Ciclista) => void;
    deleteCiclista: (ciclistaId: string) => void;
    restoreCiclista: (ciclistaId: string) => void;
    addAuditLog: (log: Omit<AuditLog, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [ciclistas, setCiclistas] = useState<Ciclista[]>([]);
    const [deletedCiclistas, setDeletedCiclistas] = useState<Ciclista[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    const addAuditLog = (log: Omit<AuditLog, 'id' | 'date'>) => {
        const newLog: AuditLog = {
            ...log,
            id: `log-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
        };
        setAuditLogs(prevLogs => [newLog, ...prevLogs]);
    };

    const addCiclista = (ciclista: Ciclista) => {
        setCiclistas(prevCiclistas => [...prevCiclistas, ciclista]);
        addAuditLog({
            user: 'Admin',
            action: 'Ciclista Criado',
            details: `Ciclista ${ciclista.nomeCiclista} foi adicionado.`,
        });
    };

    const updateCiclista = (updatedCiclista: Ciclista) => {
        setCiclistas(prevCiclistas => 
            prevCiclistas.map(ciclista => ciclista.id === updatedCiclista.id ? updatedCiclista : ciclista)
        );
        addAuditLog({
            user: 'Admin',
            action: 'Ciclista Atualizado',
            details: `Dados do ciclista ${updatedCiclista.nomeCiclista} foram atualizados.`,
        });
    };

    const deleteCiclista = (ciclistaId: string) => {
        const ciclistaToDelete = ciclistas.find(c => c.id === ciclistaId);
        if (ciclistaToDelete) {
            setCiclistas(prevCiclistas => prevCiclistas.filter(ciclista => ciclista.id !== ciclistaId));
            setDeletedCiclistas(prevDeleted => [...prevDeleted, ciclistaToDelete]);
            addAuditLog({
                user: 'Admin',
                action: 'Ciclista Excluído',
                details: `Ciclista ${ciclistaToDelete.nomeCiclista} foi excluído.`,
            });
        }
    };

    const restoreCiclista = (ciclistaId: string) => {
        const ciclistaToRestore = deletedCiclistas.find(c => c.id === ciclistaId);
        if (ciclistaToRestore) {
            setDeletedCiclistas(prevDeleted => prevDeleted.filter(ciclista => ciclista.id !== ciclistaId));
            setCiclistas(prevCiclistas => [...prevCiclistas, ciclistaToRestore]);
            addAuditLog({
                user: 'Admin',
                action: 'Ciclista Restaurado',
                details: `Ciclista ${ciclistaToRestore.nomeCiclista} foi restaurado.`,
            });
        }
    };

    const contextValue = {
        ciclistas,
        invoices,
        auditLogs,
        deletedCiclistas,
        addCiclista,
        updateCiclista,
        deleteCiclista,
        restoreCiclista,
        addAuditLog
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
