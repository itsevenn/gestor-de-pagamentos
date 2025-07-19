'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowRight, Headphones, Calendar, Phone, HelpCircle, Bike, Users, Settings, BarChart3, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('admin@gestordociclista.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Ilustração e Mensagem */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-md text-center space-y-8">
          {/* Título */}
          <div className="space-y-3">
            <h1 className="text-6xl font-light text-blue-400">
              Encontre tudo
            </h1>
            <h1 className="text-6xl font-light text-blue-400">
              que precisa em
            </h1>
            <h1 className="text-6xl font-bold text-blue-600">
              um só lugar!
            </h1>
          </div>

          {/* Ilustração com ícones de ciclismo e gestão */}
          <div className="relative w-96 h-96 mx-auto">
            {/* Ícone principal - Bicicleta */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Bike className="w-16 h-16 text-white" />
              </div>
            </div>
            
            {/* Gestão de Ciclistas */}
            <div className="absolute top-6 left-12">
              <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center shadow-md">
                <Users className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            {/* Configurações */}
            <div className="absolute top-20 right-16">
              <div className="w-18 h-18 bg-purple-200 rounded-full flex items-center justify-center shadow-md">
                <Settings className="w-9 h-9 text-purple-600" />
              </div>
            </div>
            
            {/* Relatórios */}
            <div className="absolute top-40 left-20">
              <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center shadow-md">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Segurança */}
            <div className="absolute top-10 right-6">
              <div className="w-18 h-18 bg-red-200 rounded-full flex items-center justify-center shadow-md">
                <Shield className="w-9 h-9 text-red-600" />
              </div>
            </div>

            {/* Performance */}
            <div className="absolute top-60 right-10">
              <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center shadow-md">
                <Zap className="w-8 h-8 text-yellow-700" />
              </div>
            </div>

            {/* Elementos decorativos */}
            <div className="absolute bottom-6 left-6 w-10 h-10 bg-blue-200 rounded-full opacity-60"></div>
            <div className="absolute bottom-16 right-10 w-8 h-8 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute top-60 left-10 w-6 h-6 bg-purple-300 rounded-full opacity-60"></div>
          </div>


        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 bg-blue-600 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Card do formulário */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Logo e título */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bike className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold text-blue-600">GESTOR DO CICLISTA</span>
              </div>
              <h2 className="text-2xl font-medium text-gray-800">Entre</h2>
        </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="email@example.com"
                />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="Insira sua senha"
                  />
                </div>
              </div>

              {/* Opções adicionais */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-300"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Manter conectado
                  </Label>
                </div>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  Recuperar senha
                </Link>
              </div>

              {/* Botões */}
              <div className="space-y-3 pt-4">
              <Button 
                type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                    'ENTRAR'
                )}
              </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-colors"
                  asChild
                >
                  <Link href="/register">
                    CADASTRE-SE GRÁTIS
                  </Link>
                </Button>
              </div>
            </form>
          </div>
            </div>
      </div>
    </div>
  );
}