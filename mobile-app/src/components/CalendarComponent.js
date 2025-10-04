import { useState, useEffect, useContext } from "react";
import {View, StyleSheet, useWindowDimensions, FlatList, DeviceEventEmitter, StatusBar } from "react-native";
import moment from "moment";
import Header from "./Header";
import Day from "./Day";
import Offenses from "./Offenses";
import * as offenseApi from "../api/offenseApi";
import { ThemeContext } from "../context/ThemeContext";
import { showToast } from "../utils/toast";
import { syncPendingOffenses } from "../db/database";

export default function CalendarComponent() {
  const { theme } = useContext(ThemeContext);
  const [date, setDate] = useState(moment());
  const [taskCounts, setTaskCounts] = useState({});
  const [viewingDate, setViewingDate] = useState(new Date());
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const today = moment();
  const startOfMonth = date.clone().startOf("month");
  const endOfMonth = date.clone().endOf("month");
  const startOfCalendar = startOfMonth.clone().startOf("isoWeek");
  const endOfCalendar = endOfMonth.clone().endOf("isoWeek");

  const calendar = [];
  const day = startOfCalendar.clone();
  while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, "day")) {
    calendar.push(day.clone());
    day.add(1, "day");
  }

  useEffect(() => {
    (async () => {
      try {
        await syncPendingOffenses();
      } catch (e) {}
      await loadTaskCounts();
    })();
  }, []);

  useEffect(() => {
    const addedSub = DeviceEventEmitter.addListener(
      "offense_added",
      async () => {
        try {
          await loadTaskCounts();
          setViewingDate((d) => (d ? new Date(d) : new Date()));
        } catch (e) {
          console.warn("Error handling offense_added in CalendarComponent:", e);
        }
      }
    );

    const clearedSub = DeviceEventEmitter.addListener(
      "offenses_cleared",
      async () => {
        try {
          await loadTaskCounts();
          setViewingDate((d) => (d ? new Date(d) : new Date()));
        } catch (e) {
          console.warn(
            "Error handling offenses_cleared in CalendarComponent:",
            e
          );
        }
      }
    );

    return () => {
      try {
        addedSub.remove();
      } catch (e) {}
      try {
        clearedSub.remove();
      } catch (e) {}
    };
  }, [loadTaskCounts]);

  useEffect(() => {
    loadTaskCounts();
  }, [date]);

  const loadTaskCounts = async () => {
    try {
      const dates = await offenseApi.getDates();
      const counts = {};
      if (Array.isArray(dates)) {
        dates.forEach((d) => {
          const key = new Date(d).toDateString();
          counts[key] = (counts[key] || 0) + 1;
        });
      }
      setTaskCounts(counts);
    } catch (err) {
      console.warn("Failed to load task counts from backend:", err);
      setTaskCounts({});
      showToast(
        t(
          "server_unavailable",
          "Cannot reach server. Check your internet connection or try again later."
        )
      );
    }
  };

  const handlePrev = () => setDate(date.clone().subtract(1, "month"));
  const handleNext = () => setDate(date.clone().add(1, "month"));
  const handleToday = () => {
    setDate(moment());
    setViewingDate(new Date());
  };

  const normalizeToLocalDate = (d) => {
    const dt = new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  };

  const handleDayPress = (dayDate) =>
    setViewingDate(normalizeToLocalDate(dayDate));
  const handleDaySelect = (dayDate) =>
    setViewingDate(normalizeToLocalDate(dayDate));

  const formatDate = (dateObj) => {
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const DATA = [{ type: "calendar" }, { type: "offenses" }];

  const renderItem = ({ item }) => {
    if (item.type === "calendar") {
      return (
        <View
          style={[
            styles.calendarCard,
            { backgroundColor: theme.card, borderColor: theme.divider },
            isLandscape && styles.landscapeCalendarContainer,
          ]}>
          <View style={styles.calendar}>
            {calendar.map((dayItem, index) => (
              <Day
                key={index}
                date={dayItem.toDate()}
                currentMonth={dayItem.month() === date.month()}
                today={today.toDate()}
                onPress={handleDayPress}
                onSelect={handleDaySelect}
                hasTasks={
                  (taskCounts[dayItem.toDate().toDateString()] || 0) > 0
                }
                isSelected={
                  dayItem.toDate().toDateString() === viewingDate.toDateString()
                }/>
            ))}
          </View>
        </View>
      );
    }

    if (item.type === "offenses") {
      return (
        <Offenses
          viewingDate={viewingDate}
          formatDate={formatDate}
          refreshTaskCounts={loadTaskCounts}/>
      );
    }

    return null;
  };

  return (
    <>
      <StatusBar
        barStyle={theme?.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.card}/>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[
          styles.container,
          isLandscape && styles.landscapeContainer,
        ]}
        ListHeaderComponent={
          <Header
            currentDate={date.toDate()}
            prevMonth={handlePrev}
            nextMonth={handleNext}
            goToToday={handleToday}
            isLandscape={isLandscape}
          />
        }/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  landscapeContainer: {
    paddingTop: 8,
  },
  columnLayout: {
    flexDirection: "column",
    alignItems: "center",
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  landscapeCalendarContainer: {
    marginLeft: 30,
  },
  calendarCard: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 20,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 2,
    maxWidth: 340,
  },
});