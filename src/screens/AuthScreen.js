import { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthForm from "../components/AuthForm";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const CURRENT_USER = "CURRENT_USER";

export default function AuthScreen() {
  const { theme, themeName } = useContext(ThemeContext);
  const inputTextColor = themeName === "dark" ? "#ffffff" : "#111111";
  const { t } = useTranslation();
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [toggleDisabled, setToggleDisabled] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(CURRENT_USER);
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem(CURRENT_USER);
    setUser(null);
    Alert.alert(
      t("saved_successfully", "Saved successfully"),
      t("logout", "Logged out")
    );
  };

  const handleToggleMode = (next) => {
    if (toggleDisabled) return;
    setToggleDisabled(true);
    setMode(next);
    setTimeout(() => setToggleDisabled(false), 250);
  };

  const STATUSBAR_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  return (
    <>
      <StatusBar
        barStyle={themeName === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.card}/>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            paddingTop: 16 + STATUSBAR_HEIGHT,
          },
        ]}>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => handleToggleMode("login")}
            style={[styles.toggleBtn, mode === "login" && styles.activeBtn]}
            disabled={toggleDisabled}>
            <Text
              style={[
                mode === "login" ? styles.activeText : styles.inactiveText,
                { color: mode === "login" ? "#fff" : inputTextColor },
              ]}>
              {t("enter", "Enter")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleToggleMode("register")}
            style={[styles.toggleBtn, mode === "register" && styles.activeBtn]}
            disabled={toggleDisabled}>
            <Text
              style={[
                mode === "register" ? styles.activeText : styles.inactiveText,
                { color: mode === "register" ? "#fff" : inputTextColor },
              ]}>
              {t("registration", "Registration")}
            </Text>
          </TouchableOpacity>
        </View>

        <AuthForm
          mode={mode}
          onSuccess={(u) => {
            setUser(u);
          }}
          theme={theme}/>

        {user ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.text }}>
              {t("current_user", "Current user")}:{" "}
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""} (${
                    user.email
                  })`
                : user.email}
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutBtn, { borderColor: theme.divider }]}>
              <Text style={{ color: theme.text }}>{t("logout", "Logout")}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  activeBtn: {
    backgroundColor: "tomato",
    borderColor: "tomato",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
  inactiveText: {
    color: "#333",
  },
  logoutBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
});