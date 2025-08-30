import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function CustomDrawerContent(props) {
  const { themeName, theme, toggleTheme } = useContext(ThemeContext);

  const ITEM_MARGIN = 8;
  const ITEM_HEIGHT = 52;
  const ICON_SIZE = 22;
  const ICON_COLOR = theme.drawerIcon;
  const LABEL_COLOR = theme.text;
  const LABEL_FONT_SIZE = 16;
  const LABEL_FONT_WEIGHT = "500";
  const THEME_ICON = themeName === "light" ? "sunny-outline" : "moon-outline";

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.scroll,
        { backgroundColor: theme.background },
      ]}>
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
          Profile
        </Text>
      </TouchableOpacity>

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
          {themeName === "light" ? "Light Theme" : "Dark Theme"}
        </Text>
        <Switch value={themeName === "dark"} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity
        style={[
          styles.boxCommon,
          {
            marginVertical: ITEM_MARGIN,
            height: ITEM_HEIGHT,
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            justifyContent: "center",
          },
        ]}
        onPress={() => {}}>
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
          Language
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => console.log("Logout pressed")}
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
          Logout
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
});