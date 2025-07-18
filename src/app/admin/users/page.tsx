'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [demoting, setDemoting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    console.log('🔍 AdminUsersPage: useEffect executado');
    console.log('🔍 Usuário atual:', user);
    
    if (!user || user.role !== 'admin') {
      console.log('❌ Usuário não é admin ou não existe');
      return;
    }
    
    const fetchUsers = async () => {
      console.log('🔄 Iniciando busca de usuários...');
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        // Obter o token de sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔍 Sessão obtida:', session ? 'Sim' : 'Não');
        console.log('🔍 Erro na sessão:', sessionError);
        console.log('🔍 Token de acesso:', session?.access_token ? session.access_token.substring(0, 20) + '...' : 'Nenhum');
        
        if (!session?.access_token) {
          console.error('❌ Token de acesso não encontrado');
          setError('Sessão não encontrada. Faça login novamente.');
          setLoading(false);
          return;
        }

        console.log('✅ Token encontrado, fazendo requisição para /api/list-users');
        
        const res = await fetch('/api/list-users', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 Resposta da API:', res.status, res.statusText);
        console.log('🔍 Headers da resposta:', Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          const data = await res.json();
          console.error('❌ Erro da API:', data);
          setError(data.error || 'Erro ao buscar usuários');
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        console.log('✅ Usuários obtidos:', data.users?.length || 0);
        setUsers(data.users || []);
      } catch (err) {
        console.error('❌ Erro ao buscar usuários:', err);
        setError('Erro ao buscar usuários');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [user]);

  const promote = async (userId: string) => {
    console.log('🔄 Iniciando promoção do usuário:', userId);
    setPromoting(userId);
    setError('');
    setSuccess('');
    
    try {
      // Obter o token de sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔍 Promovendo usuário - Sessão obtida:', session ? 'Sim' : 'Não');
      console.log('🔍 Erro na sessão:', sessionError);
      console.log('🔍 Token de acesso:', session?.access_token ? session.access_token.substring(0, 20) + '...' : 'Nenhum');
      
      if (!session?.access_token) {
        console.error('❌ Token de acesso não encontrado para promoção');
        setError('Sessão não encontrada. Faça login novamente.');
        setPromoting(null);
        return;
      }

      console.log('✅ Fazendo requisição para promover usuário:', userId);

      const res = await fetch('/api/promote-admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId })
      });
      
      console.log('🔍 Resposta da promoção:', res.status, res.statusText);
      console.log('🔍 Headers da resposta:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const data = await res.json();
        console.error('❌ Erro na promoção:', data);
        setError(data.error || 'Erro ao promover usuário');
      } else {
        console.log('✅ Promoção bem-sucedida!');
        setUsers(users => users.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
        setSuccess('Usuário promovido a admin com sucesso!');
      }
    } catch (err) {
      console.error('❌ Erro ao promover usuário:', err);
      setError('Erro ao promover usuário');
    }
    
    setPromoting(null);
  };

  const demote = async (userId: string) => {
    console.log('🔄 Iniciando rebaixamento do usuário:', userId);
    setDemoting(userId);
    setError('');
    setSuccess('');
    
    try {
      // Obter o token de sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔍 Rebaixando usuário - Sessão obtida:', session ? 'Sim' : 'Não');
      console.log('🔍 Erro na sessão:', sessionError);
      console.log('🔍 Token de acesso:', session?.access_token ? session.access_token.substring(0, 20) + '...' : 'Nenhum');
      
      if (!session?.access_token) {
        console.error('❌ Token de acesso não encontrado para rebaixamento');
        setError('Sessão não encontrada. Faça login novamente.');
        setDemoting(null);
        return;
      }

      console.log('✅ Fazendo requisição para rebaixar usuário:', userId);

      const res = await fetch('/api/demote-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId })
      });
      
      console.log('🔍 Resposta do rebaixamento:', res.status, res.statusText);
      console.log('🔍 Headers da resposta:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const data = await res.json();
        console.error('❌ Erro no rebaixamento:', data);
        setError(data.error || 'Erro ao rebaixar usuário');
      } else {
        console.log('✅ Rebaixamento bem-sucedido!');
        setUsers(users => users.map(u => u.id === userId ? { ...u, role: 'user' } : u));
        setSuccess('Usuário rebaixado para user com sucesso!');
      }
    } catch (err) {
      console.error('❌ Erro ao rebaixar usuário:', err);
      setError('Erro ao rebaixar usuário');
    }
    
    setDemoting(null);
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Acesso restrito a administradores.</div>;
  }

  return (
    <div className="w-full">
      {error && <div className="text-red-600 mb-2 text-center text-sm">{error}</div>}
      {success && <div className="text-green-600 mb-2 text-center text-sm">{success}</div>}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Carregando usuários...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 py-4">Nenhum usuário encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse rounded-lg overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="py-2 px-3 font-semibold">Avatar</th>
                <th className="py-2 px-3 font-semibold">ID</th>
                <th className="py-2 px-3 font-semibold">E-mail</th>
                <th className="py-2 px-3 font-semibold">Papel</th>
                <th className="py-2 px-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any, idx: number) => (
                <tr key={u.id} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="py-1 px-3">
                    <Avatar className="h-7 w-7">
                      {u.photoUrl ? (
                        <AvatarImage src={u.photoUrl} alt={u.name} />
                      ) : (
                        <UserCircle className="w-10 h-10 text-gray-400" />
                      )}
                    </Avatar>
                  </td>
                  <td className="py-1 px-3 text-xs break-all">{u.id}</td>
                  <td className="py-1 px-3 text-xs break-all">{u.email}</td>
                  <td className="py-1 px-3 capitalize font-medium">
                    {u.role === 'admin' ? <span className="text-blue-600 font-bold">Admin</span> : u.role || 'user'}
                  </td>
                  <td className="py-1 px-3">
                    <div className="flex gap-2">
                      {u.role !== 'admin' ? (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          disabled={!!promoting} 
                          onClick={() => promote(u.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {promoting === u.id ? 'Promovendo...' : 'Tornar Admin'}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          disabled={!!demoting} 
                          onClick={() => demote(u.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {demoting === u.id ? 'Rebaixando...' : 'Tornar User'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 