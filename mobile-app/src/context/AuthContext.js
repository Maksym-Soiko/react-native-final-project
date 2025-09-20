import { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER = "CURRENT_USER";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CURRENT_USER);
        if (raw) setUserState(JSON.parse(raw));
      } catch (e) {
        console.warn("AuthProvider load user failed", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setUser = async (u) => {
    try {
      if (u) {
        await AsyncStorage.setItem(CURRENT_USER, JSON.stringify(u));
        setUserState(u);
      } else {
        await AsyncStorage.removeItem(CURRENT_USER);
        setUserState(null);
      }
    } catch (e) {
      console.warn("AuthProvider setUser failed", e);
      setUserState(u || null);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER);
    } catch (e) {
      console.warn("AuthProvider logout remove failed", e);
    } finally {
      setUserState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;