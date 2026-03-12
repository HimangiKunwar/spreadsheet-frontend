import { apiClient } from './client';
import { Report, ReportTemplate } from '../types/report';
import { PaginatedResponse } from '../types/common';

export const reportsApi = {
  list: async (): Promise<PaginatedResponse<Report>> => {
    const response = await apiClient.get('/reports/');
    return response.data;
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get('/reports/');
    return response.data.count || 0;
  },

  create: async (data: Partial<Report>): Promise<Report> => {
    console.log('=== API CLIENT CREATE DEBUG ===');
    console.log('Data being sent to API:', JSON.stringify(data, null, 2));
    const response = await apiClient.post('/reports/', data);
    console.log('API Response:', response.data);
    return response.data;
  },

  get: async (id: string): Promise<Report> => {
    const response = await apiClient.get(`/reports/${id}/`);
    return response.data;
  },

  update: async (id: string, data: Partial<Report>): Promise<Report> => {
    const response = await apiClient.patch(`/reports/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/${id}/`);
  },

  generate: async (id: string, format: 'pdf' | 'xlsx' = 'pdf'): Promise<Report> => {
    const response = await apiClient.post(`/reports/${id}/generate/`, { format });
    return response.data;
  },

  download: async (id: string, format: 'pdf' | 'xlsx'): Promise<Blob> => {
    // Use POST request with format in body to avoid query parameter issues
    const response = await apiClient.post(`/reports/${id}/download/`, 
      { format },
      { responseType: 'blob' }
    );
    return response.data;
  },

  getTemplates: async (): Promise<ReportTemplate[]> => {
    const response = await apiClient.get('/reports/templates/');
    return response.data;
  },

  chartPreview: async (datasetId: string, chartConfig: any): Promise<any> => {
    const response = await apiClient.post(`/reports/${datasetId}/chart-preview/`, chartConfig);
    return response.data;
  },

  getSummary: async (datasetId: string, summaryConfig: any): Promise<any> => {
    const response = await apiClient.post(`/reports/${datasetId}/summary/`, summaryConfig);
    return response.data;
  }
};