'use client';
import type { Ciclista } from '@/lib/data';
import Image from 'next/image';
import { UserCircle } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="pb-2">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold">{value || '-'}</p>
  </div>
);

export function CiclistaProfilePDF({ ciclista }: { ciclista: Ciclista }) {
  // Gerar avatar do ciclista
  const ciclistaAvatarUrl = ciclista.photoUrl;

  return (
    <div className="bg-white text-gray-900 p-8 font-sans">
      <header className="flex items-center justify-between mb-8 border-b-4 border-blue-700 pb-4">
        <div>
            <h1 className="text-4xl font-bold text-blue-800">{ciclista.nomeCiclista}</h1>
            <p className="text-md text-gray-600">Perfil do Ciclista</p>
        </div>
         <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-700">
          {ciclistaAvatarUrl ? (
            <Image
              src={ciclistaAvatarUrl}
              alt={`Foto de ${ciclista.nomeCiclista}`}
              width={120}
              height={120}
              style={{ borderRadius: '50%', objectFit: 'cover', background: '#eee' }}
            />
          ) : (
            <UserCircle size={120} color="#ccc" />
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2">Dados Pessoais</h2>
          <DetailItem label="Matrícula" value={ciclista.matricula} />
          <DetailItem label="Nome Completo" value={ciclista.nomeCiclista} />
          <DetailItem label="Data de Nascimento" value={ciclista.dataNascimento} />
          <DetailItem label="Idade" value={ciclista.idade} />
          <DetailItem label="Tipo Sanguíneo" value={ciclista.tipoSanguineo} />
          <DetailItem label="Nacionalidade" value={ciclista.nacionalidade} />
          <DetailItem label="Naturalidade" value={ciclista.naturalidade} />
          <DetailItem label="UF" value={ciclista.uf} />
          <DetailItem label="RG" value={ciclista.rg} />
          <DetailItem label="CPF" value={ciclista.cpf} />
          <DetailItem label="Pai" value={ciclista.pai} />
          <DetailItem label="Mãe" value={ciclista.mae} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2">Endereço e Contato</h2>
          <DetailItem label="Endereço" value={ciclista.endereco} />
          <DetailItem label="Bairro" value={ciclista.bairro} />
          <DetailItem label="Cidade" value={ciclista.cidade} />
          <DetailItem label="CEP" value={ciclista.cep} />
          <DetailItem label="Estado" value={ciclista.estado} />
          <DetailItem label="Celular" value={ciclista.celular} />
          <DetailItem label="Telefone Residencial" value={ciclista.telefoneResidencial} />
          <DetailItem label="Outros Contatos" value={ciclista.outrosContatos} />
          <DetailItem label="Referência" value={ciclista.referencia} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2">Dados da Bicicleta</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <DetailItem label="CNPJ" value={ciclista.cnpj} />
            <DetailItem label="Nota Fiscal" value={ciclista.notaFiscal} />
            <DetailItem label="Marca/Modelo" value={ciclista.marcaModelo} />
            <DetailItem label="Número de Série" value={ciclista.numeroSerie} />
            <DetailItem label="Data de Aquisição" value={ciclista.dataAquisicao} />
          </div>
          <div>
            <DetailItem label="Data do Advento" value={ciclista.dataAdvento} />
            <DetailItem label="Nome do Conselheiro" value={ciclista.nomeConselheiro} />
            <DetailItem label="Local e Data" value={ciclista.localData} />
            {ciclista.observacoes && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600 font-semibold">Observações:</p>
                <p className="text-sm">{ciclista.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
