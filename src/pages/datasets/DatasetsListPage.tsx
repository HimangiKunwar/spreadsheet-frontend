import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Database, Calendar, HardDrive, Zap, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { datasetsApi } from '../../api/datasets';
import { Dataset } from '../../types/dataset';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const DatasetsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => datasetsApi.delete(id),
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      toast.success('Dataset deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete dataset');
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });

  const handleDelete = (dataset: Dataset) => {
    const confirmMessage = `Delete "${dataset.name}"?\n\nThis will permanently remove the dataset and all its versions. This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      deleteMutation.mutate(dataset.id);
    }
  };

  const datasets = data?.results || [];
  const totalCount = data?.count || 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load datasets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Datasets</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your uploaded data files {totalCount > 0 && `(${totalCount} total)`}
          </p>
        </div>
        <Link to="/datasets/upload">
          <Button leftIcon={<Plus className="h-4 w-4" />} className="w-full sm:w-auto">
            Upload Dataset
          </Button>
        </Link>
      </div>

      {datasets && datasets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No datasets</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first dataset.
            </p>
            <div className="mt-6">
              <Link to="/datasets/upload">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Upload Dataset
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {datasets.map((dataset: Dataset) => (
            <Card key={dataset.id} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                      {dataset.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {dataset.original_filename}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 flex-shrink-0">
                    {dataset.file_type.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate">{dataset.row_count.toLocaleString()} rows</span>
                  </div>
                  <div className="flex items-center">
                    <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate">{formatFileSize(dataset.file_size)}</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate">{formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link to={`/datasets/${dataset.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-10">
                      View
                    </Button>
                  </Link>
                  <div className="flex space-x-2">
                    <Link to={`/bulk/${dataset.id}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" size="sm" title="Bulk Operations" className="w-full sm:w-auto h-10">
                        <Zap className="h-4 w-4" />
                        <span className="ml-2 sm:hidden">Bulk Ops</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(dataset);
                      }}
                      disabled={deletingId === dataset.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-3"
                      title="Delete dataset"
                    >
                      {deletingId === dataset.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetsListPage;