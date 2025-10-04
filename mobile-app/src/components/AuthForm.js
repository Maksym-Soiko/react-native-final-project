import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Portal, Dialog, Button, Paragraph } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import * as authApi from "../api/authApi";

export default function AuthForm({ mode = "login", onSuccess, theme }) {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const { themeName, theme: ctxTheme } = useContext(ThemeContext);
  const appTheme = theme || ctxTheme;

  const inputTextColor = themeName === "dark" ? "#ffffff" : "#111111";
  const placeholderColor = themeName === "dark" ? "#cccccc" : "#666666";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestPending, setGuestPending] = useState(null);

  const sanitizeEmail = (v) => {
    if (typeof v !== "string") return "";
    return v.replace(/[^\w@.+-]/g, "");
  };

  const isValidEmail = (v) => {
    if (!v || typeof v !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  };

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
      setGuestPending(guestUser);
      setGuestModalVisible(true);
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
      setError(
        t("validation_first_last_required", "First and last name are required")
      );
      setIsProcessing(false);
      return;
    }
    if (!email.trim() || !password) {
      setError(
        t("validation_credentials_required", "Email and password are required.")
      );
      setIsProcessing(false);
      return;
    }
    if (!isValidEmail(email.trim().toLowerCase())) {
      setError(t("invalid_email", "Please enter a valid email address"));
      setIsProcessing(false);
      return;
    }
    if (password !== confirm) {
      setError(t("password_mismatch", "Passwords do not match"));
      setIsProcessing(false);
      return;
    }

    try {
      const resp = await authApi.register(
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        password
      );
      const data = resp?.data ?? {};
      const token = data?.token;
      if (!token) {
        const msg = data?.message || t("error_saving", "Registration failed");
        setError(msg);
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

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setError("");

      if (onSuccess) onSuccess(newUser);
    } catch (err) {
      console.error("register error", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("error_saving", "Failed to save.");
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const login = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    if (!email.trim() || !password) {
      setError(
        t("validation_credentials_required", "Email and password are required")
      );
      setIsProcessing(false);
      return;
    }
    if (!isValidEmail(email.trim().toLowerCase())) {
      setError(t("invalid_email", "Please enter a valid email address"));
      setIsProcessing(false);
      return;
    }
    try {
      const resp = await authApi.login(email.trim().toLowerCase(), password);
      const data = resp?.data ?? {};
      const token = data?.token;
      if (!token) {
        const msg =
          data?.message || t("login_error", "Incorrect login or password");
        setError(msg);
        setIsProcessing(false);
        return;
      }

      const user = {
        id: Date.now(),
        email: email.trim().toLowerCase(),
        token,
      };

      if (setUser) await setUser(user);
      setError("");

      setEmail("");
      setPassword("");
      if (onSuccess) onSuccess(user);
    } catch (err) {
      console.error("login error", err);
      if (err?.response?.status === 401) {
        setError(t("login_error", "Incorrect login or password"));
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          t("login_error", "Incorrect login or password");
        setError(msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Portal>
        <Dialog
          visible={guestModalVisible}
          onDismiss={() => setGuestModalVisible(false)}
          style={{
            backgroundColor: appTheme.card,
            borderRadius: 12,
            marginHorizontal: 24,
          }}>
          <Dialog.Title style={{ color: appTheme.text, fontWeight: "700" }}>
            {t("guest_mode_title", "Guest mode")}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: appTheme.text }}>
              {t("guest_mode_desc", "You are logged in as a guest")}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            <Button
              mode="contained"
              onPress={async () => {
                setGuestModalVisible(false);
                if (guestPending) {
                  try {
                    if (setUser) await setUser(guestPending);
                    if (onSuccess) onSuccess(guestPending);
                  } catch (e) {
                    console.warn("setUser (guest) failed", e);
                  } finally {
                    setGuestPending(null);
                  }
                }
              }}
              contentStyle={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 8,
              }}
              style={{ backgroundColor: appTheme.primary }}
              labelStyle={{ color: "#fff", fontWeight: "700" }}
              uppercase={false}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme?.surface || appTheme.surface || appTheme.card,
            shadowColor: appTheme.shadowColor || "#000",
            borderColor: appTheme.divider || "#ddd",
          },
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
              onChangeText={(v) => {
                setFirstName(v);
                if (error) setError("");
              }}
              placeholder={t("first_name", "First name")}
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  color: inputTextColor,
                  backgroundColor:
                    themeName === "light" ? "#ececec" : appTheme.card,
                },
              ]}/>
            <TextInput
              value={lastName}
              onChangeText={(v) => {
                setLastName(v);
                if (error) setError("");
              }}
              placeholder={t("last_name", "Last name")}
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  color: inputTextColor,
                  backgroundColor:
                    themeName === "light" ? "#ececec" : appTheme.card,
                },
              ]}/>
          </>
        )}

        <TextInput
          value={email}
          onChangeText={(v) => {
            const clean = sanitizeEmail(v);
            setEmail(clean);
            if (error) setError("");
          }}
          placeholder={t("email", "Email")}
          placeholderTextColor={placeholderColor}
          style={[
            styles.input,
            {
              color: inputTextColor,
              backgroundColor:
                themeName === "light" ? "#ececec" : appTheme.card,
            },
          ]}
          keyboardType="email-address"
          autoCapitalize="none"/>

        <View style={styles.passwordWrapper}>
          <TextInput
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (error) setError("");
            }}
            placeholder={t("password", "Password")}
            placeholderTextColor={placeholderColor}
            style={[
              styles.input,
              {
                flex: 1,
                color: inputTextColor,
                backgroundColor:
                  themeName === "light" ? "#ececec" : appTheme.card,
                borderRightWidth: 0,
              },
            ]}
            secureTextEntry={true}/>
        </View>

        {mode === "register" && (
          <TextInput
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              if (error) setError("");
            }}
            placeholder={t("confirm_password", "Confirm password")}
            placeholderTextColor={placeholderColor}
            style={[
              styles.input,
              {
                color: inputTextColor,
                backgroundColor:
                  themeName === "light" ? "#ececec" : appTheme.card,
              },
            ]}
            secureTextEntry/>
        )}

        {error ? (
          <Text style={[styles.errorText, { color: appTheme.primary }]}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            mode === "register" && styles.primaryButtonRegisterSpacing,
            {
              backgroundColor: isProcessing ? "#9e9e9e" : appTheme.primary,
              opacity: isProcessing ? 0.9 : 1,
            },
          ]}
          onPress={mode === "login" ? login : register}
          disabled={isProcessing}>
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === "login"
                ? t("sign_in", "Sign In")
                : t("register", "Register")}
            </Text>
          )}
        </TouchableOpacity>

        {mode === "register" && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { backgroundColor: isProcessing ? "#b0b0b0" : "#606060" },
            ]}
            onPress={enterWithoutRegistration}
            disabled={isProcessing}>
            <Text style={styles.buttonText}>
              {t("sign_in_as_a_guest", "Sign in as a guest")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderColor: "transparent",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  secondaryButton: {
    marginTop: 8,
  },
  primaryButtonRegisterSpacing: {
    marginBottom: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  errorText: {
    marginBottom: 8,
    fontSize: 13,
  },
});