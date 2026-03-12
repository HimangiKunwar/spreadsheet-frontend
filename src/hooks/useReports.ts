import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';
import { Report } from '../types/report';
import toast from 'react-hot-toast';

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.list
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportsApi.get(id),
    enabled: !!id
  });
};

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['reports', 'templates'],
    queryFn: reportsApi.getTemplates
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Report>) => reportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create report');
    }
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Report> }) =>
      reportsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      toast.success('Report updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update report');
    }
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reportsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: { id: string; format?: 'pdf' | 'xlsx' }) => {
      const { id, format = 'pdf' } = variables;
      return reportsApi.generate(id, format);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      toast.success('Report generation started!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Generation failed');
    }
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: (variables: { id: string; format: 'pdf' | 'xlsx' }) => {
      const { id, format } = variables;
      return reportsApi.download(id, format);
    },
    onSuccess: (blob, { id, format }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Download failed');
    }
  });
};

export const useChartPreview = () => {
  return useMutation({
    mutationFn: ({ datasetId, chartConfig }: { datasetId: string; chartConfig: any }) =>
      reportsApi.chartPreview(datasetId, chartConfig),
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Chart preview failed');
    }
  });
};

export const useSummaryPreview = () => {
  return useMutation({
    mutationFn: ({ datasetId, summaryConfig }: { datasetId: string; summaryConfig: any }) =>
      reportsApi.getSummary(datasetId, summaryConfig),
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Summary preview failed');
    }
  });
};