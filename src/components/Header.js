import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Header({ currentDate, prevMonth, nextMonth, goToToday, isLandscape }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

	const monthNames = t("month_names", { returnObjects: true }) || ["January", "February",
		"March", "April", "May", "June", "July", "August", "September", "October",
    "November", "December" ];
  const weekDays = t("week_days", { returnObjects: true }) || [ "Mon", "Tue", "Wed", "Thu",
    "Fri", "Sat", "Sun" ];

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.card, borderColor: theme.divider },
        ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.text }]}>
            {monthNames[new Date(currentDate).getMonth()]}{" "}
            {new Date(currentDate).getFullYear()}
          </Text>
          <View style={styles.arrowContainer}>
            <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
              <Text style={[styles.button, { color: theme.text }]}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
              <Text style={[styles.button, { color: theme.text }]}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={goToToday} style={styles.todayCard}>
          <Text style={[styles.todayButton, { color: "tomato" }]}>
            {t("today", "Today")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekDaysContainer}>
        {weekDays.map((d, i) => (
          <View key={i} style={styles.dayContainer}>
            <Text style={[styles.dayText, { color: theme.text }]}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  landscapeContainer: {
    marginLeft: 30,
  },
  headerCard: {
    width: "100%",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowBtn: {
    paddingHorizontal: 6,
  },
  button: {
    fontSize: 18,
  },
  todayCard: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayButton: {
    fontSize: 14,
    fontWeight: "700",
  },
  weekDaysContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    maxWidth: 400,
    width: "100%",
  },
  dayContainer: {
    width: "14%",
    alignItems: "center",
    paddingVertical: 6,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "700",
  },
});