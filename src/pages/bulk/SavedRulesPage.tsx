import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { useSavedRules, useDeleteRule } from '../../hooks/useBulkOperations';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { SavedRulesList } from '../../components/bulk';

const SavedRulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useSavedRules();
  const deleteMutation = useDeleteRule();

  const savedRules = data?.results || [];
  const totalCount = data?.count || 0;

  const handleApplyRule = (rule: any) => {
    // Navigate to datasets page to select a dataset
    navigate('/datasets', { 
      state: { 
        message: `Select a dataset to apply rule: ${rule.name}`,
        pendingRule: rule 
      }
    });
  };

  const handleEditRule = (rule: any) => {
    if (rule.dataset_id) {
      // Redirect to dataset-specific bulk operations page with edit mode
      navigate(`/bulk/${rule.dataset_id}?edit=${rule.id}`);
    } else {
      // Rule has no associated dataset
      navigate('/datasets', { 
        state: { 
          message: `Select a dataset to edit rule: ${rule.name}`,
          pendingEditRule: rule 
        }
      });
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      deleteMutation.mutate(ruleId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Operations"
        subtitle={`Manage saved rules and bulk operations${totalCount > 0 ? ` (${totalCount} total)` : ''}`}
        actions={
          <Button
            onClick={() => navigate('/datasets')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create New Rule
          </Button>
        }
      />

      {savedRules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved rules yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first bulk operation rule by selecting a dataset.
          </p>
          <Button
            onClick={() => navigate('/datasets')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Go to Datasets
          </Button>
        </div>
      ) : (
        <SavedRulesList
          rules={savedRules}
          onApply={handleApplyRule}
          onEdit={handleEditRule}
          onDelete={handleDeleteRule}
          isDeleting={deleteMutation.isPending}
          showDatasetInfo={true}
        />
      )}
    </div>
  );
};

export default SavedRulesPage;