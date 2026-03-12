import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ColumnSchema } from '../../types/dataset';
import { CleanupOperationType, CleanupRequest, CleanupPreviewResponse } from '../../types/cleanup';
import { cleanupApi } from '../../api/cleanup';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import OperationSelector from './cleanup/OperationSelector';
import ColumnSelector from './cleanup/ColumnSelector';
import OperationOptions from './cleanup/OperationOptions';
import CleanupPreview from './cleanup/CleanupPreview';

interface CleanupPanelProps {
  datasetId: string;
  columns: ColumnSchema[];
  onCleanupComplete: () => void;
}

const CleanupPanel: React.FC<CleanupPanelProps> = ({
  datasetId,
  columns,
  onCleanupComplete
}) => {
  const queryClient = useQueryClient();
  const [selectedOperation, setSelectedOperation] = useState<CleanupOperationType | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [options, setOptions] = useState<Record<string, any>>({});
  const [preview, setPreview] = useState<CleanupPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Get available operations
  const { data: operations = {} } = useQuery({
    queryKey: ['cleanup-operations'],
    queryFn: cleanupApi.getOperations
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (request: CleanupRequest) => cleanupApi.preview(datasetId, request),
    onSuccess: (data) => {
      setPreview(data);
      setPreviewError(null);
    },
    onError: (error: any) => {
      setPreview(null);
      setPreviewError(error.response?.data?.error || 'Failed to generate preview');
    }
  });

  // Apply cleanup mutation
  const applyMutation = useMutation({
    mutationFn: (request: CleanupRequest) => cleanupApi.apply(datasetId, request),
    onSuccess: (data) => {
      toast.success(data.message);
      onCleanupComplete();
      // Reset form
      setSelectedOperation(null);
      setSelectedColumns([]);
      setOptions({});
      setPreview(null);
      setPreviewError(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to apply cleanup');
    }
  });

  // Reset selections when operation changes
  useEffect(() => {
    if (selectedOperation) {
      setSelectedColumns([]);
      setOptions({});
      setPreview(null);
      setPreviewError(null);
    }
  }, [selectedOperation]);

  // Generate preview when configuration changes
  useEffect(() => {
    if (selectedOperation && selectedColumns.length > 0) {
      const request: CleanupRequest = {
        operation: selectedOperation,
        columns: selectedColumns,
        options
      };
      
      // Debounce preview generation
      const timer = setTimeout(() => {
        previewMutation.mutate(request);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setPreview(null);
      setPreviewError(null);
    }
  }, [selectedOperation, selectedColumns, options]);

  const handleApplyCleanup = () => {
    if (!selectedOperation || selectedColumns.length === 0) {
      toast.error('Please select an operation and columns');
      return;
    }

    if (preview && preview.affected_rows === 0) {
      toast.error('No changes will be made with current settings');
      return;
    }

    const request: CleanupRequest = {
      operation: selectedOperation,
      columns: selectedColumns,
      options
    };

    applyMutation.mutate(request);
  };

  const selectedOperationData = selectedOperation ? operations[selectedOperation] : undefined;
  const canApply = selectedOperation && selectedColumns.length > 0 && preview && preview.affected_rows > 0;

  return (
    <div className="space-y-6">
      <Card title="Data Cleanup Operations">
        <p className="text-gray-600 mb-6">
          Apply cleanup operations to improve data quality. Each operation creates a new version.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Operation Selection */}
          <div className="space-y-6">
            <OperationSelector
              operations={operations}
              selectedOperation={selectedOperation}
              onSelect={setSelectedOperation}
            />
          </div>

          {/* Right Column - Configuration */}
          <div className="space-y-6">
            <ColumnSelector
              columns={columns}
              selectedColumns={selectedColumns}
              onSelectionChange={setSelectedColumns}
              operation={selectedOperationData}
            />

            {selectedOperation && (
              <OperationOptions
                operation={selectedOperation}
                options={options}
                onChange={setOptions}
              />
            )}

            <div className="border-t pt-4">
              <CleanupPreview
                preview={preview}
                loading={previewMutation.isPending}
                error={previewError}
              />
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                onClick={() => {
                  if (selectedOperation && selectedColumns.length > 0) {
                    const request: CleanupRequest = {
                      operation: selectedOperation,
                      columns: selectedColumns,
                      options
                    };
                    previewMutation.mutate(request);
                  }
                }}
                variant="outline"
                disabled={!selectedOperation || selectedColumns.length === 0 || previewMutation.isPending}
              >
                {previewMutation.isPending ? 'Generating...' : 'Preview'}
              </Button>
              
              <Button
                onClick={handleApplyCleanup}
                disabled={!canApply || applyMutation.isPending}
              >
                {applyMutation.isPending ? 'Applying...' : 'Apply Cleanup'}
              </Button>
            </div>

            {canApply && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                💡 This will create version {(queryClient.getQueryData(['dataset', datasetId]) as any)?.version + 1 || '?'}. 
                You can revert changes from the History tab.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CleanupPanel;