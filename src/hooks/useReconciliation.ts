import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reconciliationApi } from '../api/reconciliation';
import { CreateReconciliationRequest } from '../types/reconciliation';
import toast from 'react-hot-toast';

export const useReconciliations = () => {
  return useQuery({
    queryKey: ['reconciliation'],
    queryFn: () => {
      console.log('🔍 useReconciliations - Calling API...');
      return reconciliationApi.list();
    }
  });
};

export const useReconciliation = (id: string) => {
  return useQuery({
    queryKey: ['reconciliation', id],
    queryFn: () => reconciliationApi.get(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if status is pending or running
      const data = query.state.data;
      return data?.status === 'pending' || data?.status === 'running' ? 2000 : false;
    }
  });
};

export const useReconciliationResults = (id: string, type?: string, page?: number) => {
  return useQuery({
    queryKey: ['reconciliation', id, 'results', type, page],
    queryFn: () => reconciliationApi.getResults(id, type, page),
    enabled: !!id
  });
};

export const useCreateReconciliation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReconciliationRequest) => 
      reconciliationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      toast.success('Reconciliation job created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create reconciliation');
    }
  });
};

export const useDeleteReconciliation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reconciliationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      toast.success('Reconciliation deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  });
};

export const useExportReconciliation = () => {
  return useMutation({
    mutationFn: reconciliationApi.export,
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconciliation_${id}_results.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Results exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Export failed');
    }
  });
};