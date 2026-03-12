import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, Save, Play } from 'lucide-react';
import { useDataset } from '../../hooks/useDatasets';
import { useSavedRules, useBulkHistory } from '../../hooks/useBulkOperations';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Spinner } from '../../components/ui/Spinner';
import { 
  RuleBuilder, 
  PreviewResults, 
  OperationHistory, 
  SavedRulesList, 
  SaveRuleModal 
} from '../../components/bulk';
import { BulkRule, PreviewResult, SavedRule } from '../../types/bulk';
import { getSchemaColumns } from '../../utils/schemaHelpers';
import { bulkApi } from '../../api/bulkOperations';
import toast from 'react-hot-toast';

const BulkOperationsPage: React.FC = () => {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editRuleId = searchParams.get('edit');
  
  const [activeTab, setActiveTab] = useState('builder');
  const [rule, setRule] = useState<BulkRule>({
    conditions: [{ column: '', operator: 'equals', value: '' }],
    condition_logic: 'AND',
    action: { type: 'set_value', column: '', value: '' }
  });
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRuleName, setEditingRuleName] = useState('');

  const { data: dataset, isLoading: datasetLoading } = useDataset(datasetId!);
  const { data: savedRulesData, refetch: refetchRules } = useSavedRules();
  const { data: historyData, refetch: refetchHistory } = useBulkHistory(datasetId!);

  // Fetch rule to edit if editRuleId is present
  const { data: ruleToEdit } = useQuery({
    queryKey: ['saved-rule', editRuleId],
    queryFn: () => bulkApi.getSavedRule(editRuleId!),
    enabled: Boolean(editRuleId),
  });

  // Auto-populate form when ruleToEdit loads
  useEffect(() => {
    if (ruleToEdit && editRuleId) {
      setIsEditing(true);
      setEditingRuleId(editRuleId);
      setEditingRuleName(ruleToEdit.name);
      setRule(ruleToEdit.configuration);
      setActiveTab('builder');
      
      // Clear the query param after loading
      setSearchParams({});
      
      toast.success(`Editing rule: ${ruleToEdit.name}`);
    }
  }, [ruleToEdit, editRuleId, setSearchParams]);

  const savedRules = savedRulesData?.results || [];
  const history = historyData || [];

  const tabs = [
    { id: 'builder', label: 'Rule Builder', icon: <Play className="h-4 w-4" /> },
    { id: 'saved', label: 'Saved Rules', icon: <Save className="h-4 w-4" /> },
    { id: 'history', label: 'History', icon: <ArrowLeft className="h-4 w-4" /> }
  ];

  const handlePreview = async () => {
    if (!datasetId || !isRuleValid()) return;
    
    setIsPreviewLoading(true);
    try {
      const result = await bulkApi.previewRule(datasetId, rule);
      setPreviewResult(result);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Preview failed');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!datasetId || !previewResult) return;
    
    setIsExecuting(true);
    try {
      await bulkApi.executeRule(datasetId, rule);
      toast.success('Rule executed successfully!');
      setPreviewResult(null);
      setRule({
        conditions: [{ column: '', operator: 'equals', value: '' }],
        condition_logic: 'AND',
        action: { type: 'set_value', column: '', value: '' }
      });
      refetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleUndo = async (operationId: string) => {
    setIsUndoing(true);
    try {
      await bulkApi.undoOperation(operationId);
      toast.success('Operation undone successfully!');
      refetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Undo failed');
    } finally {
      setIsUndoing(false);
    }
  };

  const handleSaveRule = async (name: string, description?: string) => {
    setIsSaving(true);
    try {
      if (isEditing && editingRuleId) {
        // Update existing rule
        await bulkApi.updateSavedRule(editingRuleId, { name, description, rule });
        toast.success('Rule updated successfully!');
        setIsEditing(false);
        setEditingRuleId(null);
        setEditingRuleName('');
      } else {
        // Create new rule
        await bulkApi.createSavedRule({ name, description, rule });
        toast.success('Rule saved successfully!');
      }
      setShowSaveModal(false);
      refetchRules();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'save'} rule`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyRule = (savedRule: SavedRule) => {
    setRule(savedRule.configuration);  // Use 'configuration' instead of 'rule'
    setActiveTab('builder');
    toast.success('Rule loaded for editing!');
  };

  const handleEditRule = (savedRule: SavedRule) => {
    setIsEditing(true);
    setEditingRuleId(savedRule.id);
    setEditingRuleName(savedRule.name);
    setRule(savedRule.configuration);
    setActiveTab('builder');
    toast.success(`Editing rule: ${savedRule.name}`);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingRuleId(null);
    setEditingRuleName('');
    setRule({
      conditions: [{ column: '', operator: 'equals', value: '' }],
      condition_logic: 'AND',
      action: { type: 'set_value', column: '', value: '' }
    });
    toast('Edit cancelled', { icon: '↩️' });
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await bulkApi.deleteSavedRule(ruleId);
      toast.success('Rule deleted successfully!');
      refetchRules();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete rule');
    }
  };

  const isRuleValid = () => {
    return rule.conditions.every(c => c.column && c.operator) && 
           rule.action.column && rule.action.type;
  };

  if (datasetLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Dataset not found</p>
      </div>
    );
  }

  const renderRuleBuilder = () => (
    <div className="space-y-6">
      {/* Edit indicator */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">✏️</span>
            <span className="text-blue-800 font-medium text-sm sm:text-base">
              Editing: {editingRuleName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="text-blue-600 hover:text-blue-800 w-full sm:w-auto"
          >
            Cancel Edit
          </Button>
        </div>
      )}
      
      <RuleBuilder
        rule={rule}
        columns={getSchemaColumns(dataset?.schema)}
        onUpdate={setRule}
      />

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <Button
          variant="outline"
          onClick={() => setShowSaveModal(true)}
          leftIcon={<Save className="h-4 w-4" />}
          disabled={!isRuleValid()}
          className="w-full sm:w-auto"
        >
          {isEditing ? 'Update Rule' : 'Save Rule'}
        </Button>
        <Button
          variant="outline"
          onClick={handlePreview}
          loading={isPreviewLoading}
          leftIcon={<Eye className="h-4 w-4" />}
          disabled={!isRuleValid()}
          className="w-full sm:w-auto"
        >
          Preview Changes
        </Button>
      </div>

      {previewResult && (
        <PreviewResults
          result={previewResult}
          onConfirm={handleExecute}
          onCancel={() => setPreviewResult(null)}
          isExecuting={isExecuting}
        />
      )}
    </div>
  );

  const renderSavedRules = () => (
    <SavedRulesList
      rules={savedRules}
      datasetId={datasetId}
      onApply={handleApplyRule}
      onEdit={handleEditRule}
      onDelete={handleDeleteRule}
      onRuleExecuted={() => {
        refetchHistory();
        toast.success('Check the History tab to see the operation!');
      }}
    />
  );

  const renderHistory = () => (
    <OperationHistory
      operations={history}
      onUndo={handleUndo}
      isUndoing={isUndoing}
    />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'builder':
        return renderRuleBuilder();
      case 'saved':
        return renderSavedRules();
      case 'history':
        return renderHistory();
      default:
        return renderRuleBuilder();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bulk Operations - ${dataset.name}`}
        subtitle="Create conditional rules to modify multiple rows at once"
        breadcrumb={
          <Button
            variant="ghost"
            onClick={() => navigate('/datasets')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Datasets
          </Button>
        }
      />

      <Card>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </Card>

      <SaveRuleModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveRule}
        rule={rule}
        isSaving={isSaving}
        isEditing={isEditing}
        editingRuleName={editingRuleName}
      />
    </div>
  );
};

export default BulkOperationsPage;