import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};

const themes = {
  light: {
    name: 'Claro',
    mode: 'light',
    primary: '#3b82f6',
    classes: 'theme-light'
  },
  dark: {
    name: 'Escuro', 
    mode: 'dark',
    primary: '#3b82f6',
    classes: 'theme-dark'
  },
  neon: {
    name: 'Neon',
    mode: 'dark',
    primary: '#00ff88',
    classes: 'theme-neon'
  },
  purple: {
    name: 'Roxo Vibrante',
    mode: 'dark',
    primary: '#a855f7',
    classes: 'theme-purple'
  },
  orange: {
    name: 'Laranja Elétrico',
    mode: 'dark',
    primary: '#ff6b35',
    classes: 'theme-orange'
  },
  cyan: {
    name: 'Ciano Fluorescente',
    mode: 'dark',
    primary: '#06b6d4',
    classes: 'theme-cyan'
  },
  pink: {
    name: 'Rosa Choque',
    mode: 'dark',
    primary: '#ec4899',
    classes: 'theme-pink'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('rezende-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const theme = themes[currentTheme];
    document.documentElement.className = theme.classes;
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('rezende-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  const toggleDarkMode = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme,
    toggleDarkMode,
    isDark: themes[currentTheme].mode === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
