
'use client';

import { useCallback, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { AuditLogger } from '@/lib/audit-logger';

export function useUser() {
  const { user: authUser, setUser } = useContext(AuthContext);
  const { toast } = useToast();

  const updateUser = useCallback(async (newDetails: { name: string; email: string }) => {
    try {
      console.log('🔍 useUser: Iniciando atualização...', newDetails);
      
      const oldName = authUser?.name || '';
      
      // Atualiza diretamente no Supabase Auth
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: { name: newDetails.name.trim() }
      });

      console.log('🔍 useUser: Resultado da atualização:', { updateData, updateError });

      if (updateError) {
        console.error('❌ useUser: Erro na atualização:', updateError);
        toast({
          title: 'Erro ao atualizar perfil',
          description: updateError.message,
          variant: 'destructive'
        });
        return false;
      }

      if (updateData.user) {
        // Atualiza o contexto local com os novos dados
        const updatedUser = {
          name: updateData.user.user_metadata?.name || updateData.user.email || 'Usuário',
          email: updateData.user.email || '',
          photoUrl: updateData.user.user_metadata?.avatar_url || authUser?.photoUrl,
          role: authUser?.role,
        };
        
        console.log('🔍 useUser: Atualizando contexto com:', updatedUser);
        setUser(updatedUser);
        
        // Registrar no sistema de auditoria
        try {
          if (oldName !== updatedUser.name) {
            await AuditLogger.logProfileUpdated(updateData.user.id, updatedUser.name, {
              name: { from: oldName, to: updatedUser.name }
            });
          }
        } catch (auditError) {
          console.warn('Erro ao registrar auditoria de perfil:', auditError);
        }
        
        toast({
          title: 'Perfil atualizado com sucesso!',
          description: 'Suas informações foram salvas.'
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ useUser: Erro inesperado:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive'
      });
      return false;
    }
  }, [setUser, toast, authUser?.photoUrl, authUser?.role, authUser?.name]);

  const updatePhoto = useCallback(async (photoUrl: string) => {
    try {
      console.log('🔍 useUser: Iniciando updatePhoto com:', photoUrl ? 'URL fornecida' : 'removendo foto');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado.',
          variant: 'destructive'
        });
        return false;
      }
      
      // Se a foto foi removida (string vazia), apenas atualiza os metadados
      if (!photoUrl) {
        const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
          data: { avatar_url: null }
        });

        if (error) {
          toast({
            title: 'Erro ao remover foto',
            description: error.message,
            variant: 'destructive'
          });
          return false;
        }

        if (updatedUser) {
          const updatedUserData = {
            name: updatedUser.user_metadata?.name || updatedUser.email || 'Usuário',
            email: updatedUser.email || '',
            photoUrl: undefined,
            role: authUser?.role,
          };
          console.log('🔍 useUser: Atualizando contexto após remoção:', updatedUserData);
          setUser(updatedUserData);
          
          // Registrar no sistema de auditoria
          try {
            await AuditLogger.logProfilePhotoRemoved(user.id, updatedUserData.name);
          } catch (auditError) {
            console.warn('Erro ao registrar auditoria de remoção de foto:', auditError);
          }
        }
        return true;
      }

      // Se é uma nova foto (data URL), faz upload para o Supabase Storage
      if (photoUrl.startsWith('data:')) {
        // Converte data URL para blob
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        
        // Gera nome único para o arquivo
        const fileExt = blob.type.split('/')[1];
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          toast({
            title: 'Erro ao fazer upload da foto',
            description: uploadError.message,
            variant: 'destructive'
          });
          return false;
        }

        // Gera URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        // Atualiza metadados do usuário com a nova URL da foto
        const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        if (updateError) {
          toast({
            title: 'Erro ao atualizar foto',
            description: updateError.message,
            variant: 'destructive'
          });
          return false;
        }

        if (updatedUser) {
          const updatedUserData = {
            name: updatedUser.user_metadata?.name || updatedUser.email || 'Usuário',
            email: updatedUser.email || '',
            photoUrl: publicUrl,
            role: authUser?.role,
          };
          console.log('🔍 useUser: Atualizando contexto após upload:', updatedUserData);
          setUser(updatedUserData);
          
          // Registrar no sistema de auditoria
          try {
            await AuditLogger.logProfilePhotoUploaded(user.id, updatedUserData.name);
          } catch (auditError) {
            console.warn('Erro ao registrar auditoria de upload de foto:', auditError);
          }
        }
        return true;
      }

      // Se já é uma URL, apenas atualiza os metadados
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: { avatar_url: photoUrl }
      });

      if (error) {
        toast({
          title: 'Erro ao atualizar foto',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      if (updatedUser) {
        const updatedUserData = {
          name: updatedUser.user_metadata?.name || updatedUser.email || 'Usuário',
          email: updatedUser.email || '',
          photoUrl: photoUrl,
          role: authUser?.role,
        };
        setUser(updatedUserData);
        
        // Registrar no sistema de auditoria
        try {
          await AuditLogger.logProfilePhotoUpdated(user.id, updatedUserData.name);
        } catch (auditError) {
          console.warn('Erro ao registrar auditoria de atualização de foto:', auditError);
        }
      }
      return true;

    } catch (error) {
      toast({
        title: 'Erro ao atualizar foto',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive'
      });
      return false;
    }
  }, [setUser, toast, authUser?.role]);

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
