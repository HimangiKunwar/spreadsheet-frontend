import React from 'react';
import { Input } from '../ui/Input';
import { Action, ActionType } from '../../types/bulk';
import { ColumnSchema } from '../../types/dataset';

interface ActionSelectorProps {
  action: Action;
  columns: ColumnSchema[];
  onUpdate: (action: Action) => void;
}

const actionTypes: { value: ActionType; label: string }[] = [
  { value: 'set_value', label: 'Set Value' },
  { value: 'increment', label: 'Increment' },
  { value: 'decrement', label: 'Decrement' },
  { value: 'concatenate', label: 'Concatenate' },
  { value: 'clear', label: 'Clear' },
  { value: 'copy_from', label: 'Copy From Column' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'trim', label: 'Trim Whitespace' },
];

export const ActionSelector: React.FC<ActionSelectorProps> = ({
  action,
  columns,
  onUpdate,
}) => {
  const needsValue = ['set_value', 'increment', 'decrement', 'concatenate'].includes(action.type);
  const needsSourceColumn = ['copy_from', 'concatenate'].includes(action.type);

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-gray-900">THEN (Action)</h3>
      
      <div className="flex items-center space-x-3">
        <select
          value={action.type}
          onChange={(e) => onUpdate({ ...action, type: e.target.value as ActionType })}
          className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {actionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          value={action.column}
          onChange={(e) => onUpdate({ ...action, column: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select target column...</option>
          {columns.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>

        {needsValue && (
          <Input
            value={action.value?.toString() || ''}
            onChange={(e) => onUpdate({ ...action, value: e.target.value })}
            placeholder="Value"
            className="flex-1"
          />
        )}

        {needsSourceColumn && (
          <select
            value={action.source_column || ''}
            onChange={(e) => onUpdate({ ...action, source_column: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Source column...</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};