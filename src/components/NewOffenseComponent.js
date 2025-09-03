import { useContext, useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { initOffensesTable, insertOffense, getAllOffenses, clearOffenses } from "../db/database";

const NewOffenseComponent = () => {
  const { theme, themeName } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [category, setCategory] = useState(null);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  const logItemsToConsole = useCallback((list) => {
    console.log("=== OFFENSES (latest first) ===");
    list.forEach((it) => {
      console.log({
        id: it.id,
        description: it.description,
        created_at: it.created_at,
        photo_uri: it.photo_uri,
        category: it.category ?? null,
      });
    });
    console.log("=== END OFFENSES ===");
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await getAllOffenses();
      setItems(data);
      logItemsToConsole(data);
    } catch (e) {
      console.error("Failed to load offenses:", e);
    }
  }, [logItemsToConsole]);

  useEffect(() => {
    (async () => {
      try {
        await initOffensesTable();
        await loadData();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadData]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("permission_denied_title", "Permission denied"),
        t(
          "pick_image_permission_denied",
          "We need access to your camera to take a photo."
        )
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: false,
        exif: false,
        allowsEditing: false,
      });

      if (result) {
        if (result.assets && result.assets.length > 0) {
          setPhotoUri(result.assets[0].uri || null);
        } else if (result.uri) {
          setPhotoUri(result.uri);
        }
      }
    } catch (e) {
      console.error("takePhoto error:", e);
      Alert.alert(
        t("error_title", "Error"),
        t("error_saving", "Failed to take photo.")
      );
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert(
        t("validation_title", "Validation"),
        t("validation_description_required", "Description is required.")
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        description: description.trim(),
        photo_uri: photoUri ?? null,
        category: category ?? null,
        created_at: new Date().toISOString(),
      };
      await insertOffense(payload);
      setDescription("");
      setPhotoUri(null);
      setCategory(null);

      await loadData();

      Alert.alert(t("saved_successfully", "Saved successfully"));
    } catch (e) {
      console.error("Failed to save offense:", e);
      Alert.alert(
        t("error_title", "Error"),
        t("error_saving", "Failed to save offense.")
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmClear = () => {
    Alert.alert(
      t("confirm_clear", "Clear all offenses?"),
      undefined,
      [
        { text: t("cancel", "Cancel"), style: "cancel" },
        {
          text: t("clear", "Clear"),
          style: "destructive",
          onPress: async () => {
            try {
              await clearOffenses();
              await loadData();
            } catch (e) {
              console.error("clearOffenses error:", e);
              Alert.alert(
                t("error_title", "Error"),
                t("error_saving", "Failed to clear offenses.")
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  }

  const renderItem = ({ item }) => {
    const src = item.photo_uri ? { uri: item.photo_uri } : null;
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.divider },
        ]}>
        <View style={styles.cardRow}>
          {src ? (
            <Image source={src} style={styles.thumbnail} />
          ) : (
            <View style={[styles.noPhoto, { borderColor: theme.divider }]}>
              <Text style={{ color: theme.text, fontSize: 12 }}>
                {t("no_photo", "No photo")}
              </Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text
              style={[styles.cardTitle, { color: theme.text }]}
              numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={[styles.cardDate, { color: theme.text }]}>
              {formatDate(item.created_at)}
            </Text>
            <Text style={[styles.cardCategory, { color: theme.text }]}>
              {item.category
                ? `${t("category_label", "Category")}: ${t(
                    `cat_${item.category}`,
                    item.category
                  )}`
                : t("no_category", "No category")}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled">
        <View style={styles.scrollPad}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t("new_offense", "New Offense")}
          </Text>

          <TouchableOpacity
            style={[
              styles.boxCommonSmall,
              { backgroundColor: theme.card, marginBottom: 8 },
            ]}
            onPress={() => setCatModalVisible(true)}>
            <Text style={{ color: theme.text, flex: 1 }}>
              {category
                ? `${t("category_label", "Category")}: ${t(
                    `cat_${category}`,
                    category
                  )}`
                : t("select_category", "Select category")}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: theme.text }]}>
            {t("description", "Description")}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t(
              "description_placeholder",
              "Describe the offense..."
            )}
            placeholderTextColor="#888"
            multiline
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: theme.divider,
              },
            ]}/>

          <View style={styles.row}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePickImage}
              style={[
                styles.button,
                { borderColor: theme.divider, backgroundColor: theme.card },
              ]}>
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {t("take_photo", "Take Photo")}
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.previewBox,
                {
                  borderColor:
                    themeName === "dark"
                      ? "rgba(255,255,255,0.9)"
                      : theme.divider,
                },
              ]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.preview} />
              ) : (
                <Text style={{ color: theme.text, fontSize: 12 }}>
                  {t("no_photo", "No photo")}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.saveButton,
              {
                backgroundColor: saving ? "#b0b0b0" : "tomato",
              },
            ]}>
            <Text style={styles.saveText}>{t("save", "Save")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={confirmClear}
            style={[styles.clearButton, { borderColor: theme.divider }]}>
            <Text style={[styles.clearText, { color: theme.text }]}>
              {t("clear", "Clear")}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.listTitle, { color: theme.text }]}>
            {t("offenses_list", "Offenses list")}
          </Text>
        </View>

        <Modal
          visible={catModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCatModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.divider },
              ]}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.text, marginBottom: 8 },
                ]}>
                {t("select_category", "Select category")}
              </Text>
              {(
                [
                  { key: "public_order", label: t("cat_public_order", "Public order") },
                  { key: "traffic", label: t("cat_traffic", "Traffic violation") },
                  { key: "property_damage", label: t("cat_property_damage", "Property damage") },
                  { key: "crimes", label: t("cat_crimes", "Crimes") },
                ]
              ).map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.modalItem,
                    category === c.key && { backgroundColor: "tomato" },
                  ]}
                  onPress={() => {
                    setCategory(c.key);
                    setCatModalVisible(false);
                  }}>
                  <Text
                    style={{ color: category === c.key ? "#fff" : theme.text }}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.modalItem, { marginTop: 8 }]}
                onPress={() => setCatModalVisible(false)}>
                <Text style={{ color: theme.text }}>
                  {t("cancel", "Cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          scrollEnabled={false}/>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollPad: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewBox: {
    flex: 1,
    minHeight: 180,
    maxHeight: 240,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  saveButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  clearButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  noPhoto: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  cardCategory: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  boxCommonSmall: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalCard: {
    width: "80%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalItem: {
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});

export default NewOffenseComponent;