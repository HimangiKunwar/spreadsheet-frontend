import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CleanupOperation, CleanupOperationType } from '../../../types/cleanup';

interface OperationSelectorProps {
  operations: Record<string, CleanupOperation>;
  selectedOperation: CleanupOperationType | null;
  onSelect: (operation: CleanupOperationType) => void;
}

const CATEGORY_LABELS = {
  string: 'String Operations',
  null_handling: 'Null Handling',
  numeric: 'Numeric Operations',
  date: 'Date Operations',
  data_quality: 'Data Quality'
};

const OperationSelector: React.FC<OperationSelectorProps> = ({
  operations,
  selectedOperation,
  onSelect
}) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(['string', 'null_handling'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const groupedOperations = Object.entries(operations).reduce((acc, [key, op]) => {
    if (!acc[op.category]) {
      acc[op.category] = [];
    }
    acc[op.category].push({ operationKey: key as CleanupOperationType, ...op });
    return acc;
  }, {} as Record<string, Array<CleanupOperation & { operationKey: CleanupOperationType }>>);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Select Operation</h3>
      
      {Object.entries(groupedOperations).map(([category, ops]) => (
        <div key={category} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
          >
            <span>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span>
            {expandedCategories.has(category) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {expandedCategories.has(category) && (
            <div className="p-2 space-y-1">
              {ops.map((op) => (
                <label
                  key={op.operationKey}
                  className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="radio"
                    name="operation"
                    value={op.operationKey}
                    checked={selectedOperation === op.operationKey}
                    onChange={() => onSelect(op.operationKey)}
                    className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {op.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {op.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OperationSelector;