import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import DrawerNavigator from "./src/navigation/DrawerNavigator";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { StatusBar } from "react-native";
import { useContext } from "react";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { themeName, theme } = useContext(ThemeContext);

  return (
    <>
      <StatusBar
        barStyle={themeName === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.card} />
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </>
  );
}