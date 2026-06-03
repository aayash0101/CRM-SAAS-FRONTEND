import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import type { Organization, User } from '@/types';

export const profileKeys = {
  org: ['organization'] as const,
  profile: ['profile'] as const,
};

export function useOrganization() {
  return useQuery({
    queryKey: profileKeys.org,
    queryFn: async () => {
      const { data } = await api.get('/organizations');
      return data.data as Organization;
    },
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Organization>) => {
      const { data } = await api.patch('/organizations', input);
      return data.data as Organization;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.org });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: async (input: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string | null;
    }) => {
      const { data } = await api.patch('/users/profile', input);
      return data.data as User;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      qc.invalidateQueries({ queryKey: profileKeys.profile });
    },
  });
}