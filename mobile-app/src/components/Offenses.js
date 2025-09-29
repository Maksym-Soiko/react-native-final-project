import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as offenseApi from "../api/offenseApi";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Offenses({
  viewingDate,
  formatDate,
  refreshTaskCounts,
}) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    try {
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
  };

  const loadForDay = async () => {
    try {
      const dt = new Date(viewingDate);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      const dateOnly = `${y}-${m}-${d}`;
      const data = await offenseApi.getByDate(dateOnly);
      const mapped = Array.isArray(data)
        ? data.map((it) => ({
            id: it.id ?? it._id,
            description: it.description,
            category: it.category,
            photo_uri: it.photoUrl ?? it.photo_url ?? null,
            created_at: it.dateTime ?? it.created_at,
            latitude: (it.location && it.location.lat) ?? it.latitude ?? null,
            longitude: (it.location && it.location.lng) ?? it.longitude ?? null,
          }))
        : [];
      setItems(mapped);
    } catch (err) {
      console.warn("Failed to load offenses from backend:", err);
      if (err?.response?.status === 401) {
        Alert.alert(
          t("session_expired_title", "Session expired"),
          t("session_expired_desc", "Please login again")
        );
      }
      setItems([]);
    }
  };

  useEffect(() => {
    loadForDay();
    if (typeof refreshTaskCounts === "function") refreshTaskCounts();
  }, [viewingDate]);

  const renderItem = ({ item }) => {
    const src = item.photo_uri ? { uri: item.photo_uri } : null;
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.divider },
        ]}>
        <View style={styles.row}>
          {src ? (
            <Image source={src} style={styles.thumb} />
          ) : (
            <View style={[styles.noPhoto, { borderColor: theme.divider }]}>
              <Text style={{ color: theme.text, fontSize: 12 }}>
                {t("no_photo", "No photo")}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: theme.text, fontWeight: "700" }}
              numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={{ color: theme.text, marginTop: 6 }}>
              {formatDateTime(item.created_at)}
            </Text>
            <Text style={{ color: theme.text, marginTop: 6 }}>
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

  return (
    <View style={{ flex: 1, width: "100%", maxWidth: 420 }}>
      {items.length > 0 && (
        <Text style={{ color: theme.text, fontWeight: "700", marginBottom: 8 }}>
          {t("offenses_list", "Offenses list")}
        </Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 90 }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#ddd",
  },
  noPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
});