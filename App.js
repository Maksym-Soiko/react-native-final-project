import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapComponent from "./src/components/MapComponent";
import NewOffenseComponent from "./src/components/NewOffenseComponent";
import CalendarComponent from "./src/components/CalendarComponent";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Calendar") {
              iconName = focused
                ? "calendar-number"
                : "calendar-number-outline";
            } else if (route.name === "Map") {
              iconName = focused ? "map" : "map-outline";
            } else if (route.name === "New offense") {
              iconName = focused ? "add-circle" : "add-circle-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
        })}>
        <Tab.Screen name="Calendar" component={CalendarComponent} />
        <Tab.Screen name="Map" component={MapComponent} />
        <Tab.Screen name="New offense" component={NewOffenseComponent} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});