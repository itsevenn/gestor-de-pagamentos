
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
import { AuditLogger, detectChanges } from '@/lib/audit-logger';
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
            
            // Registrar no sistema de auditoria
            await AuditLogger.logCiclistaCreated(newCiclistaId, newCiclista.nomeCiclista);
            
            // Atualizar logs locais
            const auditLogs = await getAuditLogs();
            setAuditLogs(auditLogs);
        } catch (error) {
            console.error("Erro ao adicionar ciclista:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateCiclista = async (updatedCiclista: Ciclista & { changeReason?: string, changes?: any[] }) => {
        setLoading(true);
        try {
            const originalCiclista = ciclistas.find(c => c.id === updatedCiclista.id);
            await updateCiclistaDb(updatedCiclista);
            setCiclistas(prevCiclistas => 
                prevCiclistas.map(ciclista => ciclista.id === updatedCiclista.id ? updatedCiclista : ciclista)
            );
            
            // Detectar mudanças e registrar no sistema de auditoria
            if (originalCiclista) {
                const changes = updatedCiclista.changes || detectChanges(originalCiclista, updatedCiclista);
                const reason = updatedCiclista.changeReason ? ` - Motivo: ${updatedCiclista.changeReason}` : '';
                const details = `Dados do ciclista "${updatedCiclista.nomeCiclista}" foram atualizados${reason}`;
                await AuditLogger.logCiclistaUpdated(updatedCiclista.id, updatedCiclista.nomeCiclista, changes, details);
            }
            
            // Atualizar logs locais
            const auditLogs = await getAuditLogs();
            setAuditLogs(auditLogs);
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
                
                // Registrar no sistema de auditoria
                await AuditLogger.logCiclistaDeleted(ciclistaId, ciclistaToDelete.nomeCiclista, reason);
                
                // Atualizar logs locais
                const auditLogs = await getAuditLogs();
                setAuditLogs(auditLogs);
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
                
                // Registrar no sistema de auditoria
                await AuditLogger.logCiclistaRestored(ciclistaId, ciclistaToRestore.nomeCiclista);
                
                // Atualizar logs locais
                const auditLogs = await getAuditLogs();
                setAuditLogs(auditLogs);
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
            
            // Registrar no sistema de auditoria
            await AuditLogger.logInvoiceCreated(newInvoiceId, ciclistaName, newInvoice.currentAmount);
            
            // Atualizar logs locais
            const auditLogs = await getAuditLogs();
            setAuditLogs(auditLogs);
        } catch (error) {
            console.error("Erro ao adicionar fatura:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função para gerar descrição específica baseada nas mudanças
    const generateAuditDescription = (originalInvoice: Invoice, updatedInvoice: Invoice, changes: any[], auditDetails?: string) => {
        if (auditDetails) {
            return auditDetails;
        }

        const descriptions: string[] = [];
        
        // Verificar mudança de status
        if (originalInvoice.status !== updatedInvoice.status) {
            const statusLabels = {
                'pending': 'Pendente',
                'paid': 'Paga',
                'overdue': 'Atrasada',
                'refunded': 'Reembolsada'
            };
            const oldStatus = statusLabels[originalInvoice.status as keyof typeof statusLabels] || originalInvoice.status;
            const newStatus = statusLabels[updatedInvoice.status as keyof typeof statusLabels] || updatedInvoice.status;
            descriptions.push(`Status alterado de ${oldStatus} para ${newStatus}`);
        }
        
        // Verificar mudança de valor
        if (originalInvoice.currentAmount !== updatedInvoice.currentAmount) {
            const difference = updatedInvoice.currentAmount - originalInvoice.currentAmount;
            const changeType = difference > 0 ? 'aumentado' : 'reduzido';
            descriptions.push(`Valor ${changeType} de R$ ${originalInvoice.currentAmount.toFixed(2)} para R$ ${updatedInvoice.currentAmount.toFixed(2)}`);
        }
        
        // Verificar mudança de valor original
        if (originalInvoice.originalAmount !== updatedInvoice.originalAmount) {
            descriptions.push(`Valor original alterado de R$ ${originalInvoice.originalAmount.toFixed(2)} para R$ ${updatedInvoice.originalAmount.toFixed(2)}`);
        }
        
        // Verificar mudança de data de vencimento
        if (originalInvoice.dueDate !== updatedInvoice.dueDate) {
            descriptions.push(`Data de vencimento alterada de ${originalInvoice.dueDate} para ${updatedInvoice.dueDate}`);
        }
        
        // Verificar adição de método de pagamento
        if (!originalInvoice.paymentMethod && updatedInvoice.paymentMethod) {
            descriptions.push(`Método de pagamento definido: ${updatedInvoice.paymentMethod}`);
        }
        
        // Verificar adição de data de pagamento
        if (!originalInvoice.paymentDate && updatedInvoice.paymentDate) {
            descriptions.push(`Data de pagamento registrada: ${updatedInvoice.paymentDate}`);
        }
        
        // Se não há mudanças específicas detectadas, usar descrição genérica
        if (descriptions.length === 0) {
            return 'Fatura atualizada';
        }
        
        return descriptions.join(', ');
    };

    const updateInvoice = async (updatedInvoice: Invoice & { changeReason?: string, changes?: any[] }, auditDetails?: string) => {
        setLoading(true);
        try {
            const originalInvoice = invoices.find(inv => inv.id === updatedInvoice.id);
            await updateInvoiceDb(updatedInvoice);
            setInvoices(prevInvoices => 
                prevInvoices.map(invoice => invoice.id === updatedInvoice.id ? updatedInvoice : invoice)
            );

            const allCiclistas = [...ciclistas, ...deletedCiclistas];
            const ciclista = allCiclistas.find(c => c.id === updatedInvoice.ciclistaId);
            const ciclistaName = ciclista?.nomeCiclista || 'Desconhecido';
            
            // Detectar mudanças e registrar no sistema de auditoria
            if (originalInvoice) {
                const changes = updatedInvoice.changes || detectChanges(originalInvoice, updatedInvoice);
                const reason = updatedInvoice.changeReason ? ` - Motivo: ${updatedInvoice.changeReason}` : '';
                const specificDescription = generateAuditDescription(originalInvoice, updatedInvoice, changes, auditDetails);
                const details = `${specificDescription}${reason}`;
                await AuditLogger.logInvoiceUpdated(updatedInvoice.id, ciclistaName, changes, details);
            }
            
            // Atualizar logs locais
            const auditLogs = await getAuditLogs();
            setAuditLogs(auditLogs);
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
