import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConditionRow } from './ConditionRow';
import { ActionSelector } from './ActionSelector';
import { BulkRule, Condition, Action } from '../../types/bulk';
import { ColumnSchema } from '../../types/dataset';

interface RuleBuilderProps {
  rule: BulkRule;
  columns: ColumnSchema[];
  onUpdate: (rule: BulkRule) => void;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  rule,
  columns,
  onUpdate,
}) => {
  const addCondition = () => {
    const newCondition: Condition = {
      column: '',
      operator: 'equals',
      value: '',
    };
    onUpdate({
      ...rule,
      conditions: [...rule.conditions, newCondition],
    });
  };

  const updateCondition = (index: number, condition: Condition) => {
    const newConditions = [...rule.conditions];
    newConditions[index] = condition;
    onUpdate({ ...rule, conditions: newConditions });
  };

  const deleteCondition = (index: number) => {
    const newConditions = rule.conditions.filter((_, i) => i !== index);
    onUpdate({ ...rule, conditions: newConditions });
  };

  const updateAction = (action: Action) => {
    onUpdate({ ...rule, action });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">IF (Conditions)</h3>
          {rule.conditions.length > 1 && (
            <select
              value={rule.condition_logic}
              onChange={(e) => onUpdate({ ...rule, condition_logic: e.target.value as 'AND' | 'OR' })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          )}
        </div>

        <div className="space-y-3">
          {rule.conditions.map((condition, index) => (
            <div key={index} className="space-y-2">
              <ConditionRow
                condition={condition}
                columns={columns}
                onUpdate={(updated) => updateCondition(index, updated)}
                onDelete={() => deleteCondition(index)}
                showDelete={rule.conditions.length > 1}
              />
              {index < rule.conditions.length - 1 && (
                <div className="text-center">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                    {rule.condition_logic}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addCondition}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Condition
        </Button>
      </div>

      <ActionSelector
        action={rule.action}
        columns={columns}
        onUpdate={updateAction}
      />
    </div>
  );
};