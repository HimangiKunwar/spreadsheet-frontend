export interface ReconciliationJob {
  id: string;
  name: string;
  source_dataset: string;
  target_dataset: string;
  source_dataset_name: string;
  target_dataset_name: string;
  source_key_columns: string[];
  target_key_columns: string[];
  compare_columns: string[];
  fuzzy_match: boolean;
  fuzzy_threshold: number;
  summary: ReconciliationSummary;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ReconciliationSummary {
  total_source: number;
  total_target: number;
  match_count: number;
  mismatch_count: number;
  source_only_count: number;
  target_only_count: number;
  match_rate: number;
}

export interface Difference {
  column: string;
  source: any;
  target: any;
}

export interface MatchResult {
  source_index: number;
  target_index: number;
  source_key: string;
  row: Record<string, any>;
}

export interface MismatchResult {
  source_index: number;
  target_index: number;
  source_key: string;
  source_row: Record<string, any>;
  target_row: Record<string, any>;
  differences: Difference[];
  fuzzy_match?: boolean;
  similarity?: number;
}

export interface OrphanResult {
  index: number;
  key: string;
  row: Record<string, any>;
}

export interface ReconciliationResults {
  matches: MatchResult[];
  mismatches: MismatchResult[];
  source_only: OrphanResult[];
  target_only: OrphanResult[];
  summary: ReconciliationSummary;
}

export interface CreateReconciliationRequest {
  name?: string;
  source_dataset: string;
  target_dataset: string;
  source_key_columns: string[];
  target_key_columns: string[];
  compare_columns: string[]; // Always array, not optional
  fuzzy_match: boolean;
  fuzzy_threshold: number; // Integer (0-100), not float
}