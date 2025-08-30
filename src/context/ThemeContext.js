import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

const THEME_KEY = "app_theme";

const themes = {
  light: {
    background: "#ffffff",
    card: "#f6f6f6",
    text: "#111111",
    drawerIcon: "#333333",
    divider: "#e0e0e0",
  },
  dark: {
    background: "#121212",
    card: "#1e1e1e",
    text: "#ffffff",
    drawerIcon: "#ffffff",
    divider: "#2c2c2c",
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("light");
  const [theme, setTheme] = useState(themes.light);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        const name = saved === "dark" ? "dark" : "light";
        setThemeName(name);
        setTheme(themes[name]);
      } catch (error) {
        console.error("Failed to load theme.");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = themeName === "light" ? "dark" : "light";
    setThemeName(next);
    setTheme(themes[next]);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch (error) {
      console.error("Failed to save theme.");
    }
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme, toggleTheme, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
};