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

// Adapting existing clients to the new structure with placeholder data
export const clients: Client[] = [
  {
    id: 'cli-1',
    photoUrl: 'https://placehold.co/150x150.png',
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
  { id: 'inv-001', clientId: 'cli-1', originalAmount: 1500, currentAmount: 1500, issueDate: '2024-05-01', dueDate: '2024-05-30', paymentDate: '2024-05-28', paymentMethod: 'Credit Card', status: 'paid', paymentHistory: 'Pagamentos consistentes em dia.' },
  { id: 'inv-002', clientId: 'cli-2', originalAmount: 750, currentAmount: 750, issueDate: '2024-05-05', dueDate: '2024-06-04', paymentMethod: 'PayPal', status: 'pending', paymentHistory: 'Cliente de primeira viagem.' },
  { id: 'inv-003', clientId: 'cli-3', originalAmount: 3000, currentAmount: 3250, issueDate: '2024-04-10', dueDate: '2024-05-10', paymentMethod: 'Bank Transfer', status: 'overdue', paymentHistory: 'Geralmente paga em dia, esta é uma rara exceção.' },
  { id: 'inv-004', clientId: 'cli-1', originalAmount: 200, currentAmount: 200, issueDate: '2024-05-15', dueDate: '2024-06-14', paymentMethod: 'Credit Card', status: 'pending', paymentHistory: 'Pagamentos consistentes em dia.' },
  { id: 'inv-005', clientId: 'cli-2', originalAmount: 500, currentAmount: 0, issueDate: '2024-04-20', dueDate: '2025-05-20', paymentMethod: 'PayPal', status: 'refunded', paymentHistory: 'Cliente de primeira viagem.' },
  { id: 'inv-006', clientId: 'cli-1', originalAmount: 1500, currentAmount: 1500, issueDate: '2024-06-01', dueDate: '2024-07-01', paymentMethod: 'Credit Card', status: 'pending', paymentHistory: 'Pagamentos consistentes em dia.' },
];

export const auditLogs: AuditLog[] = [
    { id: 'log-1', date: '2024-05-11', user: 'Admin', action: 'Taxa de Atraso Adicionada', details: 'Adicionada uma taxa de atraso de R$250 à fatura INV-003.'},
    { id: 'log-2', date: '2024-05-05', user: 'Admin', action: 'Fatura Criada', details: 'Fatura INV-002 criada para Solutions Inc.'},
    { id: 'log-3', date: '2024-05-02', user: 'Sistema', action: 'Pagamento Processado', details: 'Pagamento processado para a fatura INV-001.'}
];
