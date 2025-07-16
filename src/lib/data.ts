export type Client = {
  id: string;
  name: string;
  contact: {
    email: string;
    phone: string;
  };
  serviceStartDate: string;
  serviceType: 'Subscription' | 'One-Time' | 'Consulting';
};

export type Invoice = {
  id: string;
  clientId: string;
  originalAmount: number;
  currentAmount: number;
  dueDate: string;
  issueDate: string;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'PayPal';
  status: 'pending' | 'paid' | 'overdue' | 'refunded';
  paymentHistory?: string;
};

export type AuditLog = {
    id: string;
    date: string;
    user: string;
    action: string;
    details: string;
}

export const clients: Client[] = [
  { id: 'cli-1', name: 'Innovate Corp', contact: { email: 'contact@innovate.com', phone: '123-456-7890' }, serviceStartDate: '2023-01-15', serviceType: 'Subscription' },
  { id: 'cli-2', name: 'Solutions Inc', contact: { email: 'hello@solutions.io', phone: '987-654-3210' }, serviceStartDate: '2023-03-22', serviceType: 'One-Time' },
  { id: 'cli-3', name: 'Quantum Leap', contact: { email: 'support@quantum.dev', phone: '555-123-4567' }, serviceStartDate: '2022-11-01', serviceType: 'Consulting' },
];

export const invoices: Invoice[] = [
  { id: 'inv-001', clientId: 'cli-1', originalAmount: 1500, currentAmount: 1500, issueDate: '2024-05-01', dueDate: '2024-05-30', paymentMethod: 'Credit Card', status: 'paid', paymentHistory: 'Consistent on-time payments.' },
  { id: 'inv-002', clientId: 'cli-2', originalAmount: 750, currentAmount: 750, issueDate: '2024-05-05', dueDate: '2024-06-04', paymentMethod: 'PayPal', status: 'pending', paymentHistory: 'First-time client.' },
  { id: 'inv-003', clientId: 'cli-3', originalAmount: 3000, currentAmount: 3250, issueDate: '2024-04-10', dueDate: '2024-05-10', paymentMethod: 'Bank Transfer', status: 'overdue', paymentHistory: 'Usually pays on time, this is a rare exception.' },
  { id: 'inv-004', clientId: 'cli-1', originalAmount: 200, currentAmount: 200, issueDate: '2024-05-15', dueDate: '2024-06-14', paymentMethod: 'Credit Card', status: 'pending', paymentHistory: 'Consistent on-time payments.' },
  { id: 'inv-005', clientId: 'cli-2', originalAmount: 500, currentAmount: 0, issueDate: '2024-04-20', dueDate: '2024-05-20', paymentMethod: 'PayPal', status: 'refunded', paymentHistory: 'First-time client.' },
  { id: 'inv-006', clientId: 'cli-1', originalAmount: 1500, currentAmount: 1500, issueDate: '2024-06-01', dueDate: '2024-07-01', paymentMethod: 'Credit Card', status: 'pending', paymentHistory: 'Consistent on-time payments.' },
];

export const auditLogs: AuditLog[] = [
    { id: 'log-1', date: '2024-05-11', user: 'Admin', action: 'Late Fee Added', details: 'Added a $250 late fee to invoice INV-003.'},
    { id: 'log-2', date: '2024-05-05', user: 'Admin', action: 'Invoice Created', details: 'Created invoice INV-002 for Solutions Inc.'},
    { id: 'log-3', date: '2024-05-02', user: 'System', action: 'Payment Processed', details: 'Processed payment for invoice INV-001.'}
];
