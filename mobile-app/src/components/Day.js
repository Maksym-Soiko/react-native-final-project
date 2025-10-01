import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function Day({ date, currentMonth, today, onPress, onSelect,
  hasTasks, isSelected }) {
  const { themeName, theme } = useContext(ThemeContext);
  const isToday = date.toDateString() === new Date(today).toDateString();
  const isSelectedAndToday = isSelected && isToday;

  const handlePress = () => {
    if (typeof onSelect === "function") onSelect(date);
  };
  const handleLongPress = () => {
    if (typeof onPress === "function") onPress(date);
  };

  const accent = "tomato";
  const ringColor = themeName === "dark" ? "#FFD54F" : "#FFB300";
  const textColor = currentMonth
    ? isSelected
      ? "#fff"
      : theme.text
    : theme.divider;

  const indicatorColor = isSelected ? "#ffffff" : accent;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
      style={[styles.dayContainer]}>
      {(isSelected || (isToday && !isSelected) || isSelectedAndToday) && (
        <View
          style={[
            styles.selectionBox,
            isSelected && { backgroundColor: accent, borderWidth: 0 },
            isToday &&
              !isSelected && {
                borderWidth: 2,
                borderColor: ringColor,
                backgroundColor: "transparent",
              },
            isSelectedAndToday && {
              backgroundColor: accent,
            },
          ]}/>
      )}

      <Text
        style={[
          styles.dayText,
          { color: textColor, zIndex: 2 },
          isToday && !isSelected && { fontWeight: "700" },
          isSelected && styles.selectedDayText,
        ]}>
        {date.getDate()}
      </Text>

      {hasTasks && (
        <View
          style={[
            styles.taskIndicator,
            {
              backgroundColor: indicatorColor,
              borderColor: theme.card,
              borderWidth: 1,
              zIndex: 2,
            },
          ]}/>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    width: "14%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 8,
    marginVertical: 6,
  },
  dayText: {
    fontSize: 16,
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "700",
  },
  taskIndicator: {
    position: "absolute",
    top: 6,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectionBox: {
    position: "absolute",
    width: "84%",
    height: "84%",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
});