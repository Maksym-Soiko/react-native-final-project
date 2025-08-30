import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CalendarComponent from "../components/CalendarComponent";
import MapComponent from "../components/MapComponent";
import NewOffenseComponent from "../components/NewOffenseComponent";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.divider,
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: theme.text,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Calendar")
            iconName = focused ? "calendar-number" : "calendar-number-outline";
          else if (route.name === "Map")
            iconName = focused ? "map" : "map-outline";
          else if (route.name === "New offense")
            iconName = focused ? "add-circle" : "add-circle-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Calendar" component={CalendarComponent} />
      <Tab.Screen name="Map" component={MapComponent} />
      <Tab.Screen name="New offense" component={NewOffenseComponent} />
    </Tab.Navigator>
  );
}