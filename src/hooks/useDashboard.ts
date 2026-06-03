import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const res = await api.get('/dashboard/overview');
      return res.data.data;
    },
  });
}

export function useRecentActivities(limit = 8) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activities', limit],
    queryFn: async () => {
      const res = await api.get(`/dashboard/recent-activities?limit=${limit}`);
      return res.data.data;
    },
  });
}

export function useUpcomingActivities(limit = 8) {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-activities', limit],
    queryFn: async () => {
      const res = await api.get(`/dashboard/upcoming-activities?limit=${limit}`);
      return res.data.data;
    },
  });
}

export function useSalesPerformance() {
  return useQuery({
    queryKey: ['dashboard', 'sales-performance'],
    queryFn: async () => {
      const res = await api.get('/dashboard/sales-performance');
      return res.data.data;
    },
  });
}