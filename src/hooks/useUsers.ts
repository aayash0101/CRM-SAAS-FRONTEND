import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { User } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  invitations: () => [...userKeys.all, 'invitations'] as const,
};

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface InviteUserInput {
  email: string;
  role: 'ORG_ADMIN' | 'SALES_MANAGER' | 'SALES_REP';
}

export function useUsers(filters: UsersFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.data as User[];
    },
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: userKeys.invitations(),
    queryFn: async () => {
      const { data } = await api.get('/users/invitations/all');
      return data.data as any[];
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InviteUserInput) => {
      const { data } = await api.post('/users/invite', input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.invitations() });
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { data } = await api.patch(`/users/${id}/role`, { role });
      return data.data as User;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/users/${id}/status`, { status });
      return data.data as User;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}