import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const USERS_KEY = "APP_USERS";
const CURRENT_USER = "CURRENT_USER";

export default function AuthForm({ mode = "login", onSuccess, theme }) {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const { themeName } = useContext(ThemeContext);

  const inputTextColor = themeName === "dark" ? "#ffffff" : "#111111";
  const placeholderColor = themeName === "dark" ? "#cccccc" : "#666666";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadUsers = async () => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const saveUsers = async (arr) => {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(arr));
  };

  const register = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        t("validation_title", "Validation"),
        t("validation_first_last_required", "First and last name required")
      );
      setIsProcessing(false);
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert(
        t("validation_title", "Validation"),
        t("validation_description_required", "Description is required.")
      );
      setIsProcessing(false);
      return;
    }
    if (password !== confirm) {
      Alert.alert(
        t("validation_title", "Validation"),
        t("password_mismatch", "Passwords do not match")
      );
      setIsProcessing(false);
      return;
    }
    const users = await loadUsers();
    if (users.find((u) => u.email === email.trim())) {
      Alert.alert(
        t("error_title", "Error"),
        t("user_exists", "User already exists")
      );
      setIsProcessing(false);
      return;
    }
    const newUser = {
      id: Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    };
    users.push(newUser);
    try {
      await saveUsers(users);
      await AsyncStorage.setItem(CURRENT_USER, JSON.stringify(newUser));
      Alert.alert(
        t("saved_successfully", "Saved successfully"),
        t("user_registered", "Registered")
      );
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      if (setUser) await setUser(newUser);
      if (onSuccess) onSuccess(newUser);
    } catch (err) {
      console.error("register error", err);
      Alert.alert(
        t("error_title", "Error"),
        t("error_saving", "Failed to save.")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const login = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    if (!email.trim() || !password) {
      Alert.alert(
        t("validation_title", "Validation"),
        t("validation_description_required", "Description is required.")
      );
      setIsProcessing(false);
      return;
    }
    try {
      const users = await loadUsers();
      const user = users.find(
        (u) => u.email === email.trim() && u.password === password
      );
      if (!user) {
        Alert.alert(
          t("error_title", "Error"),
          t("login_failed", "Invalid credentials")
        );
        setIsProcessing(false);
        return;
      }
      await AsyncStorage.setItem(CURRENT_USER, JSON.stringify(user));
      Alert.alert(
        t("saved_successfully", "Saved successfully"),
        t("login", "Logged in")
      );
      setEmail("");
      setPassword("");
      if (setUser) await setUser(user);
      if (onSuccess) onSuccess(user);
    } catch (err) {
      console.error("login error", err);
      Alert.alert(
        t("error_title", "Error"),
        t("login_failed", "Invalid credentials")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme?.background || "#fff" },
      ]}>
      <Text style={[styles.label, { color: inputTextColor }]}>
        {mode === "login"
          ? t("login_form", "Login")
          : t("registration_form", "Register")}
      </Text>

      {mode === "register" && (
        <>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("first_name", "First name")}
            placeholderTextColor={placeholderColor}
            style={[
              styles.input,
              {
                color: inputTextColor,
                borderColor: theme?.divider || "#ddd",
              },
            ]}/>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("last_name", "Last name")}
            placeholderTextColor={placeholderColor}
            style={[
              styles.input,
              {
                color: inputTextColor,
                borderColor: theme?.divider || "#ddd",
              },
            ]}/>
        </>
      )}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t("email", "Email")}
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          {
            color: inputTextColor,
            borderColor: theme?.divider || "#ddd",
          },
        ]}
        keyboardType="email-address"
        autoCapitalize="none"/>

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={t("password", "Password")}
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          {
            color: inputTextColor,
            borderColor: theme?.divider || "#ddd",
          },
        ]}
        secureTextEntry/>

      {mode === "register" ? (
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder={t("confirm_password", "Confirm password")}
          placeholderTextColor={placeholderColor}
          style={[
            styles.input,
            {
              color: inputTextColor,
              borderColor: theme?.divider || "#ddd",
            },
          ]}
          secureTextEntry/>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isProcessing ? "#b0b0b0" : "tomato" },
        ]}
        onPress={mode === "login" ? login : register}
        disabled={isProcessing}>
        <Text style={styles.buttonText}>
          {mode === "login" ? t("login", "Login") : t("register", "Register")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});