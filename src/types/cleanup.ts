export type CleanupOperationType = 
  | 'trim_whitespace'
  | 'uppercase'
  | 'lowercase'
  | 'title_case'
  | 'remove_special_chars'
  | 'fix_inconsistent_casing'
  | 'remove_leading_zeros'
  | 'fill_empty_with_value'
  | 'fill_empty_with_mean'
  | 'fill_empty_with_median'
  | 'fill_empty_with_mode'
  | 'remove_empty_rows'
  | 'round_numbers'
  | 'remove_outliers'
  | 'normalize_numbers'
  | 'standardize_dates'
  | 'extract_year'
  | 'extract_month'
  | 'remove_duplicates'
  | 'split_column'
  | 'merge_columns';

export interface CleanupOperation {
  key: CleanupOperationType;
  name: string;
  description: string;
  category: 'string' | 'null_handling' | 'numeric' | 'date' | 'data_quality';
  column_types: string[];
}

export interface CleanupRequest {
  operation: CleanupOperationType;
  columns?: string[];
  options?: Record<string, any>;
}

export interface CleanupPreviewResponse {
  affected_rows: number;
  sample_changes: {
    row_index: number;
    column: string;
    before: any;
    after: any;
  }[];
  warnings: string[];
}

export interface CleanupResponse {
  success: boolean;
  message: string;
  affected_rows: number;
  new_version: number;
}