import { apiClient } from './client';
import { 
  ReconciliationJob, 
  CreateReconciliationRequest, 
} from '../types/reconciliation';
import { PaginatedResponse } from '../types/common';

export const reconciliationApi = {
  list: async (status?: string): Promise<PaginatedResponse<ReconciliationJob>> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/reconcile/${params}`);
    return response.data;
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get('/reconcile/');
    return response.data.count || 0;
  },

  create: async (data: CreateReconciliationRequest): Promise<ReconciliationJob> => {
    const response = await apiClient.post('/reconcile/', data);
    return response.data;
  },

  get: async (id: string): Promise<ReconciliationJob> => {
    const response = await apiClient.get(`/reconcile/${id}/`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reconcile/${id}/`);
  },

  getResults: async (id: string, type?: string, page?: number): Promise<any> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (page) params.append('page', page.toString());
    
    const response = await apiClient.get(`/reconcile/${id}/results/?${params}`);
    return response.data;
  },

  export: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/reconcile/${id}/export/`, {
      responseType: 'blob'
    });
    return response.data;
  }
};