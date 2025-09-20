import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { getAllOffenses } from "../db/database";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Offenses({ viewingDate, formatDate, refreshTaskCounts }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const loadForDay = async () => {
    try {
      const all = await getAllOffenses();
      const target = new Date(viewingDate).toDateString();
      const filtered = all.filter((it) => {
        if (!it.created_at) return false;
        return new Date(it.created_at).toDateString() === target;
      });
      setItems(filtered);
    } catch (e) {
      console.error("Offenses load error:", e);
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