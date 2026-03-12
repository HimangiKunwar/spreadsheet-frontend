import { ColumnSchema } from '../types/dataset';

/**
 * Safely extract columns from schema regardless of format.
 * Handles multiple schema formats from the backend:
 * - Array of ColumnSchema objects: [{name: "col1", type: "string", ...}, ...]
 * - Object with columns property: {columns: [{name: "col1", type: "string", ...}, ...]}
 * - Object with column names as keys: {col1: "string", col2: "number", ...}
 * - Stringified JSON that needs parsing
 */
export const getSchemaColumns = (schema: any): ColumnSchema[] => {
  if (!schema) return [];
  
  // If schema is a string, try to parse it
  let parsedSchema = schema;
  if (typeof schema === 'string') {
    try {
      parsedSchema = JSON.parse(schema);
    } catch {
      return [];
    }
  }
  
  // If it's already an array, return it
  if (Array.isArray(parsedSchema)) {
    return parsedSchema;
  }
  
  // If it's an object with 'columns' property
  if (parsedSchema?.columns && Array.isArray(parsedSchema.columns)) {
    return parsedSchema.columns;
  }
  
  // If it's an object with column names as keys (like {col1: "string", col2: "number"})
  if (typeof parsedSchema === 'object') {
    return Object.entries(parsedSchema).map(([name, type]) => ({
      name,
      type: typeof type === 'string' ? type as ColumnSchema['type'] : 'string',
      confidence: 1.0,
      null_count: 0,
      sample_values: []
    }));
  }
  
  return [];
};

/**
 * Extract just the column names from schema
 */
export const getSchemaColumnNames = (schema: any): string[] => {
  return getSchemaColumns(schema).map(col => col.name);
};

/**
 * Get column by name from schema
 */
export const getSchemaColumn = (schema: any, columnName: string): ColumnSchema | undefined => {
  return getSchemaColumns(schema).find(col => col.name === columnName);
};