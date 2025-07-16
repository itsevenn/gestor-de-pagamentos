'use client';
import type { Client } from '@/lib/data';
import Image from 'next/image';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="pb-2">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold">{value || '-'}</p>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3 mt-4">{title}</h3>
);

export function ClientProfilePDF({ client }: { client: Client }) {
  return (
    <div className="bg-white text-gray-900 p-8 font-sans">
      <header className="flex items-center justify-between mb-8 border-b-4 border-blue-700 pb-4">
        <div>
            <h1 className="text-4xl font-bold text-blue-800">{client.nomeCiclista}</h1>
            <p className="text-md text-gray-600">Perfil do Ciclista</p>
        </div>
         <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-700">
          <Image
            src={client.photoUrl || 'https://placehold.co/150x150.png'}
            alt={`Foto de ${client.nomeCiclista}`}
            width={112}
            height={112}
            className="object-cover w-full h-full"
          />
        </div>
      </header>

      <main>
        <SectionTitle title="Dados Pessoais" />
        <div style={{ columnCount: 3, columnGap: '2rem' }}>
          <DetailItem label="Matrícula" value={client.matricula} />
          <DetailItem label="Data do Advento" value={client.dataAdvento} />
          <DetailItem label="Tipo Sanguíneo" value={client.tipoSanguineo} />
          <DetailItem label="Data de Nascimento" value={client.dataNascimento} />
          <DetailItem label="Idade" value={client.idade} />
          <DetailItem label="Nacionalidade" value={client.nacionalidade} />
          <DetailItem label="Naturalidade" value={client.naturalidade} />
          <DetailItem label="UF" value={client.uf} />
          <DetailItem label="RG" value={client.rg} />
          <DetailItem label="CPF" value={client.cpf} />
        </div>

        <SectionTitle title="Filiação" />
        <div style={{ columnCount: 2, columnGap: '2rem' }}>
          <DetailItem label="Pai" value={client.pai} />
          <DetailItem label="Mãe" value={client.mae} />
        </div>

        <SectionTitle title="Endereço e Contato" />
        <div style={{ columnCount: 3, columnGap: '2rem' }}>
          <DetailItem label="Endereço" value={`${client.endereco}, ${client.bairro}`} />
          <DetailItem label="Cidade/Estado" value={`${client.cidade} - ${client.estado}`} />
          <DetailItem label="CEP" value={client.cep} />
          <DetailItem label="Celular" value={client.celular} />
          <DetailItem label="Telefone Residencial" value={client.telefoneResidencial} />
          <DetailItem label="Outros Contatos" value={client.outrosContatos} />
          <DetailItem label="Referência" value={client.referencia} />
        </div>
        
        <SectionTitle title="Dados da Bicicleta e Fiscais" />
        <div style={{ columnCount: 3, columnGap: '2rem' }}>
          <DetailItem label="CNPJ" value={client.cnpj} />
          <DetailItem label="Nota Fiscal" value={client.notaFiscal} />
          <DetailItem label="Marca/Modelo" value={client.marcaModelo} />
          <DetailItem label="Número de Série" value={client.numeroSerie} />
          <DetailItem label="Data da Aquisição" value={client.dataAquisicao} />
        </div>

        <SectionTitle title="Observações e Finalização" />
        <div style={{ columnCount: 2, columnGap: '2rem' }}>
            <DetailItem label="Observações" value={client.observacoes} />
            <DetailItem label="Nome do Conselheiro" value={client.nomeConselheiro} />
            <DetailItem label="Local e Data" value={client.localData} />
        </div>
      </main>
      
      <footer className="text-center text-xs text-gray-400 mt-10 pt-4 border-t">
        Gerado por GESTOR DO CICLISTA em {new Date().toLocaleDateString('pt-BR')}
      </footer>
    </div>
  );
}
