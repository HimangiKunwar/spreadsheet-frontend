import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Play, Edit2, Trash2, Clock, CheckCircle, 
  AlertCircle, Zap, ChevronRight, History 
} from 'lucide-react';
import { 
  getWorkflows,
  deleteWorkflow,
  runWorkflow,
  type Workflow 
} from '../../api/workflows';
import { apiClient } from '../../api/client';
import WorkflowBuilder from '../../components/workflows/WorkflowBuilder';
import WorkflowHistory from '../../components/workflows/WorkflowHistory';

const WorkflowsPage: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const queryClient = useQueryClient();

  // Fetch workflows
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => getWorkflows(),
  });

  // Fetch datasets on component mount
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        console.log('=== Fetching datasets for run dropdown ===');
        const response = await apiClient.get('/datasets/');
        console.log('Datasets API response:', response.data);
        
        // Handle DRF pagination
        const datasetList = response.data.results || response.data || [];
        console.log('Datasets list:', datasetList);
        
        setDatasets(datasetList);
      } catch (error) {
        console.error('Failed to fetch datasets:', error);
        setDatasets([]);
      }
    };
    fetchDatasets();
  }, []);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  // Run mutation
  const runMutation = useMutation({
    mutationFn: ({ workflowId, datasetId }: { workflowId: string; datasetId: string }) => {
      console.log('=== RUNNING WORKFLOW ===');
      console.log('Workflow ID:', workflowId);
      console.log('Dataset ID:', datasetId);
      return runWorkflow(workflowId, { dataset_id: datasetId });
    },
    onSuccess: (response) => {
      console.log('=== WORKFLOW RUN SUCCESS ===');
      console.log('Response:', response);
      setRunResult(response);
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setRunningWorkflowId(null);
      setSelectedDataset('');
    },
    onError: (error: any) => {
      console.error('=== WORKFLOW RUN ERROR ===');
      console.error('Error:', error);
      alert('Failed to run workflow: ' + (error.response?.data?.detail || error.message));
    },
  });

  // Extract data from response
  const workflowsList = workflows || [];

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete workflow "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleRun = (workflowId: string) => {
    console.log('=== HANDLE RUN ===');
    console.log('Selected dataset:', selectedDataset);
    if (!selectedDataset) {
      alert('Please select a dataset');
      return;
    }
    runMutation.mutate({ workflowId, datasetId: selectedDataset });
  };

  // Show builder/editor
  if (showBuilder || editingWorkflow) {
    return (
      <WorkflowBuilder
        workflow={editingWorkflow}
        onSave={() => {
          setShowBuilder(false);
          setEditingWorkflow(null);
          queryClient.invalidateQueries({ queryKey: ['workflows'] });
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingWorkflow(null);
        }}
      />
    );
  }

  // Show history
  if (showHistory) {
    return (
      <WorkflowHistory
        workflowId={showHistory}
        onBack={() => setShowHistory(null)}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="text-orange-500" size={28} />
            Workflow Macros
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Save and reuse data cleanup sequences - like Excel macros, but easier!
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Create Workflow
        </button>
      </div>

      {/* Run Result Toast */}
      {runResult && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Workflow completed successfully!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {runResult.results?.operations_completed} operations completed
                  {runResult.results?.operations_failed > 0 && 
                    `, ${runResult.results.operations_failed} failed`}
                  {runResult.results?.rows_before && runResult.results?.rows_after && (
                    <span className="block mt-1">
                      Dataset: {runResult.results.rows_before} → {runResult.results.rows_after} rows
                      {runResult.results.new_dataset_name && (
                        <span className="font-medium"> • Created: {runResult.results.new_dataset_name}</span>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setRunResult(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading workflows...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <p className="mt-4 text-red-600 dark:text-red-400">Failed to load workflows</p>
          <p className="text-sm text-red-500">{(error as any).message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && workflowsList.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Zap className="mx-auto text-gray-400" size={64} />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No workflows yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Create your first workflow to automate repetitive data cleanup tasks.
            Save time by running multiple operations with one click!
          </p>
          <button
            onClick={() => setShowBuilder(true)}
            className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            <Plus size={20} />
            Create Your First Workflow
          </button>
        </div>
      )}

      {/* Workflows Grid */}
      {!isLoading && workflowsList.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {workflowsList.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Workflow Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {workflow.name}
                    </h3>
                    {workflow.is_active && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {workflow.description || 'No description'}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowHistory(workflow.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="View History"
                  >
                    <History size={18} />
                  </button>
                  <button
                    onClick={() => setEditingWorkflow(workflow)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(workflow.id, workflow.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Zap size={14} />
                  {workflow.operations.length} operations
                </span>
                <span className="flex items-center gap-1">
                  <Play size={14} />
                  Run {workflow.run_count} times
                </span>
                {workflow.last_run && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Last: {new Date(workflow.last_run).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Operations Preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {workflow.operations.slice(0, 4).map((op, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
                  >
                    <span className="w-5 h-5 flex items-center justify-center bg-orange-200 dark:bg-orange-800 rounded-full text-xs font-medium">
                      {idx + 1}
                    </span>
                    {op.operation.replace(/_/g, ' ')}
                    {op.column && (
                      <span className="text-orange-500 dark:text-orange-400">
                        ({op.column})
                      </span>
                    )}
                  </span>
                ))}
                {workflow.operations.length > 4 && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                    +{workflow.operations.length - 4} more
                  </span>
                )}
              </div>

              {/* Run Section */}
              {runningWorkflowId === workflow.id ? (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select dataset to run this workflow:
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedDataset}
                      onChange={(e) => setSelectedDataset(e.target.value)}
                      className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Choose a dataset...</option>
                      {datasets.map((ds: any) => (
                        <option key={ds.id} value={ds.id}>
                          {ds.name || ds.original_filename}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => handleRun(workflow.id)}
                      disabled={!selectedDataset || runMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {runMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Run
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setRunningWorkflowId(null);
                        setSelectedDataset('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {datasets.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      No datasets available. Please upload a dataset first.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setRunningWorkflowId(workflow.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors font-medium"
                >
                  <Play size={18} />
                  Run Workflow
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;