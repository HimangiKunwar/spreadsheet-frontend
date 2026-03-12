import { apiClient } from './client';
import { CleanupRequest, CleanupPreviewResponse, CleanupResponse, CleanupOperation } from '../types/cleanup';

export const cleanupApi = {
  // Get available cleanup operations
  getOperations: (): Promise<Record<string, CleanupOperation>> =>
    apiClient.get('/datasets/cleanup-operations/').then(res => res.data),
  
  // Preview cleanup changes
  preview: (datasetId: string, request: CleanupRequest): Promise<CleanupPreviewResponse> =>
    apiClient.post(`/datasets/${datasetId}/cleanup/preview/`, request).then(res => res.data),
  
  // Apply cleanup operation
  apply: (datasetId: string, request: CleanupRequest): Promise<CleanupResponse> =>
    apiClient.post(`/datasets/${datasetId}/cleanup/`, request).then(res => res.data),
};