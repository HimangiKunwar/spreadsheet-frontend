import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  GitCompare, 
  Zap, 
  FileText,
  X,
  Workflow
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Datasets', href: '/datasets', icon: Database },
  { name: 'Reconciliation', href: '/reconciliation', icon: GitCompare },
  { name: 'Bulk Operations', href: '/bulk', icon: Zap },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Reports', href: '/reports', icon: FileText },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        `fixed inset-y-0 left-0 z-30 w-64 border-r transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${theme.colors.sidebar} ${theme.colors.border}`,
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <h2 className={`text-lg font-semibold transition-colors duration-300 ${theme.colors.text}`}>Menu</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md transition-colors duration-300 ${theme.colors.textMuted} ${theme.colors.cardHover}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-4 lg:mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-3 py-3 lg:py-2 text-sm font-medium rounded-md transition-colors duration-300',
                      isActive
                        ? `${theme.colors.primary} ${theme.colors.primaryText}`
                        : `${theme.colors.textSecondary} ${theme.colors.cardHover} ${theme.colors.text}`
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export { Sidebar };