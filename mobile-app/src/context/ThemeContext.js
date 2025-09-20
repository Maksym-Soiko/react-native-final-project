import { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
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
  const [userPref, setUserPref] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        const system =
          Appearance.getColorScheme() === "dark" ? "dark" : "light";

        if (saved !== null) {
          const name = saved === "dark" ? "dark" : "light";
          setThemeName(name);
          setTheme(themes[name]);
          setUserPref(true);
        } else {
          setThemeName(system);
          setTheme(themes[system]);
          setUserPref(false);
        }
      } catch (error) {
        console.error("Failed to load theme.", error);
      } finally {
        setLoaded(true);
      }
    })();
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      const sys = colorScheme === "dark" ? "dark" : "light";
      if (!userPref) {
        setThemeName(sys);
        setTheme(themes[sys]);
      }
    });
    return () => {
      try {
        sub.remove();
      } catch (e) {}
    };
  }, []);

  const toggleTheme = async () => {
    const next = themeName === "light" ? "dark" : "light";
    setThemeName(next);
    setTheme(themes[next]);
    setUserPref(true);
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