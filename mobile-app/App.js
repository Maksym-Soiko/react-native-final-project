import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import DrawerNavigator from "./src/navigation/DrawerNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { StatusBar } from "react-native";
import { useContext, useEffect } from "react";
import AuthScreen from "./src/screens/AuthScreen";
import { loadLanguage } from "./src/i18n";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { Provider } from "react-native-paper";
import ToastProvider from "./src/context/ToastProvider";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Provider>
          <ToastProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ToastProvider>
        </Provider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const {
    themeName,
    theme,
    loaded: themeLoaded,
  } = useContext(require("./src/context/ThemeContext").ThemeContext);
  const { user, loaded: authLoaded } = useAuth();

  useEffect(() => {
    (async () => {
      await loadLanguage();
    })();
  }, []);

  if (!themeLoaded || !authLoaded) return null;
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <StatusBar
        barStyle={themeName === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.card}/>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </>
  );
}