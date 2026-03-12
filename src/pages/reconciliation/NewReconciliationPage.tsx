import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { datasetsApi } from '../../api/datasets';
import { reconciliationApi } from '../../api/reconciliation';
import { CreateReconciliationRequest } from '../../types/reconciliation';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getSchemaColumnNames } from '../../utils/schemaHelpers';
import toast from 'react-hot-toast';

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

const NewReconciliationPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [sourceDatasetId, setSourceDatasetId] = useState('');
  const [targetDatasetId, setTargetDatasetId] = useState('');
  const [keyMappings, setKeyMappings] = useState<ColumnMapping[]>([
    { sourceColumn: '', targetColumn: '' }
  ]);
  const [compareMappings, setCompareMappings] = useState<ColumnMapping[]>([]);
  const [fuzzyMatch, setFuzzyMatch] = useState(false);
  const [fuzzyThreshold, setFuzzyThreshold] = useState(0.8);

  // Fetch available datasets
  const { data: datasetsData, isLoading: loadingDatasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetsApi.list,
  });

  const datasets = datasetsData?.results || [];

  // Fetch source dataset schema
  const { data: sourceDataset } = useQuery({
    queryKey: ['dataset', sourceDatasetId],
    queryFn: () => datasetsApi.get(sourceDatasetId),
    enabled: !!sourceDatasetId,
  });

  // Fetch target dataset schema
  const { data: targetDataset } = useQuery({
    queryKey: ['dataset', targetDatasetId],
    queryFn: () => datasetsApi.get(targetDatasetId),
    enabled: !!targetDatasetId,
  });

  const sourceColumns = getSchemaColumnNames(sourceDataset?.schema);
  const targetColumns = getSchemaColumnNames(targetDataset?.schema);

  // Create reconciliation mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateReconciliationRequest) => reconciliationApi.create(data),
    onSuccess: (result) => {
      toast.success('Reconciliation created successfully');
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      navigate(`/reconciliation/${result.id}`);
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      toast.error(error.response?.data?.error || 'Failed to create reconciliation');
    },
  });

  const handleAddKeyMapping = () => {
    setKeyMappings([...keyMappings, { sourceColumn: '', targetColumn: '' }]);
  };

  const handleRemoveKeyMapping = (index: number) => {
    if (keyMappings.length > 1) {
      setKeyMappings(keyMappings.filter((_, i) => i !== index));
    }
  };

  const handleKeyMappingChange = (index: number, field: 'sourceColumn' | 'targetColumn', value: string) => {
    const updated = [...keyMappings];
    updated[index][field] = value;
    setKeyMappings(updated);
  };

  const handleAddCompareMapping = () => {
    setCompareMappings([...compareMappings, { sourceColumn: '', targetColumn: '' }]);
  };

  const handleRemoveCompareMapping = (index: number) => {
    setCompareMappings(compareMappings.filter((_, i) => i !== index));
  };

  const handleCompareMappingChange = (index: number, field: 'sourceColumn' | 'targetColumn', value: string) => {
    const updated = [...compareMappings];
    updated[index][field] = value;
    setCompareMappings(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceDatasetId || !targetDatasetId) {
      toast.error('Please select both source and target datasets');
      return;
    }

    if (sourceDatasetId === targetDatasetId) {
      toast.error('Source and target datasets must be different');
      return;
    }

    const validKeyMappings = keyMappings.filter(m => m.sourceColumn && m.targetColumn);
    if (validKeyMappings.length === 0) {
      toast.error('Please specify at least one key column mapping');
      return;
    }

    const validCompareMappings = compareMappings.filter(m => m.sourceColumn && m.targetColumn);

    const requestData: CreateReconciliationRequest = {
      name: name || `Reconciliation ${new Date().toLocaleDateString()}`,
      source_dataset: sourceDatasetId,
      target_dataset: targetDatasetId,
      source_key_columns: validKeyMappings.map(m => m.sourceColumn),
      target_key_columns: validKeyMappings.map(m => m.targetColumn),
      compare_columns: validCompareMappings.map(m => m.sourceColumn), // Always send array
      fuzzy_match: fuzzyMatch,
      fuzzy_threshold: Math.round(fuzzyThreshold * 100), // Convert to integer
    };

    console.log('Sending payload:', JSON.stringify(requestData, null, 2));
    createMutation.mutate(requestData);
  };

  if (loadingDatasets) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Reconciliation"
        subtitle="Compare two datasets to identify matches and differences"
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reconciliation Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., January Sales Comparison"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Dataset Selection */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Datasets</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Dataset
                </label>
                <select
                  value={sourceDatasetId}
                  onChange={(e) => setSourceDatasetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select source dataset...</option>
                  {datasets.map((dataset: any) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.row_count?.toLocaleString()} rows)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Dataset
                </label>
                <select
                  value={targetDatasetId}
                  onChange={(e) => setTargetDatasetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select target dataset...</option>
                  {datasets.map((dataset: any) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} ({dataset.row_count?.toLocaleString()} rows)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Column Mappings */}
        {sourceDatasetId && targetDatasetId && (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Key Columns</h2>
                  <p className="text-sm text-gray-500">
                    Columns used to match rows between datasets
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddKeyMapping}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Key
                </Button>
              </div>

              <div className="space-y-3">
                {keyMappings.map((mapping, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <select
                        value={mapping.sourceColumn}
                        onChange={(e) => handleKeyMappingChange(index, 'sourceColumn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Source column...</option>
                        {sourceColumns.map((col: string) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    
                    <span className="text-gray-400 font-mono">↔</span>
                    
                    <div className="flex-1">
                      <select
                        value={mapping.targetColumn}
                        onChange={(e) => handleKeyMappingChange(index, 'targetColumn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Target column...</option>
                        {targetColumns.map((col: string) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {keyMappings.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveKeyMapping(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Compare Columns (Optional) */}
        {sourceDatasetId && targetDatasetId && (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Compare Columns (Optional)</h2>
                  <p className="text-sm text-gray-500">
                    Specific columns to compare values. Leave empty to compare all columns.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCompareMapping}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Column
                </Button>
              </div>

              {compareMappings.length > 0 && (
                <div className="space-y-3">
                  {compareMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <select
                          value={mapping.sourceColumn}
                          onChange={(e) => handleCompareMappingChange(index, 'sourceColumn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Source column...</option>
                          {sourceColumns.map((col: string) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      
                      <span className="text-gray-400 font-mono">↔</span>
                      
                      <div className="flex-1">
                        <select
                          value={mapping.targetColumn}
                          onChange={(e) => handleCompareMappingChange(index, 'targetColumn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Target column...</option>
                          {targetColumns.map((col: string) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCompareMapping(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Advanced Options */}
        {sourceDatasetId && targetDatasetId && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Advanced Options</h2>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="fuzzyMatch"
                  checked={fuzzyMatch}
                  onChange={(e) => setFuzzyMatch(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="fuzzyMatch" className="text-sm font-medium text-gray-700">
                  Enable fuzzy matching
                </label>
              </div>

              {fuzzyMatch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuzzy Match Threshold ({Math.round(fuzzyThreshold * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={fuzzyThreshold}
                    onChange={(e) => setFuzzyThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50% (Loose)</span>
                    <span>100% (Exact)</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/reconciliation')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={!sourceDatasetId || !targetDatasetId}
          >
            Create Reconciliation
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewReconciliationPage;