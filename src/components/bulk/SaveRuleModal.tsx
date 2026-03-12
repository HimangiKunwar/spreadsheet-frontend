import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { BulkRule } from '../../types/bulk';

interface SaveRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  rule: BulkRule;
  isSaving?: boolean;
  isEditing?: boolean;
  editingRuleName?: string;
}

export const SaveRuleModal: React.FC<SaveRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rule,
  isSaving = false,
  isEditing = false,
  editingRuleName = '',
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Pre-populate form when editing
  React.useEffect(() => {
    if (isOpen) {
      if (isEditing && editingRuleName) {
        setName(editingRuleName);
      } else {
        setName('');
      }
      setDescription('');
    }
  }, [isOpen, isEditing, editingRuleName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  const formatRulePreview = () => {
    const conditionsText = rule.conditions
      .map(c => `${c.column} ${c.operator} ${c.value}`)
      .join(` ${rule.condition_logic} `);
    const actionText = `${rule.action.type} ${rule.action.column}`;
    return `IF ${conditionsText} THEN ${actionText}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Update Rule' : 'Save Rule'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rule Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter rule name"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rule Preview
          </label>
          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
            {formatRulePreview()}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!name.trim()}
          >
            {isEditing ? 'Update Rule' : 'Save Rule'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};