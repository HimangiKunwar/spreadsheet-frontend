import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Plus, Trash2, GripVertical, Save, X, ChevronUp, 
  ChevronDown, Zap, AlertCircle 
} from 'lucide-react';
import { 
  getOperations, 
  createWorkflow, 
  updateWorkflow,
  type WorkflowOperation,
  type Workflow,
  type OperationDefinition,
  type CreateWorkflowData
} from '../../api/workflows';
import { apiClient } from '../../api/client';

interface Props {
  workflow: Workflow | null;
  onSave: () => void;
  onCancel: () => void;
}

const WorkflowBuilder: React.FC<Props> = ({ workflow, onSave, onCancel }) => {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [operations, setOperations] = useState<WorkflowOperation[]>(workflow?.operations || []);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [errors, setErrors] = useState<{ name?: string; operations?: string }>({});
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // Fetch available operations
  const { data: operationsResponse, isLoading: loadingOps, error: opsError } = useQuery({
    queryKey: ['workflow-operations'],
    queryFn: () => getOperations(),
  });

  const availableOperations: OperationDefinition[] = React.useMemo(() => {
    if (!operationsResponse) return [];
    const seen = new Set();
    return operationsResponse.filter((op: any) => {
      if (seen.has(op.id)) {
        return false;
      }
      seen.add(op.id);
      return true;
    });
  }, [operationsResponse]);

  // Fetch datasets on component mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await apiClient.get('/datasets/');
        const datasetsData = response.data.results || response.data || [];
        setDatasets(Array.isArray(datasetsData) ? datasetsData : []);
      } catch {
        setDatasets([]);
      }
    };
    fetchDatasets();
  }, []);

  // Handle dataset selection and fetch columns
  const handleDatasetSelect = useCallback(async (datasetId: string) => {
    setSelectedDataset(datasetId);
    if (!datasetId) {
      setAvailableColumns([]);
      return;
    }
    try {
      const response = await apiClient.get(`/datasets/${datasetId}/`);
      
      // Extract columns from different possible response formats
      let columns: string[] = [];
      if (response.data.columns && Array.isArray(response.data.columns)) {
        columns = response.data.columns;
      } else if (response.data.schema?.columns && Array.isArray(response.data.schema.columns)) {
        columns = response.data.schema.columns.map((col: any) => 
          typeof col === 'string' ? col : col.name || col.column_name || ''
        ).filter(Boolean);
      } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        // Extract column names from first data row
        columns = Object.keys(response.data.data[0]);
      }
      
      setAvailableColumns(columns);
    } catch {
      setAvailableColumns([]);
    }
  }, []);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateWorkflowData) =>
      workflow ? updateWorkflow(workflow.id, data) : createWorkflow(data),
    onSuccess: () => {
      onSave();
    },
    onError: (error: any) => {
      alert('Failed to save: ' + (error.response?.data?.detail || error.message));
    },
  });

  const addOperation = useCallback(() => {
    if (!selectedOperation) return;
    
    const opInfo = (availableOperations || []).find((o) => o.id === selectedOperation);
    
    // Build default params from operation definition
    const defaultParams: Record<string, any> = {};
    if (opInfo?.params) {
      opInfo.params.forEach((param: any) => {
        if (param.default !== undefined) {
          defaultParams[param.name] = param.default;
        }
      });
    }
    
    const newOp: WorkflowOperation = {
      operation: selectedOperation,
      column: opInfo?.requires_column ? '' : null,
      params: defaultParams,
    };
    
    setOperations(prev => [...prev, newOp]);
    setSelectedOperation('');
    setErrors(prev => ({ ...prev, operations: undefined }));
  }, [selectedOperation, availableOperations]);

  const updateOperationColumn = useCallback((index: number, column: string) => {
    setOperations(prev => {
      const newOps = [...prev];
      newOps[index] = { ...newOps[index], column };
      return newOps;
    });
  }, []);

  const updateOperationParam = useCallback((index: number, paramName: string, value: any) => {
    setOperations(prev => {
      const newOps = [...prev];
      newOps[index] = {
        ...newOps[index],
        params: {
          ...newOps[index].params,
          [paramName]: value
        }
      };
      return newOps;
    });
  }, []);

  const removeOperation = useCallback((index: number) => {
    setOperations(prev => prev.filter((_, i) => i !== index));
  }, []);

  const moveOperation = useCallback((from: number, to: number) => {
    setOperations(prev => {
      if (to < 0 || to >= prev.length) return prev;
      const newOps = [...prev];
      const [removed] = newOps.splice(from, 1);
      newOps.splice(to, 0, removed);
      return newOps;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: { name?: string; operations?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Workflow name is required';
    }
    
    if (operations.length === 0) {
      newErrors.operations = 'Add at least one operation';
    }
    
    // Check if columns are filled for operations that need them
    const missingColumns = operations.some((op) => {
      const opInfo = (availableOperations || []).find((o) => o.id === op.operation);
      return opInfo?.requires_column && !op.column?.trim();
    });
    
    if (missingColumns) {
      newErrors.operations = 'Fill in column names for all operations that require them';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, operations, availableOperations]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    
    saveMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      operations,
    });
  }, [validate, saveMutation, name, description, operations]);

  const clearAllOperations = useCallback(() => {
    setOperations([]);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
            <Zap className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {workflow ? 'Edit Workflow' : 'Create New Workflow'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Build a sequence of cleanup operations
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X size={24} />
        </button>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workflow Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g., Daily Sales Cleanup"
              className={`w-full border rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
              } focus:outline-none focus:ring-2`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this workflow do? When should it be used?"
              rows={2}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📂 Load columns from dataset (optional)
            </label>
            <select
              value={selectedDataset || ''}
              onChange={(e) => handleDatasetSelect(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select a dataset to load columns...</option>
              {(datasets || []).map((ds) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
            {availableColumns.length > 0 && (
              <div className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ✓ {availableColumns.length} columns loaded: {availableColumns.slice(0, 3).join(', ')}{availableColumns.length > 3 ? '...' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operations Builder Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Operations Sequence
        </h2>

        {loadingOps ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading operations...</p>
          </div>
        ) : (
          <>
            {/* Add Operation Dropdown */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <select
                  value={selectedOperation}
                  onChange={(e) => setSelectedOperation(e.target.value)}
                  disabled={loadingOps}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">
                    {loadingOps ? 'Loading operations...' : 'Select an operation to add...'}
                  </option>
                  {(availableOperations || []).map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name} - {op.description}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addOperation}
                disabled={!selectedOperation}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {/* Error Message */}
            {opsError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={18} />
                Failed to load operations. Please refresh the page.
              </div>
            )}
            
            {errors.operations && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={18} />
                {errors.operations}
              </div>
            )}

            {/* Operations List */}
            {operations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Zap className="mx-auto text-gray-400" size={40} />
                <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">
                  No operations added yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Select operations from the dropdown above to build your workflow
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {operations.map((op, index) => {
                  const opInfo = (availableOperations || []).find((o) => o.id === op.operation);
                  return (
                    <div
                      key={`${op.operation}-${index}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 group"
                    >
                      {/* Drag Handle */}
                      <div className="text-gray-400 cursor-move">
                        <GripVertical size={20} />
                      </div>

                      {/* Step Number */}
                      <div className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-full font-semibold text-sm">
                        {index + 1}
                      </div>

                      {/* Operation Details */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {opInfo?.name || op.operation}
                          </span>
                          
                          {opInfo?.requires_column && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">→</span>
                              {availableColumns.length > 0 ? (
                                <select
                                  value={op.column || ''}
                                  onChange={(e) => updateOperationColumn(index, e.target.value)}
                                  className="border border-green-300 dark:border-green-500 rounded-lg px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white min-w-[200px] focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="">Select column...</option>
                                  {(availableColumns || []).map((col, colIndex) => (
                                    <option key={`${col}-${colIndex}`} value={col}>{col}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={op.column || ''}
                                  onChange={(e) => updateOperationColumn(index, e.target.value)}
                                  placeholder="Load dataset first or type column name"
                                  className="border border-orange-400 dark:border-orange-500 rounded-lg px-3 py-1.5 text-sm bg-orange-50 dark:bg-orange-900/20 text-gray-900 dark:text-white min-w-[200px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Parameter Inputs */}
                        {opInfo?.params && opInfo.params.length > 0 && (
                          <div className="flex gap-2 flex-wrap ml-11">
                            {opInfo.params.map((param, paramIndex) => {
                              if (param.type === 'columns') {
                                return (
                                  <div key={`${param.name}-${paramIndex}`} className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">{(param as any).label || param.name}</label>
                                    <select
                                      multiple
                                      value={op.params?.[param.name] || []}
                                      onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                                        updateOperationParam(index, param.name, selected);
                                      }}
                                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px] max-h-20"
                                    >
                                      {(availableColumns || []).map((col, colIdx) => (
                                        <option key={`${col}-${colIdx}`} value={col}>{col}</option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              } else if (param.type === 'select') {
                                return (
                                  <div key={`${param.name}-${paramIndex}`} className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">{(param as any).label || param.name}</label>
                                    <select
                                      value={op.params?.[param.name] || param.default || ''}
                                      onChange={(e) => updateOperationParam(index, param.name, e.target.value)}
                                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px]"
                                    >
                                      <option value="">Select {(param as any).label || param.name}</option>
                                      {(param as any).options?.map((option: any, optIndex: number) => {
                                        const optionValue = typeof option === 'string' ? option : option.value;
                                        const optionLabel = typeof option === 'string' 
                                          ? option.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                                          : option.label;
                                        
                                        return (
                                          <option key={`${optionValue}-${optIndex}`} value={optionValue}>
                                            {optionLabel}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                );
                              } else if (param.type === 'number') {
                                return (
                                  <div key={`${param.name}-${paramIndex}`} className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">{(param as any).label || param.name}</label>
                                    <input
                                      type="number"
                                      min={(param as any).min}
                                      max={(param as any).max}
                                      placeholder={
                                        typeof (param as any).placeholder === 'string' 
                                          ? (param as any).placeholder 
                                          : (param as any).default?.toString() || `Enter ${(param as any).label?.toLowerCase() || param.name}...`
                                      }
                                      value={op.params?.[param.name] ?? param.default ?? ''}
                                      onChange={(e) => updateOperationParam(index, param.name, parseFloat(e.target.value) || (param as any).default)}
                                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px]"
                                    />
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={`${param.name}-${paramIndex}`} className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">{(param as any).label || param.name}</label>
                                    <input
                                      type="text"
                                      placeholder={
                                        typeof (param as any).placeholder === 'string' 
                                          ? (param as any).placeholder 
                                          : typeof (param as any).default === 'string' 
                                            ? (param as any).default 
                                            : `Enter ${(param as any).label?.toLowerCase() || param.name}...`
                                      }
                                      value={op.params?.[param.name] || ''}
                                      onChange={(e) => updateOperationParam(index, param.name, e.target.value)}
                                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px]"
                                    />
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveOperation(index, index - 1)}
                          disabled={index === 0}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button
                          onClick={() => moveOperation(index, index + 1)}
                          disabled={index === operations.length - 1}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ChevronDown size={18} />
                        </button>
                        <button
                          onClick={() => removeOperation(index)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Remove"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Operations Summary */}
            {operations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {operations.length} operation{operations.length !== 1 ? 's' : ''} in this workflow
                </span>
                <button
                  onClick={clearAllOperations}
                  className="text-red-500 hover:text-red-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Save Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {saveMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Workflow
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WorkflowBuilder;