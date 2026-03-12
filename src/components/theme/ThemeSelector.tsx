import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeName } from '../../types/theme';

const themeColors: Record<ThemeName, string> = {
  light: 'bg-blue-600',
  dark: 'bg-blue-500',
  ocean: 'bg-teal-500',
  sunset: 'bg-orange-500',
  forest: 'bg-emerald-500',
  royal: 'bg-purple-500',
};

export const ThemeSelector: React.FC = () => {
  const { theme, themeName, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (selectedTheme: ThemeName) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, selectedTheme: ThemeName) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeSelect(selectedTheme);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors duration-300 ${theme.colors.card} ${theme.colors.border} ${theme.colors.text} ${theme.colors.cardHover}`}
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">{theme.colors.label}</span>
        <div className={`w-3 h-3 rounded-full ${themeColors[themeName]}`} />
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 transition-colors duration-300 ${theme.colors.card} ${theme.colors.border}`}>
          <div className="py-1">
            {themes.map((themeOption) => (
              <button
                key={themeOption.name}
                onClick={() => handleThemeSelect(themeOption.name)}
                onKeyDown={(e) => handleKeyDown(e, themeOption.name)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors duration-300 ${theme.colors.text} ${theme.colors.cardHover}`}
                role="menuitem"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${themeColors[themeOption.name]}`} />
                  <span>{themeOption.colors.label}</span>
                </div>
                {themeName === themeOption.name && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};