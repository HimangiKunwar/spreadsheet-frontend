import { apiClient } from './client';

// Types
export interface WorkflowOperation {
  operation: string;
  column: string | null;
  params: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  operations: WorkflowOperation[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_run: string | null;
  run_count: number;
}

export interface WorkflowRun {
  id: string;
  workflow: string;
  dataset: string;
  dataset_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  results: {
    operations_completed: number;
    operations_failed: number;
    details: Array<{
      step: number;
      operation: string;
      status: string;
      rows_affected: number;
    }>;
  } | null;
  error_message: string;
}

export interface OperationDefinition {
  id: string;
  name: string;
  description: string;
  requires_column: boolean;
  params?: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: any;
  }>;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  operations: WorkflowOperation[];
}

export interface RunWorkflowData {
  dataset_id: string;
}

// API Functions

// Get all workflows for current user
export const getWorkflows = async (): Promise<Workflow[]> => {
  const response = await apiClient.get('/workflows/');
  // Handle paginated response
  return response.data.results || response.data;
};

// Get single workflow by ID
export const getWorkflow = async (id: string): Promise<Workflow> => {
  const response = await apiClient.get(`/workflows/${id}/`);
  return response.data;
};

// Create new workflow
export const createWorkflow = async (data: CreateWorkflowData): Promise<Workflow> => {
  // Convert null columns to empty strings for backend compatibility
  const payload = {
    ...data,
    operations: data.operations.map(op => ({
      ...op,
      column: op.column || ''
    }))
  };
  const response = await apiClient.post('/workflows/', payload);
  return response.data;
};

// Update existing workflow
export const updateWorkflow = async (id: string, data: Partial<CreateWorkflowData>): Promise<Workflow> => {
  // Convert null columns to empty strings for backend compatibility
  const payload = {
    ...data,
    operations: data.operations?.map(op => ({
      ...op,
      column: op.column || ''
    })) || []
  };
  const response = await apiClient.put(`/workflows/${id}/`, payload);
  return response.data;
};

// Delete workflow
export const deleteWorkflow = async (id: string): Promise<void> => {
  await apiClient.delete(`/workflows/${id}/`);
};

// Get available cleanup operations
export const getOperations = async (): Promise<OperationDefinition[]> => {
  const response = await apiClient.get('/workflows/operations/');
  return response.data;
};

// Run workflow on a dataset
export const runWorkflow = async (workflowId: string, data: RunWorkflowData): Promise<WorkflowRun> => {
  const response = await apiClient.post(`/workflows/${workflowId}/run/`, data);
  return response.data;
};

// Get workflow run history
export const getWorkflowHistory = async (workflowId: string): Promise<WorkflowRun[]> => {
  const response = await apiClient.get(`/workflows/${workflowId}/history/`);
  // Handle paginated response
  return response.data.results || response.data;
};

// Default export for convenience
export default {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getOperations,
  runWorkflow,
  getWorkflowHistory,
};