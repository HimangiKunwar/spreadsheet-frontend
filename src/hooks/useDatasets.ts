import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetsApi } from '../api/datasets';
import { CleanupRequest } from '../types/dataset';
import toast from 'react-hot-toast';

export const useDatasets = () => {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: datasetsApi.list
  });
};

export const useDataset = (id: string) => {
  return useQuery({
    queryKey: ['datasets', id],
    queryFn: () => datasetsApi.get(id),
    enabled: !!id
  });
};

export const useDatasetData = (id: string, page: number = 1, pageSize: number = 50) => {
  return useQuery({
    queryKey: ['datasets', id, 'data', page, pageSize],
    queryFn: () => datasetsApi.getData(id, page, pageSize),
    enabled: !!id
  });
};

export const useUploadDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) => 
      datasetsApi.upload(file, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success('Dataset uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Upload failed');
    }
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: datasetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success('Dataset deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  });
};

export const useCleanupDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CleanupRequest }) =>
      datasetsApi.cleanup(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', id] });
      queryClient.invalidateQueries({ queryKey: ['datasets', id, 'data'] });
      toast.success('Cleanup operation completed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Cleanup failed');
    }
  });
};

export const useDatasetVersions = (id: string) => {
  return useQuery({
    queryKey: ['datasets', id, 'versions'],
    queryFn: () => datasetsApi.getVersions(id),
    enabled: !!id
  });
};

export const useRevertDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      datasetsApi.revert(id, version),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', id] });
      queryClient.invalidateQueries({ queryKey: ['datasets', id, 'data'] });
      queryClient.invalidateQueries({ queryKey: ['datasets', id, 'versions'] });
      toast.success('Dataset reverted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Revert failed');
    }
  });
};