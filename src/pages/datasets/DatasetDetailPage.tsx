import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Settings, History, FileText } from 'lucide-react';
import { useDataset, useDatasetData, useDatasetVersions } from '../../hooks/useDatasets';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import DataGrid from '../../components/datasets/DataGrid';
import { Pagination } from '../../components/ui/Pagination';
import { PageHeader } from '../../components/layout/PageHeader';
import CleanupPanel from '../../components/datasets/CleanupPanel';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { datasetsApi } from '../../api/datasets';
import toast from 'react-hot-toast';

const DatasetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('data');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const { data: dataset, isLoading: datasetLoading } = useDataset(id!);
  const { data: datasetData, isLoading: dataLoading } = useDatasetData(id!, currentPage, pageSize);
  const { data: versions, isLoading: versionsLoading } = useDatasetVersions(id!);

  const revertMutation = useMutation({
    mutationFn: (versionNumber: number) => datasetsApi.revert(id!, versionNumber),
    onSuccess: () => {
      toast.success('Dataset reverted successfully');
      queryClient.invalidateQueries({ queryKey: ['dataset', id] });
      queryClient.invalidateQueries({ queryKey: ['dataset-data', id] });
      queryClient.invalidateQueries({ queryKey: ['dataset-versions', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to revert dataset');
    }
  });

  const handleRevert = (versionNumber: number) => {
    if (window.confirm(`Are you sure you want to revert to Version ${versionNumber}?`)) {
      revertMutation.mutate(versionNumber);
    }
  };

  if (datasetLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Dataset not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'data', label: 'Data', icon: <Database className="h-4 w-4" /> },
    { id: 'schema', label: 'Schema', icon: <FileText className="h-4 w-4" /> },
    { id: 'cleanup', label: 'Cleanup', icon: <Settings className="h-4 w-4" /> },
    { id: 'history', label: 'History', icon: <History className="h-4 w-4" /> }
  ];

  const renderDataTab = () => (
    <div className="space-y-4">
      <DataGrid
        data={datasetData?.data || []}
        schema={datasetData?.schema || dataset.schema}
        loading={dataLoading}
      />
      {datasetData && (
        <Pagination
          currentPage={currentPage}
          totalPages={datasetData.total_pages || 1}
          onPageChange={(page) => setCurrentPage(Number(page) || 1)}
          showPageSize
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(Number(size) || 50);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );

  const renderSchemaTab = () => {
    // Safely extract columns from schema (handles multiple formats)
    const getSchemaColumns = (): any[] => {
      if (!dataset?.schema) {
        return [];
      }
      
      // If schema is already an array
      if (Array.isArray(dataset.schema)) {
        return dataset.schema;
      }
      
      // If schema is an object with 'columns' property
      if (typeof dataset.schema === 'object' && dataset.schema !== null && 'columns' in dataset.schema) {
        const schemaWithColumns = dataset.schema as { columns: any[] };
        if (Array.isArray(schemaWithColumns.columns)) {
          // Check if columns are strings or objects
          return schemaWithColumns.columns.map((col: any, index: number) => {
            if (typeof col === 'string') {
              return { name: col, type: 'unknown', index };
            }
            return { ...col, index };
          });
        }
      }
      
      return [];
    };

    const schemaColumns = getSchemaColumns();

    if (schemaColumns.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No schema information available
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <div className="block sm:hidden space-y-4">
          {/* Mobile card layout */}
          {schemaColumns.map((column, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {typeof column === 'string' ? column : column.name || column}
                  </h4>
                  <Badge variant="info" size="sm">
                    {typeof column === 'object' && column.type ? column.type : 'text'}
                  </Badge>
                </div>
                {typeof column === 'object' && column.confidence && (
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Confidence: {Math.round(column.confidence * 100)}%</div>
                    <div>Nulls: {column.null_count || 0}</div>
                  </div>
                )}
                {typeof column === 'object' && column.sample_values && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Samples: </span>
                    <span className="truncate">
                      {column.sample_values.slice(0, 3).join(', ')}
                      {column.sample_values.length > 3 && '...'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
        <table className="hidden sm:table min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Column Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nulls
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sample Values
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schemaColumns.map((column: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {typeof column === 'string' ? column : column.name || column}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <Badge variant="info" size="sm">
                    {typeof column === 'object' && column.type ? column.type : 'text'}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {typeof column === 'object' && column.confidence ? 
                    `${Math.round(column.confidence * 100)}%` : 'N/A'
                  }
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {typeof column === 'object' && column.null_count !== undefined ? 
                    column.null_count : 'N/A'
                  }
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <div className="max-w-xs truncate">
                    {typeof column === 'object' && column.sample_values ? (
                      <>
                        {column.sample_values.slice(0, 3).join(', ')}
                        {column.sample_values.length > 3 && '...'}
                      </>
                    ) : 'N/A'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCleanupTab = () => {
    // Safely extract columns for cleanup panel
    const getColumnsForCleanup = () => {
      if (!dataset?.schema) {
        return [];
      }
      
      // If schema is already an array
      if (Array.isArray(dataset.schema)) {
        return dataset.schema;
      }
      
      // If schema is an object with 'columns' property
      if (typeof dataset.schema === 'object' && dataset.schema !== null && 'columns' in dataset.schema) {
        const schemaWithColumns = dataset.schema as { columns: any[] };
        if (Array.isArray(schemaWithColumns.columns)) {
          return schemaWithColumns.columns;
        }
      }
      
      return [];
    };

    return (
      <CleanupPanel 
        datasetId={dataset.id}
        columns={getColumnsForCleanup()}
        onCleanupComplete={() => {
          // Refetch dataset data
          queryClient.invalidateQueries({ queryKey: ['dataset', dataset.id] });
          queryClient.invalidateQueries({ queryKey: ['dataset-data', dataset.id] });
          queryClient.invalidateQueries({ queryKey: ['dataset-versions', dataset.id] });
        }}
      />
    );
  };

  const renderHistoryTab = () => (
    <div className="space-y-4">
      {versionsLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-3">
          {versions?.map((version) => (
            <Card key={version.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info" size="sm">
                      Version {version.version_number}
                    </Badge>
                    {version.version_number === dataset.version && (
                      <Badge variant="success" size="sm">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {version.change_description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                  </p>
                </div>
                {version.version_number !== dataset.version && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRevert(version.version_number)}
                    disabled={revertMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {revertMutation.isPending ? 'Reverting...' : 'Revert'}
                  </Button>
                )}
              </div>
            </Card>
          )) || (
            <div className="text-center py-8 text-gray-500">
              No version history available
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'data':
        return renderDataTab();
      case 'schema':
        return renderSchemaTab();
      case 'cleanup':
        return renderCleanupTab();
      case 'history':
        return renderHistoryTab();
      default:
        return renderDataTab();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={dataset.name}
        subtitle={`${dataset.row_count.toLocaleString()} rows • ${dataset.column_count} columns • Last updated: ${formatDistanceToNow(new Date(dataset.updated_at), { addSuffix: true })}`}
        breadcrumb={
          <Button
            variant="ghost"
            onClick={() => navigate('/datasets')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Datasets
          </Button>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Badge variant="info" className="text-center">Version {dataset.version}</Badge>
            <Button variant="outline" className="w-full sm:w-auto">Export</Button>
            <Button onClick={() => navigate(`/bulk/${dataset.id}`)} className="w-full sm:w-auto">Bulk Operations</Button>
          </div>
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

export default DatasetDetailPage;