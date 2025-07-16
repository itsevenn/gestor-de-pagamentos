export type Client = {
  id: string;
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
  telefoneResidencial: string;
  outrosContatos: string;
  referencia: string;
  cnpj?: string;
  notaFiscal: string;
  marcaModelo: string;
  numeroSerie: string;
  dataAquisicao: string;
  observacoes: string;
  nomeConselheiro: string;
  localData: string;
  // Campos do modelo antigo que serão removidos/adaptados
  // name: string;
  // cpfCnpj: string;
  // contact: {
  //   email: string;
  //   phone: string;
  // };
  // address: {
  //   street: string;
  //   city: string;
  //   state: string;
  //   zipCode: string;
  // };
  // serviceStartDate: string;
  // serviceType: 'Subscription' | 'One-Time' | 'Consulting';
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

// Adapting existing clients to the new structure with placeholder data
export const clients: Client[] = [
  {
    id: 'cli-1',
    matricula: '001',
    dataAdvento: '2023-01-01',
    nomeCiclista: 'Innovate Corp (Exemplo)',
    tipoSanguineo: 'A+',
    dataNascimento: '1990-01-15',
    idade: '34',
    nacionalidade: 'Brasileiro',
    naturalidade: 'São Paulo',
    uf: 'SP',
    rg: '12.345.678-9',
    cpf: '123.456.789-00',
    pai: 'Pai do Innovate',
    mae: 'Mãe do Innovate',
    endereco: 'Rua da Inovação, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    cep: '01000-000',
    estado: 'SP',
    celular: '11987654321',
    telefoneResidencial: '1123456789',
    outrosContatos: '-',
    referencia: '-',
    cnpj: '12.345.678/0001-90',
    notaFiscal: 'NF-123',
    marcaModelo: 'Caloi/Elite',
    numeroSerie: 'SN12345',
    dataAquisicao: '2022-12-01',
    observacoes: 'Cliente antigo adaptado para novo modelo.',
    nomeConselheiro: 'Conselheiro A',
    localData: 'São Paulo, 2024-01-01',
  },
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