import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getUser, updateUser } from "../api/userApi";

const ProfileScreen = () => {
  const { theme, themeName } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentInfo, setCurrentInfo] = useState({ firstName: "", lastName: "", email: "" });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  function extractInfo(u) {
    const info =
      u?.user ??
      u?.data ??
      u?.profile ??
      u;
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
              const base = { ...(source) };
              if (base.user) {
                base.user = { ...(base.user), ...(info) };
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
          console.warn("Failed to fetch user from server:", err?.message ?? err);
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

  const initials = `${(currentInfo.firstName || "").trim().charAt(0) || ""}${(currentInfo.lastName || "").trim().charAt(0) || ""}`.toUpperCase();

  const fullNewPasswordText = t("new_password", "New password (leave empty to keep current)");
  const shortNewPasswordText = t("new_password_short", "New password");
  const PLACEHOLDER_MAX_LEN = 30;
  const placeholderForNewPassword =
    typeof fullNewPasswordText === "string" && fullNewPasswordText.length <= PLACEHOLDER_MAX_LEN
      ? fullNewPasswordText
      : shortNewPasswordText;

  const validate = () => {
    if (!firstName || firstName.trim().length < 2) {
      Alert.alert(t("validation_error", "Validation error"), t("first_name_too_short", "First name must be at least 2 characters"));
      return false;
    }
    if (!lastName || lastName.trim().length < 2) {
      Alert.alert(t("validation_error", "Validation error"), t("last_name_too_short", "Last name must be at least 2 characters"));
      return false;
    }
    if (password && password.length < 6) {
      Alert.alert(t("validation_error", "Validation error"), t("password_too_short", "Password must be at least 6 characters"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const id = getUserId();
    const token = getToken();
    const idToUse = resolveServerId(id);
    if (!idToUse || !token) {
      Alert.alert(t("error", "Error"), t("not_authenticated", "You are not authenticated"));
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
        firstName: updatedInfo.firstName ?? updatedInfo.first_name ?? firstName.trim(),
        lastName: updatedInfo.lastName ?? updatedInfo.last_name ?? lastName.trim(),
        email: updatedInfo.email ?? email,
      });

      if (setUser) {
        setUser((prev) => {
          if (!prev) {
            const tokenValue = token ? { token } : {};
            return { ...(updated?.user ?? updated), ...tokenValue };
          }
          const base = { ...(prev) };
          if (base.user) {
            base.user = { ...(base.user), ...(updated?.user ?? updated) };
          } else {
            Object.assign(base, (updated?.user ?? updated));
          }
          return base;
        });
      }

      setPassword("");
      Alert.alert(t("success", "Success"), t("profile_updated", "Profile updated successfully"));
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background ?? (isDark ? "#000" : "#fff") }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background ?? (isDark ? "#000" : "#fff") }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
                <Text style={[styles.nameText, { color: theme?.text ?? (isDark ? "#fff" : "#111") }]}>{`${currentInfo.firstName} ${currentInfo.lastName}`.trim() || t("no_name", "No name")}</Text>
                <Text style={[styles.emailText, { color: subText }]}>{currentInfo.email || ""}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("edit_profile", "Edit profile")}</Text>

            <Text style={[styles.label, { color: subText }]}>{t("first_name", "First name")}</Text>
            <TextInput
              style={[styles.input, { borderColor, color: theme?.text ?? (isDark ? "#fff" : "#111"), backgroundColor: inputBackground }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t("first_name", "First name")}
              placeholderTextColor={placeholderColor}/>

            <Text style={[styles.label, { color: subText }]}>{t("last_name", "Last name")}</Text>
            <TextInput
              style={[styles.input, { borderColor, color: theme?.text ?? (isDark ? "#fff" : "#111"), backgroundColor: inputBackground }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t("last_name", "Last name")}
              placeholderTextColor={placeholderColor}/>

            <Text style={[styles.label, { color: subText }]}>{t("email", "Email")}</Text>
            <TextInput
              style={[styles.inputDisabled, { borderColor, color: theme?.text ?? (isDark ? "#fff" : "#111"), backgroundColor: inputBackground }]}
              value={email}
              editable={false}
              placeholderTextColor={placeholderColor}/>

            <Text style={[styles.label, { color: subText }]}>{t("password", "Password")}</Text>
            <TextInput
              style={[styles.input, { borderColor, color: theme?.text ?? (isDark ? "#fff" : "#111"), backgroundColor: inputBackground }]}
              value={password}
              onChangeText={setPassword}
              placeholder={placeholderForNewPassword}
              placeholderTextColor={placeholderColor}
              secureTextEntry/>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: saving ? "#666" : primary, opacity: saving ? 0.9 : 1 },
              ]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{t("save", "Save")}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.logoutButton,
                { borderColor: borderColor, backgroundColor: "transparent" },
              ]}
              onPress={() =>
                Alert.alert(
                  t("logout", "Logout"),
                  t("logout_confirm", "Are you sure you want to logout?"),
                  [
                    { text: t("cancel", "Cancel"), style: "cancel" },
                    {
                      text: t("logout", "Logout"),
                      style: "destructive",
                      onPress: () => {
                        if (logout) logout();
                      },
                    },
                  ],
                  { cancelable: true }
                )
              }>
              <Text style={[styles.logoutText, { color: theme?.text ?? (isDark ? "#fff" : "#111") }]}>{t("logout", "Logout")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  metaRow: { marginTop: 12, flexDirection: "row", justifyContent: "space-between" },
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

  logoutButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  logoutText: { fontSize: 15 },

  muted: { fontSize: 12, marginBottom: 6, color: "#666" },
});

export default ProfileScreen;