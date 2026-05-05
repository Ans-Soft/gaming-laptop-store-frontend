import { useQuery } from '@tanstack/react-query';
import api from '../../../services/Api';
import { BASE_URL } from '../../../services/Urls';

const STALE = 60_000; // 1 min — "live" but not aggressive
const BASE = `${BASE_URL}/dashboard`;

const fetcher = (path, params) => async () => {
  const res = await api.get(`${BASE}${path}`, { params });
  return res.data;
};

const COMMON = {
  staleTime: STALE,
  refetchOnMount: 'always',
};

export function useKpis(month) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', month],
    queryFn: fetcher('/kpis/', { month }),
    ...COMMON,
  });
}

export function useSalesTimeline(month) {
  return useQuery({
    queryKey: ['dashboard', 'sales-timeline', month],
    queryFn: fetcher('/sales-timeline/', { month }),
    ...COMMON,
  });
}

export function useSalesOrdersStatus(month) {
  return useQuery({
    queryKey: ['dashboard', 'sales-orders-status', month],
    queryFn: fetcher('/sales-orders-status/', { month }),
    ...COMMON,
  });
}

export function usePurchaseOrdersStatus(month) {
  return useQuery({
    queryKey: ['dashboard', 'purchase-orders-status', month],
    queryFn: fetcher('/purchase-orders-status/', { month }),
    ...COMMON,
  });
}

export function useReservations() {
  return useQuery({
    queryKey: ['dashboard', 'reservations'],
    queryFn: fetcher('/reservations/'),
    ...COMMON,
  });
}

export function useImportsExpenses(month) {
  return useQuery({
    queryKey: ['dashboard', 'imports-expenses', month],
    queryFn: fetcher('/imports-expenses/', { month }),
    ...COMMON,
  });
}
