import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkOperationsApi, bulkApi } from '../api/bulkOperations';
import { SavedRule, SavedRuleCreate, RuleConfig, ExecuteRequest } from '../types/bulk';
import toast from 'react-hot-toast';

export const useSavedRules = () => {
  return useQuery({
    queryKey: ['bulk', 'rules'],
    queryFn: () => bulkApi.getSavedRules()
  });
};

export const useCreateRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SavedRuleCreate) => bulkOperationsApi.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk', 'rules'] });
      toast.success('Rule saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to save rule');
    }
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavedRule> }) =>
      bulkOperationsApi.updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk', 'rules'] });
      toast.success('Rule updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update rule');
    }
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkOperationsApi.deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk', 'rules'] });
      toast.success('Rule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  });
};

export const useBulkOperations = () => {
  return useQuery({
    queryKey: ['bulk', 'operations'],
    queryFn: bulkOperationsApi.getOperations
  });
};

export const usePreviewRule = () => {
  return useMutation({
    mutationFn: ({ datasetId, ruleConfig }: { datasetId: string; ruleConfig: RuleConfig }) =>
      bulkOperationsApi.preview(datasetId, ruleConfig),
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Preview failed');
    }
  });
};

export const useExecuteRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, data }: { datasetId: string; data: ExecuteRequest }) =>
      bulkOperationsApi.execute(datasetId, data),
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', datasetId] });
      queryClient.invalidateQueries({ queryKey: ['datasets', datasetId, 'data'] });
      queryClient.invalidateQueries({ queryKey: ['bulk', 'operations'] });
      queryClient.invalidateQueries({ queryKey: ['bulk', datasetId, 'history'] });
      toast.success('Rule executed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Execution failed');
    }
  });
};

export const useUndoOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkOperationsApi.undo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['bulk', 'operations'] });
      toast.success('Operation undone successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Undo failed');
    }
  });
};

export const useBulkHistory = (datasetId: string) => {
  return useQuery({
    queryKey: ['bulk', datasetId, 'history'],
    queryFn: () => bulkApi.getHistory(datasetId),
    enabled: !!datasetId
  });
};