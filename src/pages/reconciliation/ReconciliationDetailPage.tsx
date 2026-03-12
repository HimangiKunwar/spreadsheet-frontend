import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { reconciliationApi } from '../../api/reconciliation';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs } from '../../components/ui/Tabs';
import { formatDistanceToNow } from 'date-fns';

const ReconciliationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  const { data: reconciliation, isLoading, error } = useQuery({
    queryKey: ['reconciliation', id],
    queryFn: () => reconciliationApi.get(id!),
    enabled: !!id,
  });

  const { data: results } = useQuery({
    queryKey: ['reconciliation-results', id],
    queryFn: () => reconciliationApi.getResults(id!),
    enabled: !!id && reconciliation?.status === 'completed',
  });

  const handleExport = async () => {
    if (!id) return;
    
    try {
      const blob = await reconciliationApi.export(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconciliation-${reconciliation?.name || id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'matches', label: 'Matches', count: reconciliation?.summary?.match_count || 0 },
    { id: 'mismatches', label: 'Mismatches', count: reconciliation?.summary?.mismatch_count || 0 },
    { id: 'source-only', label: 'Source Only', count: reconciliation?.summary?.source_only_count || 0 },
    { id: 'target-only', label: 'Target Only', count: reconciliation?.summary?.target_only_count || 0 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !reconciliation) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load reconciliation</p>
        <Button
          variant="outline"
          onClick={() => navigate('/reconciliation')}
          className="mt-4"
        >
          Back to Reconciliation
        </Button>
      </div>
    );
  }

  const renderSummary = () => (
    <div className="space-y-6">
      {/* Status and Basic Info */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(reconciliation?.status || 'unknown')}
              <div>
                <h3 className="text-lg font-semibold">{reconciliation?.name || 'Unnamed Reconciliation'}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reconciliation?.status || 'unknown')}`}>
                  {(reconciliation?.status || 'unknown').charAt(0).toUpperCase() + (reconciliation?.status || 'unknown').slice(1)}
                </span>
              </div>
            </div>
            {reconciliation?.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Export Results
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Source Dataset:</span>
              <p className="font-medium">{reconciliation?.source_dataset_name || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-500">Target Dataset:</span>
              <p className="font-medium">{reconciliation?.target_dataset_name || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium">
                {reconciliation?.created_at ? formatDistanceToNow(new Date(reconciliation.created_at), { addSuffix: true }) : 'Unknown'}
              </p>
            </div>
            {reconciliation?.completed_at && (
              <div>
                <span className="text-gray-500">Completed:</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(reconciliation.completed_at), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>

          {reconciliation?.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{reconciliation.error_message}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Statistics */}
      {reconciliation?.summary && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Results Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {reconciliation.summary.match_count?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-green-700">Matches</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {reconciliation.summary.mismatch_count?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-yellow-700">Mismatches</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {reconciliation.summary.source_only_count?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-blue-700">Source Only</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {reconciliation.summary.target_only_count?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-purple-700">Target Only</div>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-800">
                {reconciliation.summary.match_rate ? 
                  `${Math.round(reconciliation.summary.match_rate * 100)}%` : 
                  'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">Match Rate</div>
            </div>
          </div>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuration</h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Key Columns:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {reconciliation.source_key_columns?.map((col, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {col} ↔ {reconciliation.target_key_columns?.[index]}
                  </span>
                ))}
              </div>
            </div>

            {reconciliation.compare_columns && reconciliation.compare_columns.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Compare Columns:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {reconciliation.compare_columns.map((col, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reconciliation.fuzzy_match && (
              <div>
                <span className="text-sm text-gray-500">Fuzzy Matching:</span>
                <span className="ml-2 text-sm font-medium">
                  Enabled (Threshold: {Math.round((reconciliation.fuzzy_threshold || 0.8) * 100)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderResultsTable = (data: any[], columns: string[], emptyMessage: string, count: number) => {
    if (!data || data.length === 0) {
      return (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </Card>
      );
    }

    return (
      <Card>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Showing {data.length} of {count.toLocaleString()} records
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map(col => (
                      <td key={col} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {row.row?.[col]?.toString() ?? row[col]?.toString() ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  };

  const renderMismatchTable = (data: any[], count: number) => {
    if (!data || data.length === 0) {
      return (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No mismatched records found</p>
          </div>
        </Card>
      );
    }

    return (
      <Card>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Showing {data.length} of {count.toLocaleString()} mismatched records
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">Source Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">Target Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((mismatch, idx) => 
                  mismatch.differences?.map((diff: any, diffIdx: number) => (
                    <tr key={`${idx}-${diffIdx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {mismatch.key || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {diff.column || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-700 bg-blue-50">
                        {diff.source?.toString() ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-700 bg-green-50">
                        {diff.target?.toString() ?? '-'}
                      </td>
                    </tr>
                  )) || (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {mismatch.key || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600" colSpan={3}>
                        No differences data available
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'summary') {
      return renderSummary();
    }

    if (reconciliation?.status !== 'completed') {
      return (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">
              {reconciliation?.status === 'running' ? 'Reconciliation in progress...' : 'No results available'}
            </p>
          </div>
        </Card>
      );
    }

    // Get results from the reconciliation object directly or from the separate results query
    const resultData = results?.data || (reconciliation as any)?.results || {};
    const summary = reconciliation?.summary || {};

    switch (activeTab) {
      case 'matches':
        return renderResultsTable(
          resultData.matches || [],
          Object.keys(resultData.matches?.[0]?.row || {}),
          'No matching records found',
          summary.match_count || 0
        );
      
      case 'mismatches':
        return renderMismatchTable(
          resultData.mismatches || [],
          summary.mismatch_count || 0
        );
      
      case 'source-only':
        return renderResultsTable(
          resultData.source_only || [],
          Object.keys(resultData.source_only?.[0]?.row || {}),
          'No source-only records found',
          summary.source_only_count || 0
        );
      
      case 'target-only':
        return renderResultsTable(
          resultData.target_only || [],
          Object.keys(resultData.target_only?.[0]?.row || {}),
          'No target-only records found',
          summary.target_only_count || 0
        );
      
      default:
        return renderSummary();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={reconciliation?.name || 'Reconciliation Details'}
        subtitle={`${reconciliation?.source_dataset_name || 'Unknown'} vs ${reconciliation?.target_dataset_name || 'Unknown'}`}
        breadcrumb={
          <Button
            variant="ghost"
            onClick={() => navigate('/reconciliation')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Reconciliation
          </Button>
        }
      />

      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
};

export default ReconciliationDetailPage;