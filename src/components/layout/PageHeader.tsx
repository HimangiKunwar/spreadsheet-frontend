import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumb
}) => {
  return (
    <div className="space-y-4">
      {breadcrumb && (
        <div className="text-xs sm:text-sm text-gray-500">
          {breadcrumb}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};