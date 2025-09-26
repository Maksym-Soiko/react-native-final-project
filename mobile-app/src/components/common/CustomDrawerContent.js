import { View, Text, Switch, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { changeLanguage } from "../../i18n";
import { useAuth } from "../../context/AuthContext";

export default function CustomDrawerContent(props) {
  const { themeName, theme, toggleTheme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const ITEM_MARGIN = 8;
  const ITEM_HEIGHT = 52;
  const ICON_SIZE = 22;
  const ICON_COLOR = theme.drawerIcon;
  const LABEL_COLOR = theme.text;
  const LABEL_FONT_SIZE = 16;
  const LABEL_FONT_WEIGHT = "500";
  const THEME_ICON = themeName === "light" ? "sunny-outline" : "moon-outline";
  const THEMELABEL =
    themeName === "light"
      ? t("light_mode", "Light Mode")
      : t("dark_mode", "Dark Mode");

  const availableLangs = Object.keys(i18n.options?.resources || {});

  const LANG_LABELS = {
    en: "English",
    uk: "Українська",
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.scroll,
        { backgroundColor: theme.background },
      ]}>
      { !user?.isGuest && (
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Profile")}
          style={[
            styles.boxCommon,
            {
              marginVertical: ITEM_MARGIN,
              height: ITEM_HEIGHT,
              backgroundColor: theme.card,
              paddingHorizontal: 12,
              justifyContent: "center",
            },
          ]}>
          <Ionicons name="person-outline" size={ICON_SIZE} color={ICON_COLOR} />
          <Text
            style={[
              styles.drawerLabel,
              {
                color: LABEL_COLOR,
                fontSize: LABEL_FONT_SIZE,
                fontWeight: LABEL_FONT_WEIGHT,
              },
            ]}>
            {t("profile", "Profile")}
          </Text>
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.boxCommon,
          {
            marginVertical: ITEM_MARGIN,
            height: ITEM_HEIGHT,
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            justifyContent: "center",
          },
        ]}>
        <Ionicons name={THEME_ICON} size={ICON_SIZE} color={ICON_COLOR} />
        <Text
          style={[
            styles.drawerLabel,
            {
              color: LABEL_COLOR,
              fontSize: LABEL_FONT_SIZE,
              fontWeight: LABEL_FONT_WEIGHT,
            },
          ]}>
          {THEMELABEL}
        </Text>
        <Switch value={themeName === "dark"} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity
        style={[
          styles.boxCommon,
          {
            marginVertical: ITEM_MARGIN,
            minHeight: ITEM_HEIGHT,
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
        onPress={() => setLangModalVisible(true)}>
        <Ionicons name="language-outline" size={ICON_SIZE} color={ICON_COLOR} />
        <Text
          style={[
            styles.drawerLabel,
            {
              color: LABEL_COLOR,
              fontSize: LABEL_FONT_SIZE,
              fontWeight: LABEL_FONT_WEIGHT,
            },
          ]}>
          {t("language", "Language")}
        </Text>
        <Text style={{ color: LABEL_COLOR }}>
          {i18n.language?.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.divider },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t("language", "Language")}
              </Text>
              <TouchableOpacity
                onPress={() => setLangModalVisible(false)}
                style={styles.modalClose}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalList}>
              {availableLangs.map((code) => {
                const selected = i18n.language === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => {
                      changeLanguage(code);
                      setLangModalVisible(false);
                    }}
                    style={[
                      styles.modalItem,
                      selected && {
                        backgroundColor: "tomato",
                      },
                    ]}>
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: selected ? "#fff" : theme.text },
                      ]}>
                      {LANG_LABELS[code] || code.toUpperCase()}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={async () => {
          try {
            if (typeof props.navigation?.closeDrawer === "function")
              props.navigation.closeDrawer();
          } catch (e) {}
          if (logout) await logout();
        }}
        style={[
          styles.boxCommon,
          {
            marginVertical: ITEM_MARGIN,
            height: ITEM_HEIGHT,
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            justifyContent: "center",
          },
        ]}>
        <Ionicons name="log-out-outline" size={ICON_SIZE} color={ICON_COLOR} />
        <Text
          style={[
            styles.drawerLabel,
            {
              color: LABEL_COLOR,
              fontSize: LABEL_FONT_SIZE,
              fontWeight: LABEL_FONT_WEIGHT,
            },
          ]}>
          {t("logout", "Logout")}
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  drawerLabel: {
    marginLeft: 10,
    flex: 1,
  },
  boxCommon: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalClose: {
    padding: 6,
  },
  modalList: {
    marginTop: 6,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  modalItemText: {
    fontSize: 15,
  },
});