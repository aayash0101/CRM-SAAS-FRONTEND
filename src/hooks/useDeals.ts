import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Deal, PipelineStats } from '@/types';

export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...dealKeys.lists(), filters] as const,
  details: () => [...dealKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealKeys.details(), id] as const,
  pipeline: () => [...dealKeys.all, 'pipeline'] as const,
};

export interface DealsFilters {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
}

export interface CreateDealInput {
  title: string;
  customerId: string;
  value?: number;
  stage?: string;
  expectedCloseDate?: string;
  notes?: string;
  ownerId?: string;
}

export interface UpdateDealInput extends Partial<CreateDealInput> {}

export function useDeals(filters: DealsFilters = {}) {
  return useQuery({
    queryKey: dealKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.stage) params.set('stage', filters.stage);

      const { data } = await api.get(`/deals?${params.toString()}`);
      return {
        items: data.data as Deal[],
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        totalPages: data.meta.totalPages,
      };
    },
  });
}

export function usePipelineStats() {
  return useQuery({
    queryKey: dealKeys.pipeline(),
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PipelineStats }>('/deals/pipeline');
      return data.data;
    },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateDealInput) => {
      const { data } = await api.post<{ success: boolean; data: Deal }>('/deals', input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealKeys.lists() });
      qc.invalidateQueries({ queryKey: dealKeys.pipeline() });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateDealInput & { id: string }) => {
      const { data } = await api.patch<{ success: boolean; data: Deal }>(`/deals/${id}`, input);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: dealKeys.lists() });
      qc.invalidateQueries({ queryKey: dealKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: dealKeys.pipeline() });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/deals/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealKeys.lists() });
      qc.invalidateQueries({ queryKey: dealKeys.pipeline() });
    },
  });
}