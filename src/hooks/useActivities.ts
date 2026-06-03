import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Activity, ActivityStats, ActivityStatus } from '@/types';

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...activityKeys.lists(), filters] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
  stats: () => [...activityKeys.all, 'stats'] as const,
};

export interface ActivitiesFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export interface CreateActivityInput {
  title: string;
  type: string;
  status?: string;
  description?: string;
  dueAt?: string;
  customerId?: string;
  leadId?: string;
  dealId?: string;
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {}

export function useActivities(filters: ActivitiesFilters = {}) {
  return useQuery({
    queryKey: activityKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.type) params.set('type', filters.type);
      if (filters.status) params.set('status', filters.status);

      const { data } = await api.get(`/activities?${params.toString()}`);
      return {
        items: data.data as Activity[],
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
      };
    },
  });
}

export function useActivityStats() {
  return useQuery({
    queryKey: activityKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: ActivityStats }>('/activities/stats');
      return data.data;
    },
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      const { data } = await api.post<{ success: boolean; data: Activity }>('/activities', input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.lists() });
      qc.invalidateQueries({ queryKey: activityKeys.stats() });
    },
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateActivityInput & { id: string }) => {
      const { data } = await api.patch<{ success: boolean; data: Activity }>(
        `/activities/${id}`,
        input
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: activityKeys.lists() });
      qc.invalidateQueries({ queryKey: activityKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: activityKeys.stats() });
    },
  });
}

export function useUpdateActivityStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ActivityStatus }) => {
      const { data } = await api.patch<{ success: boolean; data: Activity }>(
        `/activities/${id}/status`,
        { status }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.lists() });
      qc.invalidateQueries({ queryKey: activityKeys.stats() });
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/activities/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.lists() });
      qc.invalidateQueries({ queryKey: activityKeys.stats() });
    },
  });
}