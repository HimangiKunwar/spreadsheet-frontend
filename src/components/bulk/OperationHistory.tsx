import React from 'react';
import { Undo2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BulkOperation } from '../../types/bulk';

interface OperationHistoryProps {
  operations: BulkOperation[];
  onUndo: (operationId: string) => void;
  isUndoing?: boolean;
}

export const OperationHistory: React.FC<OperationHistoryProps> = ({
  operations,
  onUndo,
  isUndoing = false,
}) => {
  const formatRuleSummary = (operation: BulkOperation) => {
    const { rule_config } = operation;
    const conditionsText = rule_config.conditions
      .map(c => `${c.column} ${c.operator} ${c.value}`)
      .join(` ${rule_config.condition_logic} `);
    const actionText = `${rule_config.action.type} ${rule_config.action.column}`;
    return `IF ${conditionsText} THEN ${actionText}`;
  };

  if (operations.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          <Clock className="mx-auto h-12 w-12 mb-4" />
          <p>No operations history</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {operations.map((operation) => (
        <Card key={operation.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(operation.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-gray-900 mb-2">
                {formatRuleSummary(operation)}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Affected {operation.affected_rows} rows</span>
                {!operation.is_undone && (
                  <span className="text-green-600">• Can be undone</span>
                )}
                {operation.is_undone && (
                  <span className="text-gray-500">• Already undone</span>
                )}
              </div>
            </div>

            {!operation.is_undone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUndo(operation.id)}
                leftIcon={<Undo2 className="h-4 w-4" />}
                loading={isUndoing}
              >
                Undo
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};