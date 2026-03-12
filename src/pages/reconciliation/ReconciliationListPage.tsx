import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useReconciliations, useDeleteReconciliation, useExportReconciliation } from '../../hooks/useReconciliation';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const ReconciliationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useReconciliations();
  const deleteMutation = useDeleteReconciliation();
  const exportMutation = useExportReconciliation();

  const reconciliations = (data as any)?.results || [];
  const totalCount = (data as any)?.count || 0;

  // Debug logging
  console.log('🔍 ReconciliationListPage - Raw data:', data);
  console.log('🔍 ReconciliationListPage - Reconciliations:', reconciliations);
  console.log('🔍 ReconciliationListPage - Total count:', totalCount);
  console.log('🔍 ReconciliationListPage - Is loading:', isLoading);
  console.log('🔍 ReconciliationListPage - Reconciliations length:', reconciliations.length);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning' as const,
      running: 'info' as const,
      completed: 'success' as const,
      failed: 'error' as const
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reconciliation?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = (id: string) => {
    exportMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reconciliation"
        subtitle={`Compare datasets to identify matches, mismatches, and differences${totalCount > 0 ? ` (${totalCount} total)` : ''}`}
        actions={
          <Button
            onClick={() => navigate('/reconciliation/new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Reconciliation
          </Button>
        }
      />

      <div className="space-y-4">
        {reconciliations.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reconciliations yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first reconciliation to compare datasets and identify differences.
              </p>
              <Button
                onClick={() => navigate('/reconciliation/new')}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Reconciliation
              </Button>
            </div>
          </Card>
        ) : (
          reconciliations.map((reconciliation: any) => (
            <Card key={reconciliation.id}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {reconciliation.name || `${reconciliation.source_dataset_name} vs ${reconciliation.target_dataset_name}`}
                    </h3>
                    {getStatusBadge(reconciliation.status)}
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p className="truncate">
                      <span className="font-medium">Source:</span> {reconciliation.source_dataset_name}
                    </p>
                    <p className="truncate">
                      <span className="font-medium">Target:</span> {reconciliation.target_dataset_name}
                    </p>
                    <p className="truncate">
                      <span className="font-medium">Key Columns:</span> {reconciliation.source_key_columns.join(', ')}
                    </p>
                    {reconciliation.fuzzy_match && (
                      <p>
                        <span className="font-medium">Fuzzy Matching:</span> {reconciliation.fuzzy_threshold}% threshold
                      </p>
                    )}
                  </div>

                  {reconciliation.status === 'completed' && reconciliation.summary && (
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-6 mt-3 text-xs sm:text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">{reconciliation.summary.match_count} matches</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">{reconciliation.summary.mismatch_count} mismatches</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">{reconciliation.summary.source_only_count} source only</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">{reconciliation.summary.target_only_count} target only</span>
                      </div>
                      <div className="text-gray-600 col-span-2 sm:col-span-1">
                        Match rate: {Math.round(reconciliation.summary.match_rate * 100)}%
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Created {formatDistanceToNow(new Date(reconciliation.created_at), { addSuffix: true })}
                    {reconciliation.completed_at && (
                      <> • Completed {formatDistanceToNow(new Date(reconciliation.completed_at), { addSuffix: true })}</>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:flex-col lg:space-y-2 lg:space-x-0 xl:flex-row xl:space-y-0 xl:space-x-2">
                  {reconciliation.status === 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(reconciliation.id)}
                        leftIcon={<Download className="h-4 w-4" />}
                        loading={exportMutation.isPending}
                        className="w-full sm:w-auto text-xs"
                      >
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/reconciliation/${reconciliation.id}`)}
                        leftIcon={<Eye className="h-4 w-4" />}
                        className="w-full sm:w-auto text-xs"
                      >
                        View Results
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(reconciliation.id)}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    loading={deleteMutation.isPending}
                    className="w-full sm:w-auto text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReconciliationListPage;