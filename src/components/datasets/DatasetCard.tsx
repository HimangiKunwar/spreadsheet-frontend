import React from 'react';
import { FileText, Calendar, Database, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Dataset } from '../../types/dataset';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DatasetCardProps {
  dataset: Dataset;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  onView,
  onDelete
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (_fileType: string) => {
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getFileTypeIcon(dataset.file_type)}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {dataset.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {dataset.original_filename}
            </p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>{dataset.row_count.toLocaleString()} rows</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>•</span>
                <span>{dataset.column_count} columns</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>•</span>
                <Badge variant="info" size="sm">
                  {dataset.file_type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <span>•</span>
                <span>{formatFileSize(dataset.file_size)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>
                Created {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
              </span>
              {dataset.version > 1 && (
                <>
                  <span>•</span>
                  <span>Version {dataset.version}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(dataset.id)}
            leftIcon={<Eye className="h-4 w-4" />}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(dataset.id)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};