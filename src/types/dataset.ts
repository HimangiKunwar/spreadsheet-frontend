export interface ColumnSchema {
  name: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'datetime' | 
        'email' | 'phone' | 'url' | 'currency' | 'percentage';
  confidence: number;
  null_count: number;
  sample_values: string[];
}

export interface Dataset {
  id: string;
  name: string;
  original_filename: string;
  file_type: 'csv' | 'xlsx' | 'xls' | 'tsv' | 'json';
  file_size: number;
  schema: ColumnSchema[];
  row_count: number;
  column_count: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DatasetVersion {
  id: string;
  version_number: number;
  change_description: string;
  created_at: string;
}

export interface PaginatedData {
  data: Record<string, any>[];
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
  schema: ColumnSchema[];
}

export type CleanupOperation = 
  | 'trim_whitespace'
  | 'standardize_dates'
  | 'fix_numbers'
  | 'remove_duplicates'
  | 'fill_empty'
  | 'uppercase'
  | 'lowercase'
  | 'remove_special_chars'
  | 'fix_currency';

export interface CleanupRequest {
  operation: CleanupOperation;
  columns?: string[];
  options?: Record<string, any>;
}