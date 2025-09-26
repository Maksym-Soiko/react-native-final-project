import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import * as authApi from "../api/authApi";

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

  const enterWithoutRegistration = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const guestUser = {
        id: `guest_${Date.now()}`,
        isGuest: true,
        token: null,
        email: null,
      };
      if (setUser) await setUser(guestUser);
      if (onSuccess) onSuccess(guestUser);
      Alert.alert(t("guest_mode_title", "Guest mode"), t("guest_mode_desc", "You are logged in as a guest"));
    } catch (e) {
      console.warn("guest login error", e);
    } finally {
      setIsProcessing(false);
    }
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
        t("validation_description_required", "Email and password are required.")
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

    try {
      const resp = await authApi.register(firstName.trim(), lastName.trim(), email.trim().toLowerCase(), password);
      const data = resp?.data ?? {};
      const token = data?.token;
      if (!token) {
        const msg = data?.message || "Registration failed";
        Alert.alert(t("error_title", "Error"), msg);
        setIsProcessing(false);
        return;
      }

      const newUser = {
        id: Date.now(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        token,
      };

      if (setUser) await setUser(newUser);
      Alert.alert(t("saved_successfully", "Saved successfully"), t("user_registered", "Registered"));

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      if (onSuccess) onSuccess(newUser);
    } catch (err) {
      console.error("register error", err);
      const msg = err?.response?.data?.message || err?.message || t("error_saving", "Failed to save.");
      Alert.alert(t("error_title", "Error"), msg);
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
        t("validation_description_required", "Email and password are required.")
      );
      setIsProcessing(false);
      return;
    }
    try {
      const resp = await authApi.login(email.trim().toLowerCase(), password);
      const data = resp?.data ?? {};
      const token = data?.token;
      if (!token) {
        const msg = data?.message || "Login failed";
        Alert.alert(t("error_title", "Error"), msg);
        setIsProcessing(false);
        return;
      }

      const user = {
        id: Date.now(),
        email: email.trim().toLowerCase(),
        token,
      };

      if (setUser) await setUser(user);
      Alert.alert(t("saved_successfully", "Saved successfully"), t("login", "Logged in"));

      setEmail("");
      setPassword("");
      if (onSuccess) onSuccess(user);
    } catch (err) {
      console.error("login error", err);
      const msg = err?.response?.data?.message || err?.message || t("login_failed", "Invalid credentials");
      Alert.alert(t("error_title", "Error"), msg);
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
          mode === "register" && styles.primaryButtonRegisterSpacing,
          { backgroundColor: isProcessing ? "#b0b0b0" : "tomato" },
        ]}
        onPress={mode === "login" ? login : register}
        disabled={isProcessing}>
        <Text style={styles.buttonText}>
          {mode === "login" ? t("login", "Login") : t("register", "Register")}
        </Text>
      </TouchableOpacity>

      {mode === "register" && (
        <>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isProcessing ? "#b0b0b0" : "#666" },
            ]}
            onPress={enterWithoutRegistration}
            disabled={isProcessing}>
            <Text style={styles.buttonText}>
              {t("login_as_a_guest", "Login as a guest")}
            </Text>
          </TouchableOpacity>
        </>
      )}
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
  primaryButtonRegisterSpacing: {
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});