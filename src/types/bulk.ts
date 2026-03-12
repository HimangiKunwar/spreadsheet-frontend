export type ConditionOperator = 
  | 'equals' | 'not_equals' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  | 'greater_than_or_equal' | 'less_than_or_equal'
  | 'is_empty' | 'is_not_empty' | 'between' | 'in_list';

export type ActionType = 
  | 'set_value' | 'increment' | 'decrement' | 'concatenate'
  | 'clear' | 'copy_from' | 'uppercase' | 'lowercase' | 'trim';

export interface Condition {
  column: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  value2?: string | number;
}

export interface Action {
  type: ActionType;
  column: string;
  value?: string | number;
  source_column?: string;
}

export interface BulkRule {
  conditions: Condition[];
  condition_logic: 'AND' | 'OR';
  action: Action;
}

export interface SavedRule {
  id: string;
  name: string;
  description?: string;
  configuration: BulkRule;  // Backend uses 'configuration', not 'rule'
  dataset?: string;  // Dataset UUID
  dataset_id?: string;  // Dataset UUID (from serializer)
  dataset_name?: string;  // Dataset name (from serializer)
  use_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedRuleCreate {
  name: string;
  description?: string;
  rule: BulkRule;  // Frontend still uses 'rule' for input, API converts to 'configuration'
}

export interface SavedRuleUpdate {
  name?: string;
  description?: string;
  rule?: BulkRule;  // Frontend still uses 'rule' for input, API converts to 'configuration'
}

export interface BulkOperation {
  id: string;
  dataset: string;
  dataset_name?: string;
  saved_rule?: string;
  rule_name?: string;
  rule_config: BulkRule;
  affected_rows: number;
  affected_indices: number[];
  dataset_version_before: number;
  dataset_version_after: number;
  is_undone: boolean;
  created_at: string;
}

export interface PreviewResult {
  affected_count: number;
  total_rows: number;
  preview_rows: any[];
  affected_indices: number[];
}

export interface RuleConfig {
  conditions: Array<{
    column: string;
    operator: string;
    value: string;
    logic: 'and' | 'or';
  }>;
  action: {
    type: string;
    column: string;
    value: string;
  };
}

export interface ExecuteRequest {
  rule_config: RuleConfig;
}