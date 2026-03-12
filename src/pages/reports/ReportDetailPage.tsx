import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsApi.get(id!),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: (format: 'pdf' | 'xlsx') => reportsApi.generate(id!, format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: (error: any) => {
      console.error('Failed to generate report:', error);
      alert(error.response?.data?.detail || 'Failed to generate report');
    },
  });

  const handleDownload = async (format: 'pdf' | 'xlsx') => {
    try {
      const blob = await reportsApi.download(id!, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert(err.response?.data?.error || 'Failed to download report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load report</div>
        <Link to="/reports" className="text-blue-600 hover:underline">
          ← Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          to="/reports" 
          className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
        >
          ← Back to Reports
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
            <p className="text-gray-600 mt-1">{report.description || 'No description'}</p>
          </div>
          <div className="flex gap-2">
            {report.status === 'completed' && (
              <>
                <button
                  onClick={() => handleDownload('pdf')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleDownload('xlsx')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download Excel
                </button>
              </>
            )}
            {report.status === 'draft' && (
              <>
                <button
                  onClick={() => generateMutation.mutate('pdf')}
                  disabled={generateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate PDF'}
                </button>
                <button
                  onClick={() => generateMutation.mutate('xlsx')}
                  disabled={generateMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate Excel'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Report Details</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Status</dt>
            <dd className="text-gray-900 capitalize">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                report.status === 'completed' ? 'bg-green-100 text-green-800' :
                report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {report.status}
              </span>
            </dd>
          </div>
          {report.reconciliation ? (
            <>
              <div>
                <dt className="text-sm text-gray-500">Source Dataset</dt>
                <dd className="text-gray-900">{report.source_dataset_name || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Target Dataset</dt>
                <dd className="text-gray-900">{report.target_dataset_name || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Reconciliation</dt>
                <dd className="text-gray-900">{report.reconciliation_name}</dd>
              </div>
            </>
          ) : (
            <div>
              <dt className="text-sm text-gray-500">Dataset</dt>
              <dd className="text-gray-900">{report.dataset_name || 'No dataset selected'}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-gray-500">Created</dt>
            <dd className="text-gray-900">
              {new Date(report.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Last Updated</dt>
            <dd className="text-gray-900">
              {new Date(report.updated_at).toLocaleString()}
            </dd>
          </div>
        </dl>

        {report.error_message && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{report.error_message}</p>
          </div>
        )}
      </div>
    </div>
  );
}