import { View, Text, StyleSheet } from "react-native";

const CalendarComponent = () => {
  return (
    <View style = {styles.container}>
      <Text>Calendar Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CalendarComponent;