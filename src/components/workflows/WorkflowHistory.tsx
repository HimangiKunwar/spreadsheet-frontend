import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { getWorkflowHistory, type WorkflowRun } from '../../api/workflows';

interface Props {
  workflowId: string;
  onBack: () => void;
}

const WorkflowHistory: React.FC<Props> = ({ workflowId, onBack }) => {
  const { data: runs, isLoading } = useQuery({
    queryKey: ['workflow-history', workflowId],
    queryFn: () => getWorkflowHistory(workflowId),
  });

  const runsList: WorkflowRun[] = runs || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      case 'running':
        return <Clock className="text-blue-500 animate-spin" size={20} />;
      default:
        return <AlertTriangle className="text-yellow-500" size={20} />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Run History
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View past executions of this workflow
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && runsList.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Clock className="mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            No runs yet. Execute the workflow to see history.
          </p>
        </div>
      )}

      {/* History List */}
      {runsList.length > 0 && (
        <div className="space-y-4">
          {runsList.map((run) => (
            <div
              key={run.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(run.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Run on {run.dataset_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(run.started_at)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  run.status === 'completed' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : run.status === 'failed'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {run.status}
                </span>
              </div>

              {/* Results */}
              {run.results && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ✅ {run.results.operations_completed} operations completed
                    {run.results.operations_failed > 0 && (
                      <span className="text-red-500 ml-2">
                        ❌ {run.results.operations_failed} failed
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {run.error_message && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {run.error_message}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowHistory;