import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';
import { reconciliationApi } from '../../api/reconciliation';

interface ReportFormData {
  name: string;
  description: string;
  reconciliation_id: string;
  configuration: {
    title: string;
    sections: Array<{
      type: 'summary' | 'chart' | 'table';
      chart_type?: 'bar' | 'pie' | 'line';
      columns?: string[];
    }>;
  };
}

export default function ReportCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ReportFormData>({
    name: '',
    description: '',
    reconciliation_id: '',
    configuration: {
      title: '',
      sections: [{ type: 'summary' }]
    }
  });

  const { data: reconciliations, isLoading: reconciliationsLoading } = useQuery({
    queryKey: ['reconciliations', 'completed'],
    queryFn: () => reconciliationApi.list('completed'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('=== FRONTEND CREATE DEBUG ===');
      console.log('Form data being sent:', JSON.stringify(data, null, 2));
      console.log('Reconciliation field:', data.reconciliation_id);
      console.log('Reconciliation type:', typeof data.reconciliation_id);
      return reportsApi.create(data);
    },
    onSuccess: (response) => {
      console.log('Success response:', response);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      navigate('/reports');
    },
    onError: (error: any) => {
      console.error('Failed to create report:', error);
      console.error('Error response data:', error.response?.data);
      alert(error.response?.data?.detail || error.response?.data?.message || JSON.stringify(error.response?.data) || 'Failed to create report');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a report name');
      return;
    }
    
    if (!formData.reconciliation_id) {
      alert('Please select a reconciliation');
      return;
    }
    
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        configuration: { ...prev.configuration, title: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const availableReconciliations = reconciliations?.results || [];
  
  // Debug logging
  console.log('Available reconciliations:', availableReconciliations);
  console.log('Current reconciliation_id:', formData.reconciliation_id);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          to="/reports" 
          className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
        >
          ← Back to Reports
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Report</h1>
        <p className="text-gray-600 mt-1">
          Generate a report from your dataset
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Report Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Monthly Data Report"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Optional description for this report"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Report Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.configuration.title}
            onChange={handleChange}
            placeholder="Title that appears in the report"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="reconciliation" className="block text-sm font-medium text-gray-700 mb-1">
            Select Reconciliation *
          </label>
          {reconciliationsLoading ? (
            <div className="text-gray-500">Loading reconciliations...</div>
          ) : availableReconciliations.length === 0 ? (
            <div className="text-amber-600 bg-amber-50 p-3 rounded-md">
              No completed reconciliations available. 
              <Link to="/reconciliation/new" className="text-blue-600 ml-1 hover:underline">
                Create one first
              </Link>
            </div>
          ) : (
            <select
              id="reconciliation"
              name="reconciliation_id"
              value={formData.reconciliation_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select a reconciliation --</option>
              {availableReconciliations.map((reconciliation: any) => (
                <option key={reconciliation.id} value={reconciliation.id}>
                  {reconciliation.name} ({reconciliation.summary?.match_count || 0} matches)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            to="/reports"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending || !formData.reconciliation_id}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Report'}
          </button>
        </div>
      </form>
    </div>
  );
}