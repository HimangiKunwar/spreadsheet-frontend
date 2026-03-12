import React from 'react';
import { CleanupOperationType } from '../../../types/cleanup';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

interface OperationOptionsProps {
  operation: CleanupOperationType;
  options: Record<string, any>;
  onChange: (options: Record<string, any>) => void;
}

const OperationOptions: React.FC<OperationOptionsProps> = ({
  operation,
  options,
  onChange
}) => {
  const updateOption = (key: string, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const renderOptions = () => {
    switch (operation) {
      case 'fill_empty_with_value':
        return (
          <Input
            label="Fill Value"
            value={options.value || ''}
            onChange={(e) => updateOption('value', e.target.value)}
            placeholder="Enter value to fill empty cells"
          />
        );

      case 'round_numbers':
        return (
          <Input
            label="Decimal Places"
            type="number"
            value={options.decimals || 2}
            onChange={(e) => updateOption('decimals', parseInt(e.target.value))}
            min={0}
            max={10}
          />
        );

      case 'standardize_dates':
        return (
          <Select
            label="Date Format"
            value={options.date_format || '%Y-%m-%d'}
            onChange={(value) => updateOption('date_format', value)}
            options={[
              { value: '%Y-%m-%d', label: 'YYYY-MM-DD' },
              { value: '%m/%d/%Y', label: 'MM/DD/YYYY' },
              { value: '%d/%m/%Y', label: 'DD/MM/YYYY' },
              { value: '%Y-%m-%d %H:%M:%S', label: 'YYYY-MM-DD HH:MM:SS' }
            ]}
          />
        );

      case 'remove_duplicates':
        return (
          <Select
            label="Keep"
            value={options.keep || 'first'}
            onChange={(value) => updateOption('keep', value)}
            options={[
              { value: 'first', label: 'First occurrence' },
              { value: 'last', label: 'Last occurrence' }
            ]}
          />
        );

      case 'split_column':
        return (
          <Input
            label="Delimiter"
            value={options.delimiter || ','}
            onChange={(e) => updateOption('delimiter', e.target.value)}
            placeholder="Enter delimiter (e.g., comma, space)"
          />
        );

      case 'merge_columns':
        return (
          <div className="space-y-3">
            <Input
              label="Separator"
              value={options.separator || ' '}
              onChange={(e) => updateOption('separator', e.target.value)}
              placeholder="Enter separator between values"
            />
            <Input
              label="New Column Name"
              value={options.new_column || 'merged_column'}
              onChange={(e) => updateOption('new_column', e.target.value)}
              placeholder="Name for the merged column"
            />
          </div>
        );

      case 'remove_special_chars':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="keep_spaces"
              checked={options.keep_spaces !== false}
              onChange={(e) => updateOption('keep_spaces', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="keep_spaces" className="text-sm text-gray-700">
              Keep spaces
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  const hasOptions = [
    'fill_empty_with_value',
    'round_numbers',
    'standardize_dates',
    'remove_duplicates',
    'split_column',
    'merge_columns',
    'remove_special_chars'
  ].includes(operation);

  if (!hasOptions) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Options</h3>
      {renderOptions()}
    </div>
  );
};

export default OperationOptions;