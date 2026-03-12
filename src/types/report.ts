export type ChartType = 'bar' | 'horizontal_bar' | 'line' | 'pie' | 'area' | 'scatter';

export type SectionType = 'title' | 'text' | 'chart' | 'summary' | 'table' | 'page_break';

export interface ChartSection {
  type: 'chart';
  chart_type: ChartType;
  x_column: string;
  y_column: string;
  title?: string;
  color?: string;
}

export interface SummarySection {
  type: 'summary';
  columns?: string[];
  metrics?: ('count' | 'sum' | 'mean' | 'median' | 'min' | 'max' | 'std' | 'unique')[];
  group_by?: string;
}

export interface TableSection {
  type: 'table';
  columns?: string[];
  max_rows?: number;
}

export interface TextSection {
  type: 'title' | 'text';
  content: string;
}

export interface PageBreakSection {
  type: 'page_break';
}

export type ReportSection = ChartSection | SummarySection | TableSection | TextSection | PageBreakSection;

export interface ReportConfiguration {
  title?: string;
  branding?: {
    primary_color?: string;
    logo_path?: string;
  };
  sections: ReportSection[];
  page_settings?: {
    size?: 'letter' | 'a4';
    orientation?: 'portrait' | 'landscape';
  };
}

export interface Report {
  id: string;
  name: string;
  description: string;
  dataset?: string;
  dataset_name?: string;
  reconciliation?: string;
  reconciliation_name?: string;
  source_dataset_name?: string;
  target_dataset_name?: string;
  configuration: ReportConfiguration;
  pdf_path?: string;
  pptx_path?: string;
  xlsx_path?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  error_message?: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  generated_at?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  configuration: ReportConfiguration;
  required_columns: string[];
  thumbnail?: string;
  created_at: string;
}