import { useEffect, useState, useContext } from "react";
import { Text } from "react-native";
import { Snackbar } from "react-native-paper";
import { registerToastHandler, unregisterToastHandler } from "../utils/toast";
import { ThemeContext } from "./ThemeContext";

export default function ToastProvider({ children }) {
  const { theme } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    registerToastHandler((msg) => {
      setMessage(String(msg ?? ""));
      setVisible(true);
    });
    return () => {
      unregisterToastHandler();
    };
  }, []);

  return (
    <>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        action={{ label: "OK", onPress: () => setVisible(false) }}
        duration={7000}
        style={{
          backgroundColor: theme.card,
          borderRadius: 8,
          marginHorizontal: 16,
        }}
        theme={{
          colors: {
            surface: theme.card,
            onSurface: theme.text,
            primary: "tomato",
          },
        }}>
        <Text style={{ color: theme.text }}>{message}</Text>
      </Snackbar>
    </>
  );
}