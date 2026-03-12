import { apiClient } from './client';
import { Dataset, PaginatedData, DatasetVersion, CleanupRequest } from '../types/dataset';
import { PaginatedResponse } from '../types/common';

export const datasetsApi = {
  list: async (): Promise<PaginatedResponse<Dataset>> => {
    const response = await apiClient.get('/datasets/');
    return response.data;
  },

  getCount: async (): Promise<number> => {
    const response = await apiClient.get('/datasets/');
    return response.data.count || 0;
  },

  upload: async (file: File, name?: string): Promise<Dataset> => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const response = await apiClient.post('/datasets/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  get: async (id: string): Promise<Dataset> => {
    const response = await apiClient.get(`/datasets/${id}/`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/datasets/${id}/`);
  },

  getData: async (id: string, page = 1, pageSize = 50): Promise<PaginatedData> => {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 50);
    
    const response = await apiClient.get(`/datasets/${id}/data/`, {
      params: { page: safePage, page_size: safePageSize },
    });
    return response.data;
  },

  cleanup: async (id: string, request: CleanupRequest): Promise<Dataset> => {
    const response = await apiClient.post(`/datasets/${id}/cleanup/`, request);
    return response.data;
  },

  getVersions: async (id: string): Promise<DatasetVersion[]> => {
    const response = await apiClient.get(`/datasets/${id}/versions/`);
    return response.data;
  },

  revert: async (id: string, version: number): Promise<Dataset> => {
    const response = await apiClient.post(`/datasets/${id}/revert/${version}/`);
    return response.data;
  },
};