import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

export default function CustomDrawerContent(props) {
  const ITEM_MARGIN = 8;
  const ITEM_HEIGHT = 52;
  const ICON_SIZE = 22;
  const ICON_COLOR = "#333";
  const LABEL_COLOR = "#333";
  const LABEL_FONT_SIZE = 16;
  const LABEL_FONT_WEIGHT = '500';

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingVertical: 8 }}>
      <DrawerItem
        label="Profile"
        onPress={() => props.navigation.navigate("Profile")}
        icon={() => (
          <Ionicons name="person-outline" size={ICON_SIZE} color={ICON_COLOR} />
        )}
        labelStyle={{ color: LABEL_COLOR, fontSize: LABEL_FONT_SIZE, fontWeight: LABEL_FONT_WEIGHT }}
        style={{
          marginVertical: ITEM_MARGIN,
          height: ITEM_HEIGHT,
          justifyContent: "center",
        }}/>

      <View
        style={[
          styles.drawerItem,
          { marginVertical: ITEM_MARGIN, height: ITEM_HEIGHT },
        ]}>
        <Ionicons name="moon-outline" size={ICON_SIZE} color={ICON_COLOR} />
        <Text
          style={[
            styles.drawerLabel,
            { color: LABEL_COLOR, fontSize: LABEL_FONT_SIZE, fontWeight: LABEL_FONT_WEIGHT },
          ]}>
          Theme
        </Text>
        <Switch value={false} onValueChange={() => {}} />
      </View>

      <TouchableOpacity
        style={[
          styles.drawerItem,
          { marginVertical: ITEM_MARGIN, height: ITEM_HEIGHT },
        ]}>
        <Ionicons name="language-outline" size={ICON_SIZE} color={ICON_COLOR} />
        <Text
          style={[
            styles.drawerLabel,
            { color: LABEL_COLOR, fontSize: LABEL_FONT_SIZE, fontWeight: LABEL_FONT_WEIGHT },
          ]}>
          Language
        </Text>
      </TouchableOpacity>

      <DrawerItem
        label="Logout"
        onPress={() => console.log("Logout pressed")}
        icon={() => (
          <Ionicons
            name="log-out-outline"
            size={ICON_SIZE}
            color={ICON_COLOR}/>
        )}
        labelStyle={{ color: LABEL_COLOR, fontSize: LABEL_FONT_SIZE, fontWeight: LABEL_FONT_WEIGHT }}
        style={{
          marginVertical: ITEM_MARGIN,
          height: ITEM_HEIGHT,
          justifyContent: "center",
        }}/>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  drawerLabel: {
    marginLeft: 10,
    flex: 1,
  },
});