import { View, Text, StyleSheet, Image, Modal, TouchableOpacity, ScrollView,
  DeviceEventEmitter, Alert } from "react-native";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import MapView, { Marker } from "react-native-maps";
import * as offenseApi from "../api/offenseApi";
import { showToast } from "../utils/toast";

const MapComponent = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [offenses, setOffenses] = useState([]);
  const [selectedOffense, setSelectedOffense] = useState(null);
  const mapRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const dates = await offenseApi.getDates();
      const recent = Array.isArray(dates) ? dates.slice(0, 7) : [];
      let aggregated = [];
      for (const d of recent) {
        try {
          const items = await offenseApi.getByDate(d);
          if (Array.isArray(items) && items.length) {
            aggregated = aggregated.concat(
              items.map((it) => ({
                id: it.id ?? it._id,
                description: it.description,
                category: it.category,
                photo_uri: it.photoUrl ?? null,
                created_at: it.dateTime ?? it.created_at,
                latitude: it.location?.lat ?? it.latitude ?? null,
                longitude: it.location?.lng ?? it.longitude ?? null,
              }))
            );
          }
        } catch (e) {}
      }
      setOffenses(
        aggregated.filter((o) => o.latitude != null && o.longitude != null)
      );
    } catch (err) {
      console.warn("Failed to load offenses from backend:", err);
      if (err?.response?.status === 401) {
        Alert.alert(
          t("session_expired_title", "Session expired"),
          t("session_expired_desc", "Please login again")
        );
      } else {
        showToast(
          t(
            "server_unavailable",
            "Cannot reach server. Check your internet connection or try again later."
          )
        );
      }
      setOffenses([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const offenseAddedListener = DeviceEventEmitter.addListener(
      "offense_added",
      async (payload) => {
        try {
          await loadData();
          if (
            payload &&
            payload.latitude != null &&
            payload.longitude != null &&
            mapRef.current
          ) {
            mapRef.current.animateToRegion(
              {
                latitude: payload.latitude,
                longitude: payload.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              500
            );
          }
        } catch (e) {
          console.warn("Error handling offense_added:", e);
          showToast(
            t(
              "server_unavailable",
              "Cannot reach server. Check your internet connection or try again later."
            )
          );
        }
      }
    );

    const offensesClearedListener = DeviceEventEmitter.addListener(
      "offenses_cleared",
      async () => {
        await loadData();
      }
    );
    return () => {
      offenseAddedListener.remove();
      offensesClearedListener.remove();
    };
  }, [loadData]);

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy}, ${hh}:${min}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {offenses.length > 0 ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          key={offenses.map((o) => o.id).join(",")}
          initialRegion={{
            latitude: offenses[0]?.latitude || 49.421533,
            longitude: offenses[0]?.longitude || 26.996817,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          {offenses.map((offense, idx) => (
            <Marker
              key={offense.id ?? `offense-${idx}`}
              coordinate={{
                latitude: offense.latitude,
                longitude: offense.longitude,
              }}
              onPress={() => setSelectedOffense(offense)}/>
          ))}
        </MapView>
      ) : (
        <View style={styles.center}>
          <Text style={{ color: theme.text, textAlign: "center" }}>
            {t(
              "no_offenses_on_map",
              "No offenses with location to display on the map"
            )}
          </Text>
        </View>
      )}

      <Modal
        visible={!!selectedOffense}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOffense(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.divider },
            ]}>
            <ScrollView contentContainerStyle={{ padding: 12 }}>
              <TouchableOpacity
                onPress={() => setSelectedOffense(null)}
                style={{ alignSelf: "flex-end", padding: 6 }}>
                <Text style={{ color: theme.text, fontWeight: "700" }}>✕</Text>
              </TouchableOpacity>
              {selectedOffense?.photo_uri ? (
                <Image
                  source={{ uri: selectedOffense.photo_uri }}
                  style={styles.modalImage}
                  resizeMode="cover"/>
              ) : (
                <View style={[styles.noPhotoBox, { marginBottom: 8 }]}>
                  <Text style={{ color: theme.text }}>
                    {t("no_photo", "No photo")}
                  </Text>
                </View>
              )}
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedOffense?.description ||
                  t("no_description", "No description")}
              </Text>
              <Text style={{ color: theme.text, marginTop: 8 }}>
                {t("category_label", "Category")}:{" "}
                {selectedOffense?.category
                  ? t(
                      `cat_${selectedOffense.category}`,
                      selectedOffense.category
                    )
                  : t("no_category", "No category")}
              </Text>
              <Text style={{ color: theme.text, marginTop: 8 }}>
                {formatDate(selectedOffense?.created_at)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calloutContainer: {
    width: 200,
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
  },
  calloutImage: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  noPhotoBox: {
    width: 180,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#888",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  calloutDescription: {
    fontSize: 13,
    marginBottom: 4,
    textAlign: "center",
  },
  calloutDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    borderRadius: 12,
    padding: 8,
    maxHeight: "90%",
  },
  modalImage: {
    width: "100%",
    height: 340,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#ddd",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
});

export default MapComponent;