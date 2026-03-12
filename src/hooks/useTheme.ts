import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import { getAllThemes } from '../styles/themes';

export const useTheme = () => {
  const { theme, themeName, setTheme } = useThemeContext();
  
  return {
    theme,
    themeName,
    setTheme,
    isDark: theme.isDark,
    themes: getAllThemes(),
  };
};