import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Condition, ConditionOperator } from '../../types/bulk';
import { ColumnSchema } from '../../types/dataset';

interface ConditionRowProps {
  condition: Condition;
  columns: ColumnSchema[];
  onUpdate: (condition: Condition) => void;
  onDelete: () => void;
  showDelete: boolean;
}

const operators: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'greater_than_or_equal', label: 'Greater Than or Equal' },
  { value: 'less_than_or_equal', label: 'Less Than or Equal' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'between', label: 'Between' },
  { value: 'in_list', label: 'In List' },
];

export const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  columns,
  onUpdate,
  onDelete,
  showDelete,
}) => {
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
  const needsSecondValue = condition.operator === 'between';

  // const columnOptions = columns.map(col => ({ value: col.name, label: col.name }));

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
      <select
        value={condition.column}
        onChange={(e) => onUpdate({ ...condition, column: e.target.value })}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select column...</option>
        {columns.map((col) => (
          <option key={col.name} value={col.name}>
            {col.name}
          </option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => onUpdate({ ...condition, operator: e.target.value as ConditionOperator })}
        className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {needsValue && (
        <Input
          value={condition.value?.toString() || ''}
          onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
          placeholder="Value"
          className="flex-1"
        />
      )}

      {needsSecondValue && (
        <Input
          value={condition.value2?.toString() || ''}
          onChange={(e) => onUpdate({ ...condition, value2: e.target.value })}
          placeholder="Second value"
          className="flex-1"
        />
      )}

      {showDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};