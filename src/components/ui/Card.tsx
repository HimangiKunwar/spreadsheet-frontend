import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  actions, 
  padding = 'md', 
  children, 
  className 
}) => {
  const { theme } = useTheme();
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div className={cn(`rounded-lg shadow-sm border transition-colors duration-300 ${theme.colors.card} ${theme.colors.border}`, className)}>
      {(title || subtitle || actions) && (
        <div className={cn(`border-b transition-colors duration-300 ${theme.colors.border}`, paddingClasses[padding])}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex-1 min-w-0">
              {title && <h3 className={`text-base sm:text-lg font-semibold truncate transition-colors duration-300 ${theme.colors.text}`}>{title}</h3>}
              {subtitle && <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${theme.colors.textMuted}`}>{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center space-x-2 flex-shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      <div className={cn(paddingClasses[padding])}>
        {children}
      </div>
    </div>
  );
};

export { Card };