import { apiClient } from './client';
import { 
  SavedRule, 
  BulkOperation, 
  PreviewResult, 
  ExecuteRequest,
  RuleConfig,
  BulkRule,
  SavedRuleCreate,
  SavedRuleUpdate
} from '../types/bulk';
import { PaginatedResponse } from '../types/common';

export const bulkOperationsApi = {
  // Saved Rules
  listRules: async (): Promise<PaginatedResponse<SavedRule>> => {
    const response = await apiClient.get('/bulk/rules/');
    // Handle paginated response - extract results array
    if (response.data.results) {
      return response.data; // Already paginated
    }
    // If it's a direct array, wrap it in pagination format
    return {
      count: Array.isArray(response.data) ? response.data.length : 0,
      next: null,
      previous: null,
      results: Array.isArray(response.data) ? response.data : []
    };
  },

  createRule: async (data: SavedRuleCreate): Promise<SavedRule> => {
    const response = await apiClient.post('/bulk/rules/', data);
    return response.data;
  },

  updateRule: async (id: string, data: SavedRuleUpdate): Promise<SavedRule> => {
    const response = await apiClient.put(`/bulk/rules/${id}/`, data);
    return response.data;
  },

  deleteRule: async (id: string): Promise<void> => {
    await apiClient.delete(`/bulk/rules/${id}/`);
  },

  // Operations
  getOperations: async (): Promise<PaginatedResponse<BulkOperation>> => {
    const response = await apiClient.get('/bulk/operations/');
    return response.data;
  },

  preview: async (datasetId: string, ruleConfig: RuleConfig): Promise<PreviewResult> => {
    const response = await apiClient.post(`/bulk/${datasetId}/preview/`, {
      rule_config: ruleConfig
    });
    return response.data;
  },

  execute: async (datasetId: string, data: ExecuteRequest): Promise<BulkOperation> => {
    const response = await apiClient.post(`/bulk/${datasetId}/execute/`, data);
    return response.data;
  },

  undo: async (operationId: string): Promise<void> => {
    await apiClient.post(`/bulk/undo/${operationId}/`);
  },

  getHistory: async (datasetId: string): Promise<BulkOperation[]> => {
    const response = await apiClient.get(`/bulk/${datasetId}/history/`);
    return response.data;
  }
};

// New bulk API that matches the component expectations
export const bulkApi = {
  previewRule: async (datasetId: string, rule: BulkRule): Promise<PreviewResult> => {
    const response = await apiClient.post(`/bulk/${datasetId}/preview/`, {
      conditions: rule.conditions,
      action: rule.action
    });
    return {
      affected_count: response.data.affected_count,
      total_rows: response.data.total_rows,
      preview_rows: response.data.preview_rows || [],
      affected_indices: response.data.affected_indices || []
    };
  },
  
  executeRule: async (datasetId: string, rule: BulkRule): Promise<BulkOperation> => {
    const response = await apiClient.post(`/bulk/${datasetId}/execute/`, {
      conditions: rule.conditions,
      action: rule.action
    });
    return response.data;
  },
  
  undoOperation: async (operationId: string): Promise<void> => {
    const response = await apiClient.post(`/bulk/undo/${operationId}/`);
    return response.data;
  },
  
  getHistory: async (datasetId: string): Promise<BulkOperation[]> => {
    const response = await apiClient.get(`/bulk/${datasetId}/history/`);
    return response.data;
  },
  
  getSavedRules: async (): Promise<PaginatedResponse<SavedRule>> => {
    const response = await apiClient.get('/bulk/rules/');
    
    // Handle paginated response - extract results array
    if (response.data.results) {
      return response.data; // Already paginated
    }
    // If it's a direct array, wrap it in pagination format
    return {
      count: Array.isArray(response.data) ? response.data.length : 0,
      next: null,
      previous: null,
      results: Array.isArray(response.data) ? response.data : []
    };
  },
  
  getSavedRule: async (id: string): Promise<SavedRule> => {
    const response = await apiClient.get(`/bulk/rules/${id}/`);
    return response.data;
  },
  
  createSavedRule: async (rule: SavedRuleCreate): Promise<SavedRule> => {
    const payload = {
      name: rule.name,
      description: rule.description || '',
      configuration: rule.rule  // Backend expects 'configuration', not 'rule'
    };
    console.log('Creating saved rule with payload:', payload);
    const response = await apiClient.post('/bulk/rules/', payload);
    console.log('Saved rule response:', response.data);
    return response.data;
  },
  
  updateSavedRule: async (id: string, rule: SavedRuleUpdate): Promise<SavedRule> => {
    const payload: any = {};
    if (rule.name !== undefined) payload.name = rule.name;
    if (rule.description !== undefined) payload.description = rule.description;
    if (rule.rule !== undefined) payload.configuration = rule.rule;  // Convert 'rule' to 'configuration'
    
    const response = await apiClient.put(`/bulk/rules/${id}/`, payload);
    return response.data;
  },
  
  deleteSavedRule: async (id: string): Promise<void> => {
    await apiClient.delete(`/bulk/rules/${id}/`);
  },
  
  applySavedRule: async (ruleId: string, datasetId: string): Promise<{ success: boolean; message: string; rows_affected: number; operation_id: string }> => {
    const response = await apiClient.post(`/bulk/rules/${ruleId}/apply/`, {
      dataset_id: datasetId
    });
    return response.data;
  },
};