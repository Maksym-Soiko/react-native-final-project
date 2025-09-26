import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import TabNavigator from "./TabNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import CustomDrawerContent from "../components/common/CustomDrawerContent";
import { TouchableOpacity } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { backgroundColor: theme.background },
      }}>
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={({ navigation }) => ({
          title: t("home", "Home"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerLeftContainerStyle: { marginRight: 16 },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 12 }}>
              <Ionicons name="menu" size={28} color={theme.drawerIcon} />
            </TouchableOpacity>
          ),
        })}/>
      {!user?.isGuest && (
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => ({
            title: t("profile", "Profile"),
            headerStyle: { backgroundColor: theme.card },
            headerTintColor: theme.text,
            headerLeftContainerStyle: { marginRight: 16 },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.toggleDrawer()}
                style={{ marginLeft: 12 }}>
                <Ionicons name="menu" size={28} color={theme.drawerIcon} />
              </TouchableOpacity>
            ),
          })}/>
      )}
    </Drawer.Navigator>
  );
}