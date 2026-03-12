import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { ThemeSelector } from '../theme/ThemeSelector';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`border-b px-4 sm:px-6 py-4 transition-colors duration-300 ${theme.colors.sidebar} ${theme.colors.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${theme.colors.text}`}>SmartSheet Pro</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeSelector />
          <div className="hidden sm:flex items-center space-x-2">
            <User className={`h-5 w-5 transition-colors duration-300 ${theme.colors.textMuted}`} />
            <span className={`text-sm transition-colors duration-300 ${theme.colors.textSecondary}`}>
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="h-4 w-4" />}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export { Header };