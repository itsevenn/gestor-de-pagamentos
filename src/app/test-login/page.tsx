'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@gestordociclista.com');
  const [password, setPassword] = useState('password');
  const [result, setResult] = useState('');
  const { login, user, isAuthenticated, isLoading } = useAuth();

  const handleTestLogin = async () => {
    setResult('Testando login...');
    try {
      const success = await login(email, password);
      if (success) {
        setResult('✅ Login bem-sucedido!');
      } else {
        setResult('❌ Login falhou');
      }
    } catch (error) {
      setResult(`❌ Erro: ${error}`);
    }
  };

  const handleTestSession = async () => {
    setResult('Testando sessão...');
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult(`❌ Erro na sessão: ${error.message}`);
        return;
      }
      
      if (!session) {
        setResult('❌ Nenhuma sessão encontrada');
        return;
      }
      
      setResult(`✅ Sessão encontrada! Token: ${session.access_token.substring(0, 20)}...`);
    } catch (error) {
      setResult(`❌ Erro ao testar sessão: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Login</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label>Email:</Label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gestordociclista.com"
          />
        </div>
        
        <div>
          <Label>Senha:</Label>
          <Input 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>
        
        <Button onClick={handleTestLogin} className="w-full">
          Testar Login
        </Button>
        
        <Button onClick={handleTestSession} variant="outline" className="w-full">
          Testar Sessão
        </Button>
      </div>
      
      <div className="space-y-2">
        <h2 className="font-semibold">Status:</h2>
        <p>Autenticado: {isAuthenticated ? '✅ Sim' : '❌ Não'}</p>
        <p>Carregando: {isLoading ? '✅ Sim' : '❌ Não'}</p>
        <p>Usuário: {user ? `${user.email} (${user.role})` : 'Nenhum'}</p>
      </div>
      
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Resultado:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {result || 'Nenhum teste executado'}
        </pre>
      </div>
    </div>
  );
} 