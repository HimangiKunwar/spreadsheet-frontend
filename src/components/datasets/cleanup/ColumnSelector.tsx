import React from 'react';
import { ColumnSchema } from '../../../types/dataset';
import { CleanupOperation } from '../../../types/cleanup';
import { Badge } from '../../ui/Badge';

interface ColumnSelectorProps {
  columns: ColumnSchema[];
  selectedColumns: string[];
  onSelectionChange: (columns: string[]) => void;
  operation?: CleanupOperation;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onSelectionChange,
  operation
}) => {
  const filteredColumns = React.useMemo(() => {
    if (!operation || !operation.column_types.length) {
      return columns;
    }
    
    return columns.filter(col => 
      operation.column_types.includes('any') || 
      operation.column_types.includes(col.type)
    );
  }, [columns, operation]);

  const handleSelectAll = () => {
    onSelectionChange(filteredColumns.map(col => col.name));
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const handleColumnToggle = (columnName: string) => {
    if (selectedColumns.includes(columnName)) {
      onSelectionChange(selectedColumns.filter(name => name !== columnName));
    } else {
      onSelectionChange([...selectedColumns, columnName]);
    }
  };

  if (!operation) {
    return (
      <div className="text-sm text-gray-500">
        Select an operation first
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Select Columns</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            onClick={handleSelectNone}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            Select None
          </button>
        </div>
      </div>

      {filteredColumns.length === 0 ? (
        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
          No compatible columns found for this operation
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded p-2">
          {filteredColumns.map((column) => (
            <label
              key={column.name}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedColumns.includes(column.name)}
                onChange={() => handleColumnToggle(column.name)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {column.name}
                </span>
                <Badge variant="info" size="sm">
                  {column.type}
                </Badge>
              </div>
            </label>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        {selectedColumns.length} of {filteredColumns.length} columns selected
      </div>
    </div>
  );
};

export default ColumnSelector;