import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { CleanupPreviewResponse } from '../../../types/cleanup';
import { Spinner } from '../../ui/Spinner';

interface CleanupPreviewProps {
  preview: CleanupPreviewResponse | null;
  loading: boolean;
  error: string | null;
}

const CleanupPreview: React.FC<CleanupPreviewProps> = ({
  preview,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
        <span className="ml-2 text-sm text-gray-600">Generating preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Configure operation and columns to see preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium text-gray-900">
          Preview Results
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <strong>{preview.affected_rows.toLocaleString()}</strong> rows will be affected
        </div>
      </div>

      {preview.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">Warnings:</div>
              <ul className="list-disc list-inside space-y-1">
                {preview.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {preview.sample_changes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Sample Changes:
          </h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="space-y-2 text-sm">
              {preview.sample_changes.slice(0, 5).map((change, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs">
                    Row {change.row_index + 1}:
                  </span>
                  <span className="font-medium text-gray-700">
                    {change.column}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-red-600 line-through">
                    "{String(change.before)}"
                  </span>
                  <span className="text-green-600">
                    "{String(change.after)}"
                  </span>
                </div>
              ))}
              {preview.sample_changes.length > 5 && (
                <div className="text-xs text-gray-500 pt-1">
                  ... and {preview.sample_changes.length - 5} more changes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {preview.affected_rows === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No changes will be made with current settings
        </div>
      )}
    </div>
  );
};

export default CleanupPreview;