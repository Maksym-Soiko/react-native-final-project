import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.0.101:3000";
const CURRENT_USER = "CURRENT_USER";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

function getAuthHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createOffense(payload, token = null) {
  let t = token;
  if (!t) {
    try {
      const raw = await AsyncStorage.getItem(CURRENT_USER);
      if (raw) {
        const u = JSON.parse(raw);
        t = u?.token ?? null;
      }
    } catch (e) {
      console.warn("Error reading token from storage:", e);
    }
  }
  const headers = getAuthHeader(t);
  const res = await axiosInstance.post("/offenses", payload, { headers });
  return res.data;
}

export async function getByDate(isoDate) {
  const res = await axiosInstance.get(
    `/offenses/date/${encodeURIComponent(isoDate)}`
  );
  return res.data;
}

export async function getDates() {
  const res = await axiosInstance.get("/offenses/dates");
  return res.data;
}

export async function getByLocation(lat, lng, radius) {
  const res = await axiosInstance.get("/offenses/location", {
    params: { lat, lng, radius },
  });
  return res.data;
}
