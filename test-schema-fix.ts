// Test file to verify schema handling fix
// This simulates the different schema formats that might be received from the backend

const testSchemas = [
  // Format 1: Object with columns array of strings (current backend format)
  {
    columns: ['Name', 'Age', 'Email', 'Department', 'Salary']
  },
  
  // Format 2: Array of strings (simple format)
  ['Name', 'Age', 'Email', 'Department', 'Salary'],
  
  // Format 3: Array of objects (full ColumnSchema format)
  [
    { name: 'Name', type: 'string', confidence: 0.95, null_count: 0, sample_values: ['John', 'Jane'] },
    { name: 'Age', type: 'integer', confidence: 0.98, null_count: 1, sample_values: ['25', '30'] },
    { name: 'Email', type: 'email', confidence: 0.92, null_count: 0, sample_values: ['john@example.com'] }
  ],
  
  // Format 4: Null/undefined
  null,
  undefined,
  
  // Format 5: Empty object
  {}
];

// Function to safely extract columns (same logic as in the fix)
const getSchemaColumns = (schema: any): any[] => {
  if (!schema) {
    return [];
  }
  
  // If schema is already an array
  if (Array.isArray(schema)) {
    return schema;
  }
  
  // If schema is an object with 'columns' property
  if (typeof schema === 'object' && schema !== null) {
    if (Array.isArray(schema.columns)) {
      // Check if columns are strings or objects
      return schema.columns.map((col: any, index: number) => {
        if (typeof col === 'string') {
          return { name: col, type: 'unknown', index };
        }
        return { ...col, index };
      });
    }
  }
  
  return [];
};

// Test each schema format
console.log('Testing schema handling:');
testSchemas.forEach((schema, index) => {
  console.log(`\nTest ${index + 1}:`, schema);
  const result = getSchemaColumns(schema);
  console.log('Result:', result);
  console.log('Column names:', result.map(col => typeof col === 'string' ? col : col.name || col));
});

export {};