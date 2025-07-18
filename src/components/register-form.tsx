"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Lock, User, ArrowRight, Headphones, Calendar, Phone, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Preencha todos os campos.",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "As senhas não coincidem.",
      });
      return;
    }
    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Você deve aceitar os termos de uso.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await register({ name, email, password });
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: result.error.message || "Tente novamente.",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar o cadastro.",
        });
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAcceptTerms(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: error?.message || "Tente novamente.",
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
          <div className="space-y-2">
            <h1 className="text-4xl font-light text-blue-400">
              Junte-se a nós
            </h1>
            <h1 className="text-4xl font-light text-blue-400">
              e gerencie seus
            </h1>
            <h1 className="text-4xl font-bold text-blue-600">
              ciclistas!
            </h1>
          </div>

          {/* Ilustração */}
          <div className="relative w-80 h-80 mx-auto">
            {/* Personagem principal */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 bg-orange-400 rounded-full flex items-center justify-center">
                <Headphones className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Balões de fala com ícones */}
            <div className="absolute top-4 left-8">
              <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="absolute top-16 right-12">
              <div className="w-14 h-14 bg-purple-200 rounded-full flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            
            <div className="absolute top-32 left-16">
              <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="absolute top-8 right-4">
              <div className="w-14 h-14 bg-yellow-300 rounded-full flex items-center justify-center">
                <Calendar className="w-7 h-7 text-yellow-700" />
              </div>
            </div>

            {/* Folhas decorativas */}
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-purple-200 rounded-full opacity-60"></div>
            <div className="absolute bottom-12 right-8 w-6 h-6 bg-blue-200 rounded-full opacity-60"></div>
            <div className="absolute top-48 left-8 w-4 h-4 bg-purple-300 rounded-full opacity-60"></div>
          </div>

          {/* Indicadores de navegação */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Cadastro */}
      <div className="w-full lg:w-1/2 bg-blue-600 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Card do formulário */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Logo e título */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold text-blue-600">GESTOR DO CICLISTA</span>
              </div>
              <h2 className="text-2xl font-medium text-gray-800">Criar Conta</h2>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>

              {/* Termos de uso */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="border-gray-300 mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  Eu aceito os{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    política de privacidade
                  </Link>
                </Label>
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
                      Cadastrando...
                    </>
                  ) : (
                    'CRIAR CONTA'
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-colors"
                  asChild
                >
                  <Link href="/login">
                    JÁ TENHO UMA CONTA
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