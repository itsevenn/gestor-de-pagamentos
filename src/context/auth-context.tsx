'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  user: {
    name: string;
    email: string;
    photoUrl?: string;
    role?: string;
  } | null;
  setUser: (user: { name: string; email: string; photoUrl?: string; role?: string } | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; photoUrl?: string; role?: string } | null>(null);

  // Checa usuário autenticado ao carregar
  useEffect(() => {
    const checkUser = async () => {
      console.log('🔍 AuthContext: Verificando usuário...');
      setIsLoading(true);
      const { data, error } = await supabase.auth.getUser();
      
      console.log('🔍 AuthContext: Dados do usuário:', data);
      console.log('🔍 AuthContext: Erro:', error);
      
      if (data.user) {
        console.log('🔍 AuthContext: Usuário encontrado, buscando perfil...');
        // Busca o papel na tabela profiles
        let { data: profile } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', data.user.id)
          .single();
        
        console.log('🔍 AuthContext: Perfil encontrado:', profile);
        
        // Se não existe perfil, cria automaticamente
        if (!profile) {
          console.log('🔍 AuthContext: Criando perfil automaticamente...');
          await supabase.from('profiles').insert([{ id: data.user.id, role: 'user', email: data.user.email }]);
          profile = { role: 'user', email: data.user.email };
        } else {
          // Atualiza o e-mail se mudou
          if (profile.email !== data.user.email) {
            console.log('🔍 AuthContext: Atualizando email do perfil...');
            await supabase.from('profiles').update({ email: data.user.email }).eq('id', data.user.id);
            profile.email = data.user.email;
          }
        }
        setIsAuthenticated(true);
        const userData = {
          name: data.user.user_metadata?.name || data.user.email || 'Usuário',
          email: data.user.email || '',
          photoUrl: data.user.user_metadata?.avatar_url || undefined,
          role: profile?.role || 'user',
        };
        console.log('🔍 AuthContext: Definindo usuário:', userData);
        setUser(userData);
      } else {
        console.log('🔍 AuthContext: Nenhum usuário encontrado');
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };
    checkUser();
    // Listener para mudanças de sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 AuthContext: Mudança de autenticação:', event, session?.user?.email);
      checkUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 AuthContext: Tentando login com:', email);
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log('🔍 AuthContext: Resultado do login:', { data, error });
    
    if (!error && data.user) {
      console.log('🔍 AuthContext: Login bem-sucedido, buscando perfil...');
      // Busca o papel na tabela profiles
      let { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', data.user.id)
        .single();
      
      console.log('🔍 AuthContext: Perfil encontrado:', profile);
      
      // Se não existe perfil, cria automaticamente
      if (!profile) {
        console.log('🔍 AuthContext: Criando perfil automaticamente...');
        await supabase.from('profiles').insert([{ id: data.user.id, role: 'user', email: data.user.email }]);
        profile = { role: 'user', email: data.user.email };
      } else {
        // Atualiza o e-mail se mudou
        if (profile.email !== data.user.email) {
          console.log('🔍 AuthContext: Atualizando email do perfil...');
          await supabase.from('profiles').update({ email: data.user.email }).eq('id', data.user.id);
          profile.email = data.user.email;
        }
      }
      setIsAuthenticated(true);
      const userData = {
        name: data.user.user_metadata?.name || data.user.email || 'Usuário',
        email: data.user.email || '',
        photoUrl: data.user.user_metadata?.avatar_url || undefined,
        role: profile?.role || 'user',
      };
      console.log('🔍 AuthContext: Definindo usuário após login:', userData);
      setUser(userData);
      setIsLoading(false);
      return true;
    }
    console.log('🔍 AuthContext: Login falhou');
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
    return false;
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    console.log('🔍 AuthContext: Tentando registro com:', userData.email);
    setIsLoading(true);
    // 1. Cria o usuário no Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        },
      },
    });
    console.log('🔍 AuthContext: Resultado do registro:', { data, error });

    // 2. Se criou no Auth, cria o perfil na tabela profiles
    let profileError = null;
    if (data.user) {
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          role: 'user',
          email: data.user.email,
          name: userData.name,
        },
      ]);
      if (insertError) {
        console.error('❌ Erro ao criar perfil na tabela profiles:', insertError.message);
        profileError = insertError;
      }
    }
    setIsLoading(false);
    if (error) {
      return { error };
    }
    if (profileError) {
      return { error: profileError };
    }
    return { error: null };
  };

  const logout = async () => {
    console.log('🔍 AuthContext: Fazendo logout...');
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, register, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};