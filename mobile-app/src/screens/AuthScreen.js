import { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, Platform } from "react-native";
import AuthForm from "../components/AuthForm";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { theme, themeName } = useContext(ThemeContext);
  const inputTextColor = themeName === "dark" ? "#ffffff" : "#111111";
  const { t } = useTranslation();
  const [mode, setMode] = useState("login");
  const { user, logout } = useAuth();
  const [toggleDisabled, setToggleDisabled] = useState(false);

  const handleLogout = async () => {
    if (logout) await logout();
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t("welcome", "Welcome!")}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            {t("auth_subtitle", "Sign in or create an account")}
          </Text>
        </View>

        <View style={[styles.toggleRow, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            onPress={() => handleToggleMode("login")}
            style={[
              styles.toggleBtn,
              mode === "login" && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            disabled={toggleDisabled}>
            <Text
              style={[
                mode === "login" ? styles.activeText : styles.inactiveText,
                { color: mode === "login" ? "#fff" : theme.text },
              ]}>
              {t("enter", "Enter")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleToggleMode("register")}
            style={[
              styles.toggleBtn,
              mode === "register" && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            disabled={toggleDisabled}>
            <Text
              style={[
                mode === "register" ? styles.activeText : styles.inactiveText,
                { color: mode === "register" ? "#fff" : theme.text },
              ]}>
              {t("registration", "Registration")}
            </Text>
          </TouchableOpacity>
        </View>

        <AuthForm
          mode={mode}
          onSuccess={(u) => {}}
          theme={theme}/>

        {user ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: theme.text }}>
              {t("current_user", "Current user")}:{" "}
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""} (${user.email})`
                : user.email}
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutBtn, { borderColor: theme.primary }]}>
              <Text style={{ color: theme.primary }}>{t("logout", "Logout")}</Text>
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
    paddingHorizontal: 18,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: 14,
    padding: 6,
    borderRadius: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
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
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    alignSelf: "flex-start",
  },
});