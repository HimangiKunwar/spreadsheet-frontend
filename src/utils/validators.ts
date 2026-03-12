import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
}).refine(data => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
});

// Dataset validation schemas
export const datasetUploadSchema = z.object({
  name: z.string().optional(),
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine(file => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
    .refine(
      file => [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/tab-separated-values',
        'application/json'
      ].includes(file.type),
      'File type not supported'
    ),
});

// Reconciliation validation schemas
export const reconciliationSchema = z.object({
  name: z.string().optional(),
  source_dataset: z.string().uuid('Select a source dataset'),
  target_dataset: z.string().uuid('Select a target dataset'),
  source_key_columns: z.array(z.string()).min(1, 'Select at least one key column'),
  target_key_columns: z.array(z.string()).min(1, 'Select at least one key column'),
  compare_columns: z.array(z.string()).optional(),
  fuzzy_match: z.boolean().default(false),
  fuzzy_threshold: z.number().min(0).max(100).default(80),
}).refine(data => data.source_dataset !== data.target_dataset, {
  message: 'Source and target datasets must be different',
  path: ['target_dataset'],
});

// Bulk operations validation schemas
export const conditionSchema = z.object({
  column: z.string().min(1, 'Select a column'),
  operator: z.enum([
    'equals', 'not_equals', 'contains', 'not_contains',
    'starts_with', 'ends_with', 'greater_than', 'less_than',
    'greater_than_or_equal', 'less_than_or_equal',
    'is_empty', 'is_not_empty', 'between', 'in_list'
  ]),
  value: z.string(),
  logic: z.enum(['and', 'or']),
});

export const actionSchema = z.object({
  type: z.enum([
    'set_value', 'increment', 'decrement', 'concatenate',
    'clear', 'copy_from', 'uppercase', 'lowercase', 'trim'
  ]),
  column: z.string().min(1, 'Select a column'),
  value: z.string(),
});

export const ruleConfigSchema = z.object({
  conditions: z.array(conditionSchema).min(1, 'At least one condition is required'),
  action: actionSchema,
});

export const savedRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  configuration: ruleConfigSchema,
});

// Report validation schemas
export const chartSectionSchema = z.object({
  type: z.literal('chart'),
  chart_type: z.enum(['bar', 'horizontal_bar', 'line', 'pie', 'area', 'scatter']),
  x_column: z.string().min(1, 'Select X-axis column'),
  y_column: z.string().min(1, 'Select Y-axis column'),
  title: z.string().optional(),
  color: z.string().optional(),
});

export const summarySectionSchema = z.object({
  type: z.literal('summary'),
  columns: z.array(z.string()).optional(),
  metrics: z.array(z.enum(['count', 'sum', 'mean', 'median', 'min', 'max', 'std', 'unique'])).optional(),
  group_by: z.string().optional(),
});

export const tableSectionSchema = z.object({
  type: z.literal('table'),
  columns: z.array(z.string()).optional(),
  max_rows: z.number().positive().optional(),
});

export const textSectionSchema = z.object({
  type: z.enum(['title', 'text']),
  content: z.string().min(1, 'Content is required'),
});

export const pageBreakSectionSchema = z.object({
  type: z.literal('page_break'),
});

export const reportSectionSchema = z.discriminatedUnion('type', [
  chartSectionSchema,
  summarySectionSchema,
  tableSectionSchema,
  textSectionSchema,
  pageBreakSectionSchema,
]);

export const reportConfigurationSchema = z.object({
  title: z.string().optional(),
  branding: z.object({
    primary_color: z.string().optional(),
    logo_path: z.string().optional(),
  }).optional(),
  sections: z.array(reportSectionSchema).min(1, 'At least one section is required'),
  page_settings: z.object({
    size: z.enum(['letter', 'a4']).optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
  }).optional(),
});

export const reportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  dataset: z.string().uuid('Select a dataset'),
  configuration: reportConfigurationSchema,
});

// Utility functions
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return z.string().min(8).safeParse(password).success;
};

export const validateFileSize = (file: File, maxSizeMB: number = 50): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};