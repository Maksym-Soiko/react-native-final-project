import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getUser, updateUser } from "../api/userApi";
import { Portal, Dialog, Button, Paragraph } from "react-native-paper";

const ProfileScreen = () => {
  const { theme, themeName } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentInfo, setCurrentInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  function extractInfo(u) {
    const info = u?.user ?? u?.data ?? u?.profile ?? u;
    return info || {};
  }

  function getUserId() {
    const info = extractInfo(user);
    return info.id ?? info._id ?? user?.id ?? user?.userId ?? null;
  }

  function getToken() {
    return user?.token ?? user?.accessToken ?? null;
  }

  function isObjectId(v) {
    return typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);
  }

  function looksLikeEmail(v) {
    return typeof v === "string" && v.includes("@");
  }

  function resolveServerId(rawId) {
    if (!rawId) return null;
    if (isObjectId(rawId) || looksLikeEmail(rawId)) return rawId;
    const info = extractInfo(user);
    if (info?.email) return info.email;
    return null;
  }

  useEffect(() => {
    const info = extractInfo(user);
    setFirstName(info.firstName ?? "");
    setLastName(info.lastName ?? "");
    setEmail(info.email ?? "");
    setCurrentInfo({
      firstName: info.firstName ?? "",
      lastName: info.lastName ?? "",
      email: info.email ?? "",
    });
  }, [user]);

  useEffect(() => {
    const id = getUserId();
    const token = getToken();
    const idToUse = resolveServerId(id);
    if (!idToUse || !token) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const serverUser = await getUser(idToUse, token);
        if (!mounted) return;
        const info = serverUser?.user ?? serverUser;
        setFirstName(info.firstName ?? "");
        setLastName(info.lastName ?? "");
        setEmail(info.email ?? "");
        setCurrentInfo({
          firstName: info.firstName ?? "",
          lastName: info.lastName ?? "",
          email: info.email ?? "",
        });
        if (setUser) {
          if (user) {
            setUser((prev) => {
              const source = prev ?? user;
              const base = { ...source };
              if (base.user) {
                base.user = { ...base.user, ...info };
              } else {
                Object.assign(base, info);
              }
              return base;
            });
          }
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          console.warn("User not found on server (404)", id);
        } else {
          console.warn(
            "Failed to fetch user from server:",
            err?.message ?? err
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isDark = themeName === "dark" || theme?.mode === "dark";
  const primary = theme?.primary ?? (isDark ? "tomato" : "tomato");
  const cardBg = theme?.card ?? (isDark ? "#131313" : "#ffffff");
  const inputBackground = isDark ? "#1a1a1a" : "#fafafa";
  const borderColor = theme?.divider ?? (isDark ? "#2c2c2c" : "#E6E6E6");
  const subText = theme?.subText ?? (isDark ? "#AAB2BD" : "#666");
  const placeholderColor = isDark ? "#8f99a6" : "#999";
  const avatarShadowColor = isDark ? "rgba(0,0,0,0.6)" : primary + "33";

  const initials = `${(currentInfo.firstName || "").trim().charAt(0) || ""}${
    (currentInfo.lastName || "").trim().charAt(0) || ""
  }`.toUpperCase();

  const fullNewPasswordText = t(
    "new_password",
    "New password (leave empty to keep current)"
  );
  const shortNewPasswordText = t("new_password_short", "New password");
  const PLACEHOLDER_MAX_LEN = 30;
  const placeholderForNewPassword =
    typeof fullNewPasswordText === "string" &&
    fullNewPasswordText.length <= PLACEHOLDER_MAX_LEN
      ? fullNewPasswordText
      : shortNewPasswordText;

  const validate = () => {
    let ok = true;
    setFirstNameError("");
    setLastNameError("");
    if (!firstName || firstName.trim().length < 2) {
      setFirstNameError(
        t("first_name_too_short", "First name must be at least 2 characters")
      );
      ok = false;
    }
    if (!lastName || lastName.trim().length < 2) {
      setLastNameError(
        t("last_name_too_short", "Last name must be at least 2 characters")
      );
      ok = false;
    }
    if (password && password.length < 6) {
      Alert.alert(
        t("validation_error", "Validation error"),
        t("password_too_short", "Password must be at least 6 characters")
      );
      return false;
    }
    return ok;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const id = getUserId();
    const token = getToken();
    const idToUse = resolveServerId(id);
    if (!idToUse || !token) {
      Alert.alert(
        t("error", "Error"),
        t("not_authenticated", "You are not authenticated")
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };
      if (password) payload["password"] = password;

      const updated = await updateUser(idToUse, payload, token);

      const updatedInfo = (updated?.user ?? updated) || {};
      setCurrentInfo({
        firstName:
          updatedInfo.firstName ?? updatedInfo.first_name ?? firstName.trim(),
        lastName:
          updatedInfo.lastName ?? updatedInfo.last_name ?? lastName.trim(),
        email: updatedInfo.email ?? email,
      });

      if (setUser) {
        setUser((prev) => {
          if (!prev) {
            const tokenValue = token ? { token } : {};
            return { ...(updated?.user ?? updated), ...tokenValue };
          }
          const base = { ...prev };
          if (base.user) {
            base.user = { ...base.user, ...(updated?.user ?? updated) };
          } else {
            Object.assign(base, updated?.user ?? updated);
          }
          return base;
        });
      }

      setPassword("");
      setSuccessMessage(t("profile_updated", "Profile updated successfully"));
      setSuccessModalVisible(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        Alert.alert(t("error", "Error"), "User not found on server (404)");
      } else {
        console.error("Profile save error:", err);
        Alert.alert(t("error", "Error"), (err && err.message) || String(err));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background ?? (isDark ? "#000" : "#fff") },
        ]}
      >
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <>
      <Portal>
        <Dialog
          visible={successModalVisible}
          onDismiss={() => setSuccessModalVisible(false)}
          style={{
            backgroundColor: cardBg,
            borderRadius: 12,
            marginHorizontal: 24,
          }}>
          <Dialog.Title style={{ color: theme.text, fontWeight: "700" }}>
            {t("success", "Success")}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: theme.text }}>
              {successMessage}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            <Button
              mode="contained"
              onPress={() => setSuccessModalVisible(false)}
              contentStyle={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 8,
              }}
              style={{ backgroundColor: primary }}
              labelStyle={{ color: "#fff", fontWeight: "700" }}
              uppercase={false}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={cardBg}
      />
      <SafeAreaView
        style={[
          styles.safe,
          { backgroundColor: theme.background ?? (isDark ? "#000" : "#fff") },
        ]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.headerCard,
                {
                  backgroundColor: cardBg,
                  borderColor,
                  shadowColor: isDark ? "#000" : "#000",
                },
              ]}>
              <View style={styles.avatarRow}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: primary,
                      shadowColor: avatarShadowColor,
                    },
                  ]}>
                  <Text style={styles.avatarText}>{initials || "?"}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text
                    style={[
                      styles.nameText,
                      { color: theme?.text ?? (isDark ? "#fff" : "#111") },
                    ]}>
                    {`${currentInfo.firstName} ${currentInfo.lastName}`.trim() ||
                      t("no_name", "No name")}
                  </Text>
                  <Text style={[styles.emailText, { color: subText }]}>
                    {currentInfo.email || ""}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.formCard,
                { backgroundColor: cardBg, borderColor },
              ]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t("edit_profile", "Edit profile")}
              </Text>

              <Text style={[styles.label, { color: subText }]}>
                {t("first_name", "First name")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor,
                    color: theme?.text ?? (isDark ? "#fff" : "#111"),
                    backgroundColor: inputBackground,
                  },
                ]}
                value={firstName}
                onChangeText={(v) => {
                  setFirstName(v);
                  if (firstNameError && v.trim().length >= 2)
                    setFirstNameError("");
                }}
                placeholder={t("first_name", "First name")}
                placeholderTextColor={placeholderColor}
              />
              {firstNameError ? (
                <Text style={{ color: "tomato", marginTop: 6, fontSize: 13 }}>
                  {firstNameError}
                </Text>
              ) : null}

              <Text style={[styles.label, { color: subText }]}>
                {t("last_name", "Last name")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor,
                    color: theme?.text ?? (isDark ? "#fff" : "#111"),
                    backgroundColor: inputBackground,
                  },
                ]}
                value={lastName}
                onChangeText={(v) => {
                  setLastName(v);
                  if (lastNameError && v.trim().length >= 2)
                    setLastNameError("");
                }}
                placeholder={t("last_name", "Last name")}
                placeholderTextColor={placeholderColor}/>
              {lastNameError ? (
                <Text style={{ color: "tomato", marginTop: 6, fontSize: 13 }}>
                  {lastNameError}
                </Text>
              ) : null}

              <Text style={[styles.label, { color: subText }]}>
                {t("password", "Password")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor,
                    color: theme?.text ?? (isDark ? "#fff" : "#111"),
                    backgroundColor: inputBackground,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder={placeholderForNewPassword}
                placeholderTextColor={placeholderColor}
                secureTextEntry/>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: saving ? "#666" : primary,
                    opacity: saving ? 0.9 : 1,
                  },
                ]}
                onPress={handleSave}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t("save", "Save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  headerInfo: { flex: 1 },
  nameText: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  emailText: { fontSize: 14 },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: { fontSize: 12 },

  formCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  label: { fontSize: 13, marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
  },
  inputDisabled: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    opacity: 0.85,
  },

  saveButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  muted: { fontSize: 12, marginBottom: 6, color: "#666" },
});

export default ProfileScreen;