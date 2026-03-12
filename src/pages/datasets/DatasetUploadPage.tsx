import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUploader } from '../../components/datasets/FileUploader';
import { datasetsApi } from '../../api/datasets';
import { Dataset } from '../../types/dataset';
import { getSchemaColumns } from '../../utils/schemaHelpers';
import toast from 'react-hot-toast';

const DatasetUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedDataset, setUploadedDataset] = useState<Dataset | null>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) => 
      datasetsApi.upload(file, name),
    onSuccess: (dataset) => {
      setUploadedDataset(dataset);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success('Dataset uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Upload failed');
    },
  });

  const handleFileSelect = (file: File, name?: string) => {
    uploadMutation.mutate({ file, name });
  };

  if (uploadedDataset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/datasets')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Datasets
          </Button>
        </div>

        <Card>
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              File uploaded successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your dataset has been processed and is ready to use.
            </p>
          </div>
        </Card>

        <Card title={`Detected Schema (${uploadedDataset.column_count} columns, ${uploadedDataset.row_count.toLocaleString()} rows)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Column
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nulls
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSchemaColumns(uploadedDataset.schema).map((column, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {column.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {column.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.round(column.confidence * 100)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.null_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setUploadedDataset(null)}>
            Upload Another
          </Button>
          <Button onClick={() => navigate(`/datasets/${uploadedDataset.id}`)}>
            View Dataset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/datasets')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Datasets
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Dataset</h1>
        <p className="text-gray-600">Upload a file to create a new dataset</p>
      </div>

      <Card>
        <FileUploader
          onFileSelect={handleFileSelect}
          loading={uploadMutation.isPending}
        />
      </Card>
    </div>
  );
};

export default DatasetUploadPage;