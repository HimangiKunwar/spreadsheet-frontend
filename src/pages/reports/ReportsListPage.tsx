import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useReports, useDeleteReport, useDownloadReport } from '../../hooks/useReports';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const ReportsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useReports();
  const deleteMutation = useDeleteReport();
  const downloadMutation = useDownloadReport();

  const reports = data?.results || [];
  const totalCount = data?.count || 0;

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'default' as const,
      generating: 'warning' as const,
      completed: 'success' as const,
      failed: 'error' as const
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (id: string, format: 'pdf' | 'xlsx') => {
    downloadMutation.mutate({ id, format });
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
        title="Reports"
        subtitle={`Create and manage automated reports with charts and summaries${totalCount > 0 ? ` (${totalCount} total)` : ''}`}
        actions={
          <Button
            onClick={() => navigate('/reports/new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Report
          </Button>
        }
      />

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first report to generate automated summaries and visualizations.
              </p>
              <Button
                onClick={() => navigate('/reports/new')}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Report
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {report.name}
                      </h3>
                      {report.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {report.description}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    {report.reconciliation ? (
                      <>
                        <p className="truncate">
                          <span className="font-medium">Source:</span> {report.source_dataset_name || 'Not available'}
                        </p>
                        <p className="truncate">
                          <span className="font-medium">Target:</span> {report.target_dataset_name || 'Not available'}
                        </p>
                        <p className="truncate">
                          <span className="font-medium">Reconciliation:</span> {report.reconciliation_name}
                        </p>
                      </>
                    ) : (
                      <p className="truncate">
                        <span className="font-medium">Dataset:</span> {report.dataset_name || 'No dataset selected'}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Sections:</span> {report.configuration.sections.length}
                    </p>
                    {report.is_template && (
                      <Badge variant="info" size="sm">Template</Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    <p>Created {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</p>
                    {report.generated_at && (
                      <p>Generated {formatDistanceToNow(new Date(report.generated_at), { addSuffix: true })}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {report.status === 'completed' && (
                        <>
                          {report.pdf_path && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(report.id, 'pdf')}
                              leftIcon={<Download className="h-3 w-3" />}
                              loading={downloadMutation.isPending}
                              className="text-xs"
                            >
                              PDF
                            </Button>
                          )}
                          {report.xlsx_path && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(report.id, 'xlsx')}
                              leftIcon={<Download className="h-3 w-3" />}
                              loading={downloadMutation.isPending}
                              className="text-xs"
                            >
                              Excel
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/reports/${report.id}`)}
                        title="View report"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/reports/${report.id}/edit`)}
                        title="Edit report"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                        loading={deleteMutation.isPending}
                        title="Delete report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsListPage;