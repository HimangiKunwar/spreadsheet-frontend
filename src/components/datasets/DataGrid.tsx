
interface Column {
  name: string;
  type?: string;
}

interface DataGridProps {
  schema: any;
  data: any[];
  loading?: boolean;
  maxRows?: number;
}

export default function DataGrid({ schema, data, loading = false, maxRows = 100 }: DataGridProps) {
  /**
   * Safely extract columns array from schema.
   * Handles multiple formats:
   * - null/undefined → get from data keys
   * - array of strings → use directly
   * - array of objects with 'name' → extract names
   * - object with 'columns' array → extract columns
   * - object with keys → use keys
   */
  const getColumns = (): string[] => {
    // If schema is null/undefined, try to get columns from data
    if (!schema) {
      if (data && data.length > 0) {
        return Object.keys(data[0]);
      }
      return [];
    }
    
    // If schema is already an array
    if (Array.isArray(schema)) {
      // Check if it's array of objects with 'name' property
      if (schema.length > 0 && typeof schema[0] === 'object' && schema[0].name) {
        return schema.map((col: Column) => col.name);
      }
      // It's array of strings
      return schema;
    }
    
    // If schema is an object with 'columns' property
    if (typeof schema === 'object' && schema.columns) {
      if (Array.isArray(schema.columns)) {
        // Check if columns are objects with 'name'
        if (schema.columns.length > 0 && typeof schema.columns[0] === 'object') {
          return schema.columns.map((col: Column) => col.name);
        }
        return schema.columns;
      }
    }
    
    // If schema is an object, use its keys (excluding 'columns')
    if (typeof schema === 'object' && !Array.isArray(schema)) {
      const keys = Object.keys(schema).filter(k => k !== 'columns');
      if (keys.length > 0) {
        return keys;
      }
    }
    
    // Fallback: get columns from first data row
    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    
    return [];
  };

  const columns = getColumns();
  const displayData = data?.slice(0, maxRows) || [];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  // Empty states
  if (columns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No columns to display
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                >
                  {row[column] !== null && row[column] !== undefined 
                    ? String(row[column]) 
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length > maxRows && (
        <div className="text-center py-2 text-sm text-gray-500 bg-gray-50">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  );
};