import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CalendarComponent from "../components/CalendarComponent";
import MapComponent from "../components/MapComponent";
import NewOffenseComponent from "../components/NewOffenseComponent";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}>
      <Tab.Screen name="Calendar" component={CalendarComponent} />
      <Tab.Screen name="Map" component={MapComponent} />
      <Tab.Screen name="New offense" component={NewOffenseComponent} />
    </Tab.Navigator>
  );
}