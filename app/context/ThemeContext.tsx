"use client";
import { createContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme?: string;
  changeTheme?: (nextTheme?: string) => void;
}
export const ThemeContext = createContext<ThemeContextType>({});

export const ThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState<string>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let defaultTheme = "light";
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      defaultTheme = "dark";
    }
    setIsMounted(true);
    const storedTheme = localStorage.getItem("theme") || defaultTheme;
    setTheme(storedTheme);
  }, [theme]);

  if (!isMounted) return null;

  const changeTheme = (theme: any) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
  };
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
