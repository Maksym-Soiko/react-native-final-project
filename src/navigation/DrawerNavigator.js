import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import TabNavigator from "./TabNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import CustomDrawerContent from "../components/common/CustomDrawerContent";
import { TouchableOpacity } from "react-native";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={({ navigation }) => ({
          title: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 12 }}>
              <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}