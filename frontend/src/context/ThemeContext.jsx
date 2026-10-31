import React, { createContext, useContext, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('dark');
    root.classList.add('theme-light');
    body.classList.remove('dark');
    body.classList.add('theme-light');
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('os_theme', 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', isLight: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context || { theme: 'light', isLight: true };
};
