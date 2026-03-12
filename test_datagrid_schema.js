// Test file to verify DataGrid schema handling
// This would be used in a proper test suite

import { ColumnSchema } from '../src/types/dataset';

// Mock the getColumns function from DataGrid
const getColumns = (schema: any, data: any[]): ColumnSchema[] => {
  // If schema is null/undefined, try to get columns from data
  if (!schema) {
    if (data && data.length > 0) {
      return Object.keys(data[0]).map(name => ({ name, type: 'string' as const, confidence: 1, null_count: 0, sample_values: [] }));
    }
    return [];
  }
  
  // If schema is already an array of ColumnSchema objects
  if (Array.isArray(schema)) {
    // Check if it's array of ColumnSchema objects with 'name' property
    if (schema.length > 0 && typeof schema[0] === 'object' && 'name' in schema[0]) {
      return schema as ColumnSchema[];
    }
    // It's array of strings - convert to ColumnSchema
    if (schema.length > 0 && typeof schema[0] === 'string') {
      return schema.map(name => ({ name, type: 'string' as const, confidence: 1, null_count: 0, sample_values: [] }));
    }
  }
  
  // If schema is an object with 'columns' property
  if (typeof schema === 'object' && 'columns' in schema && Array.isArray(schema.columns)) {
    return schema.columns.map((name: string) => ({ name, type: 'string' as const, confidence: 1, null_count: 0, sample_values: [] }));
  }
  
  // If schema is an object with column names as keys
  if (typeof schema === 'object' && !Array.isArray(schema)) {
    return Object.keys(schema).map(name => ({ name, type: 'string' as const, confidence: 1, null_count: 0, sample_values: [] }));
  }
  
  // Fallback: get columns from first data row
  if (data && data.length > 0) {
    return Object.keys(data[0]).map(name => ({ name, type: 'string' as const, confidence: 1, null_count: 0, sample_values: [] }));
  }
  
  return [];
};

// Test cases
const testCases = [
  {
    name: 'Proper ColumnSchema array',
    schema: [
      { name: 'id', type: 'integer', confidence: 0.95, null_count: 0, sample_values: ['1', '2', '3'] },
      { name: 'name', type: 'string', confidence: 1.0, null_count: 1, sample_values: ['John', 'Jane', 'Bob'] }
    ],
    data: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
    expected: 2
  },
  {
    name: 'Array of strings',
    schema: ['id', 'name', 'email'],
    data: [{ id: 1, name: 'John', email: 'john@test.com' }],
    expected: 3
  },
  {
    name: 'Object with columns property',
    schema: { columns: ['Year', 'Industry_code', 'Value'] },
    data: [{ Year: 2020, Industry_code: 'A', Value: 100 }],
    expected: 3
  },
  {
    name: 'Object with column keys',
    schema: { id: 'integer', name: 'string', active: 'boolean' },
    data: [{ id: 1, name: 'John', active: true }],
    expected: 3
  },
  {
    name: 'Null schema - fallback to data',
    schema: null,
    data: [{ col1: 'value1', col2: 'value2' }],
    expected: 2
  },
  {
    name: 'Undefined schema - fallback to data',
    schema: undefined,
    data: [{ a: 1, b: 2, c: 3 }],
    expected: 3
  },
  {
    name: 'Empty data and null schema',
    schema: null,
    data: [],
    expected: 0
  }
];

// Run tests
console.log('Testing DataGrid schema handling...');
console.log('=====================================');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  try {
    const result = getColumns(testCase.schema, testCase.data);
    const success = result.length === testCase.expected;
    
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`  Expected: ${testCase.expected} columns`);
    console.log(`  Got: ${result.length} columns`);
    console.log(`  Result: ${success ? 'PASS' : 'FAIL'}`);
    
    if (success) {
      passed++;
    } else {
      failed++;
      console.log(`  Columns: ${result.map(c => c.name).join(', ')}`);
    }
    console.log('');
  } catch (error) {
    console.log(`Test ${index + 1}: ${testCase.name} - ERROR: ${error}`);
    failed++;
  }
});

console.log('=====================================');
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log(`Total: ${testCases.length}`);
console.log(`Success rate: ${Math.round((passed / testCases.length) * 100)}%`);

if (failed === 0) {
  console.log('✅ All tests passed! DataGrid should handle all schema formats correctly.');
} else {
  console.log('❌ Some tests failed. Check the implementation.');
}