import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { PreviewResult } from '../../types/bulk';

interface PreviewResultsProps {
  result: PreviewResult;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
}

export const PreviewResults: React.FC<PreviewResultsProps> = ({
  result,
  onConfirm,
  onCancel,
  isExecuting = false,
}) => {
  // Use the correct field names from backend
  const affectedCount = result?.affected_count ?? 0;
  const totalRows = result?.total_rows ?? 0;
  const previewRows = result?.preview_rows ?? [];

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {affectedCount > 0 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          <h3 className="text-lg font-semibold">
            {affectedCount} of {totalRows} rows will be affected
          </h3>
        </div>

        {affectedCount === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No rows match the specified conditions.
          </div>
        ) : (
          <div className="space-y-4">
            {previewRows.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sample matching rows:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {previewRows[0] && Object.keys(previewRows[0]).map((column) => (
                          <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewRows.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 text-sm text-gray-900">
                              {String(value || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewRows.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ... and {previewRows.length - 5} more matching rows
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={isExecuting}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isExecuting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md disabled:opacity-50"
              >
                {isExecuting ? 'Executing...' : 'Execute Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};