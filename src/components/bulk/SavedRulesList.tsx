import React, { useState } from 'react';
import { Play, Edit, Trash2, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SavedRule } from '../../types/bulk';
import { bulkApi } from '../../api/bulkOperations';
import toast from 'react-hot-toast';

interface SavedRulesListProps {
  rules: SavedRule[];
  datasetId?: string;
  onApply?: (rule: SavedRule) => void;  // For loading into builder (old behavior)
  onEdit: (rule: SavedRule) => void;
  onDelete: (ruleId: string) => void;
  onRuleExecuted?: () => void;  // Callback after successful execution
  isDeleting?: boolean;
  showDatasetInfo?: boolean;
}

export const SavedRulesList: React.FC<SavedRulesListProps> = ({
  rules,
  datasetId,
  onApply,
  onEdit,
  onDelete,
  onRuleExecuted,
  isDeleting = false,
  showDatasetInfo = false,
}) => {
  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null);
  
  // Defensive check - ensure rules is always an array
  const safeRules = Array.isArray(rules) ? rules : [];
  
  const formatRuleSummary = (rule: SavedRule) => {
    const { configuration: bulkRule } = rule;
    const conditionsCount = bulkRule.conditions.length;
    const actionType = bulkRule.action.type.replace('_', ' ');
    return `${conditionsCount} condition${conditionsCount > 1 ? 's' : ''} → ${actionType}`;
  };

  const handleExecuteRule = async (rule: SavedRule) => {
    if (!datasetId) {
      toast.error('No dataset selected');
      return;
    }
    
    setExecutingRuleId(rule.id);
    
    try {
      const response = await bulkApi.applySavedRule(rule.id, datasetId);
      toast.success(`${response.message}! ${response.rows_affected} rows affected`);
      
      if (onRuleExecuted) {
        onRuleExecuted();
      }
    } catch (error: any) {
      console.error('Failed to execute rule:', error);
      toast.error(error.response?.data?.error || 'Failed to execute rule');
    } finally {
      setExecutingRuleId(null);
    }
  };

  if (safeRules.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="mx-auto h-12 w-12 mb-4" />
          <p>No saved rules yet</p>
          <p className="text-sm mt-2">Create a rule and save it for reuse</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {safeRules.map((rule) => (
        <Card key={rule.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {rule.name}
              </h3>
              
              {rule.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {rule.description}
                </p>
              )}
              
              <p className="text-sm text-gray-500 mb-2">
                {formatRuleSummary(rule)}
              </p>
              
              {showDatasetInfo && rule.dataset_name && (
                <p className="text-xs text-gray-400 mb-1">
                  Dataset: {rule.dataset_name}
                </p>
              )}
              
              <p className="text-xs text-gray-400">
                Created {formatDistanceToNow(new Date(rule.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Execute Rule Button - Only show if datasetId is provided */}
              {datasetId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExecuteRule(rule)}
                  loading={executingRuleId === rule.id}
                  leftIcon={<Play className="h-4 w-4" />}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Apply
                </Button>
              )}
              
              {/* Load into Builder Button - Only show if onApply is provided */}
              {onApply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApply(rule)}
                  leftIcon={<Edit className="h-4 w-4" />}
                >
                  Load
                </Button>
              )}
              
              {/* Edit Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(rule)}
                title="Edit rule"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(rule.id)}
                loading={isDeleting}
                className="text-red-600 hover:text-red-700"
                title="Delete rule"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};