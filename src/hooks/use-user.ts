
'use client';

import { useState, useEffect, useCallback } from 'react';

const USER_STORAGE_KEY = 'app-user';

type User = {
  name: string;
  email: string;
  photoUrl: string;
};

const defaultUser: User = {
  name: 'Usuário Admin',
  email: 'admin@gestordociclista.com',
  photoUrl: 'https://placehold.co/40x40.png',
};

export function useUser() {
  const [user, setUser] = useState<User>(defaultUser);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // If no user is stored, save the default user
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // Fallback to default user
        setUser(defaultUser);
    }
  }, []);

  const updateUser = useCallback((newDetails: { name: string; email: string }) => {
    const updatedUser = { ...user, ...newDetails };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  }, [user]);

  const updatePhoto = useCallback((photoUrl: string) => {
    const updatedUser = { ...user, photoUrl };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  }, [user]);
  
  return { user, updateUser, updatePhoto };
}
