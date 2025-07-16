
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
    addClient: (client: Client) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

    const addClient = (client: Client) => {
        setClients(prevClients => [...prevClients, client]);
    };

    return (
        <AppContext.Provider value={{ clients, invoices, auditLogs, addClient }}>
            {children}
        </AppContext.Provider>
    );
};

export const useClients = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useClients must be used within an AppProvider');
    }
    return { clients: context.clients, addClient: context.addClient };
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
