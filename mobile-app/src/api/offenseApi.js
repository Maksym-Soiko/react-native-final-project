import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllOffenses } from "../db/database";

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

function distanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    !isFinite(lat1) ||
    !isFinite(lon1) ||
    !isFinite(lat2) ||
    !isFinite(lon2)
  )
    return Infinity;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
  try {
    const res = await axiosInstance.get(
      `/offenses/date/${encodeURIComponent(isoDate)}`
    );
    return res.data;
  } catch (err) {
    if (!err?.response) {
      try {
        const all = await getAllOffenses();
        const target = String(isoDate ?? "").slice(0, 10);
        const mapped = (all || [])
          .filter((r) => {
            try {
              const d = new Date(r.created_at || r.dateTime || "");
              const dd = d.toISOString().slice(0, 10);
              return dd === target;
            } catch (e) {
              return false;
            }
          })
          .map((r) => ({
            id: r.id,
            description: r.description,
            category: r.category,
            photoUrl: r.photo_uri ?? r.photoUrl ?? null,
            dateTime: r.created_at ?? r.dateTime,
            location:
              r.latitude != null && r.longitude != null
                ? { lat: r.latitude, lng: r.longitude }
                : { lat: null, lng: null },
          }));
        return mapped;
      } catch (e) {
        console.warn("Local fallback getByDate failed", e);
        throw err;
      }
    }
    throw err;
  }
}

export async function getDates() {
  try {
    const res = await axiosInstance.get("/offenses/dates");
    return res.data;
  } catch (err) {
    if (!err?.response) {
      try {
        const all = await getAllOffenses();
        const set = new Set();
        (all || []).forEach((r) => {
          try {
            const d = new Date(r.created_at || r.dateTime || "");
            const dd = d.toISOString().slice(0, 10);
            set.add(dd);
          } catch (e) {}
        });
        return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
      } catch (e) {
        console.warn("Local fallback getDates failed", e);
        throw err;
      }
    }
    throw err;
  }
}

export async function getByLocation(lat, lng, radius) {
  try {
    const res = await axiosInstance.get("/offenses/location", {
      params: { lat, lng, radius },
    });
    return res.data;
  } catch (err) {
    if (!err?.response) {
      try {
        const all = await getAllOffenses();
        const rKm = Number(radius) || 1;
        const mapped = (all || [])
          .map((r) => ({
            id: r.id,
            description: r.description,
            category: r.category,
            photoUrl: r.photo_uri ?? r.photoUrl ?? null,
            dateTime: r.created_at ?? r.dateTime,
            latitude: r.latitude ?? null,
            longitude: r.longitude ?? null,
          }))
          .filter(
            (it) =>
              it.latitude != null &&
              it.longitude != null &&
              isFinite(Number(it.latitude)) &&
              isFinite(Number(it.longitude)) &&
              distanceKm(lat, lng, Number(it.latitude), Number(it.longitude)) <=
                rKm
          )
          .map((r) => ({
            id: r.id,
            description: r.description,
            category: r.category,
            photoUrl: r.photoUrl,
            dateTime: r.dateTime,
            location: { lat: r.latitude, lng: r.longitude },
          }));
        return mapped;
      } catch (e) {
        console.warn("Local fallback getByLocation failed", e);
        throw err;
      }
    }
    throw err;
  }
}
