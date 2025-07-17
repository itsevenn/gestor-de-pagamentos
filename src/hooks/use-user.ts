
'use client';

import { useAuth } from '@/context/auth-context';
import { useCallback } from 'react';

export function useUser() {
  const { user: authUser } = useAuth();

  const updateUser = useCallback((newDetails: { name: string; email: string }) => {
    // In a real app, this would update the user in the backend
    console.log('Updating user details:', newDetails);
    // For now, just log the update since we're using a simple auth system
  }, []);

  const updatePhoto = useCallback((photoUrl: string) => {
    // In a real app, this would update the user photo in the backend
    console.log('Updating user photo:', photoUrl);
    // For now, just log the update since we're using a simple auth system
  }, []);

  return { 
    user: authUser || {
      name: 'Usuário Admin',
      email: 'admin@gestordociclista.com',
      photoUrl: 'https://placehold.co/40x40.png',
    }, 
    updateUser, 
    updatePhoto 
  };
}
