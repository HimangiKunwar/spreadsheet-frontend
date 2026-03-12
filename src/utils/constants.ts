export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const SUPPORTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/tab-separated-values',
  'application/json'
];

export const SUPPORTED_FILE_EXTENSIONS = [
  '.csv',
  '.xlsx',
  '.xls',
  '.tsv',
  '.json'
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const COLUMN_TYPES = [
  'string',
  'integer',
  'float',
  'boolean',
  'date',
  'datetime',
  'email',
  'phone',
  'url',
  'currency',
  'percentage'
] as const;

export const CLEANUP_OPERATIONS = [
  'trim_whitespace',
  'standardize_dates',
  'fix_numbers',
  'remove_duplicates',
  'fill_empty',
  'uppercase',
  'lowercase',
  'remove_special_chars',
  'fix_currency'
] as const;

export const BULK_OPERATORS = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal',
  'is_empty',
  'is_not_empty',
  'between',
  'in_list'
] as const;

export const BULK_ACTIONS = [
  'set_value',
  'increment',
  'decrement',
  'concatenate',
  'clear',
  'copy_from',
  'uppercase',
  'lowercase',
  'trim'
] as const;

export const CHART_TYPES = [
  'bar',
  'horizontal_bar',
  'line',
  'pie',
  'area',
  'scatter'
] as const;

export const SUMMARY_METRICS = [
  'count',
  'sum',
  'mean',
  'median',
  'min',
  'max',
  'std',
  'unique'
] as const;