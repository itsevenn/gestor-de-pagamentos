'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Logo } from '@/components/logo';

export function LoginForm() {
  const [email, setEmail] = useState('admin@gestordociclista.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: 'Login bem-sucedido!',
          description: 'Redirecionando para o painel...',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro no Login',
          description: 'E-mail ou senha incorretos. Tente novamente.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no Login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <Button variant="outline" className="mb-8">
            <Upload className="mr-2 h-4 w-4" />
            Carregar Logo
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Entre com seu e-mail e senha para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-gray-100 dark:bg-gray-800"
                  placeholder="••••••"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Usuário:</strong> admin@gestordociclista.com</p>
              <p><strong>Senha:</strong> password</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}