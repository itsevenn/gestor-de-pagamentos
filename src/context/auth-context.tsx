'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: {
    name: string;
    email: string;
    photoUrl: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_CREDENTIALS = {
  email: 'admin@gestordociclista.com',
  password: 'password'
};

const USER_DATA = {
  name: 'Usuário Admin',
  email: 'admin@gestordociclista.com',
  photoUrl: 'https://placehold.co/40x40.png',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<typeof USER_DATA | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const authToken = localStorage.getItem('auth-token');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
      setUser(USER_DATA);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setUser(USER_DATA);
      localStorage.setItem('auth-token', 'authenticated');
      setIsLoading(false);
      
      // Show success message
      setTimeout(() => {
        // This will be handled by the login form component
      }, 100);
      
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth-token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user }}>
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