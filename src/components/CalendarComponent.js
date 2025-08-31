import { View, Text, StyleSheet } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const CalendarComponent = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text }}>
        {t("calendar_component", "Calendar Component")}
      </Text>
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