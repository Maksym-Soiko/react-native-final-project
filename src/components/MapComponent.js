import { View, Text, StyleSheet } from "react-native";

const MapComponent = () => {
  return (
    <View style={styles.container}>
      <Text>Map Component</Text> 
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

export default MapComponent;