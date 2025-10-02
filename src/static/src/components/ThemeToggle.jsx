import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Palette, 
  Sun, 
  Moon, 
  Check,
  ChevronDown
} from 'lucide-react';

const ThemeToggle = ({ isOpen }) => {
  const { currentTheme, theme, themes, changeTheme, toggleDarkMode, isDark } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const vibrantThemes = Object.entries(themes).filter(([key]) => 
    !['light', 'dark'].includes(key)
  );

  if (!isOpen) {
    return (
      <div className="px-2 py-2">
        <button
          onClick={toggleDarkMode}
          className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </span>
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? (
              <>
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Escuro</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700">Claro</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Cores
              </span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showColorPicker ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {showColorPicker && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    changeTheme('light');
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentTheme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Claro</span>
                  {currentTheme === 'light' && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                </button>

                <button
                  onClick={() => {
                    changeTheme('dark');
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentTheme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-gray-800" />
                  <span className="text-gray-700 dark:text-gray-300">Escuro</span>
                  {currentTheme === 'dark' && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                </button>

                {vibrantThemes.map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => {
                      changeTheme(key);
                      setShowColorPicker(false);
                    }}
                    className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      currentTheme === key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: themeData.primary }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-xs">
                      {themeData.name}
                    </span>
                    {currentTheme === key && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
