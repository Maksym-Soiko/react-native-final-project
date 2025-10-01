import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import * as offenseApi from "../api/offenseApi";

const DB_NAME = "app_data.db";
const STORAGE_KEY = "offenses_fallback";

let hasSQLite = true;
try {
  SQLite.openDatabase(DB_NAME);
} catch (e) {
  hasSQLite = false;
}

function getDb() {
  return SQLite.openDatabase(DB_NAME);
}

export async function initOffensesTable() {
  if (!hasSQLite) {
    return;
  }
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS offenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            photo_path TEXT,
            category TEXT,
            latitude REAL,
            longitude REAL,
            created_at TEXT NOT NULL
          );`
        );
      },
      (err) => reject(err),
      () => resolve()
    );
  });
}

export async function insertOffense({
  description,
  photo_uri,
  created_at,
  category,
  latitude,
  longitude,
}) {
  if (!hasSQLite) {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const newId = arr.length ? Math.max(...arr.map((r) => r.id)) + 1 : 1;
    const rec = {
      id: newId,
      description,
      photo_uri: photo_uri || null,
      category: category ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      created_at,
    };
    arr.push(rec);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    return newId;
  }

  return new Promise((resolve, reject) => {
    const db = getDb();
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO offenses (description, photo_path, category, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, ?);`,
          [
            description,
            photo_uri || null,
            category ?? null,
            latitude ?? null,
            longitude ?? null,
            created_at,
          ],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (err) => reject(err)
    );
  });
}

export async function getAllOffenses() {
  if (!hasSQLite) {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return arr
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((r) => ({
        ...r,
        category: r.category ?? null,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null,
      }));
  }

  return new Promise((resolve, reject) => {
    const db = getDb();
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT id, description, photo_path, category, latitude, longitude, created_at FROM offenses ORDER BY datetime(created_at) DESC;`,
          [],
          (_, { rows }) => {
            const data = [];
            for (let i = 0; i < rows.length; i++) {
              data.push({
                id: rows.item(i).id,
                description: rows.item(i).description,
                photo_uri: rows.item(i).photo_path || null,
                category: rows.item(i).category ?? null,
                latitude: rows.item(i).latitude ?? null,
                longitude: rows.item(i).longitude ?? null,
                created_at: rows.item(i).created_at,
              });
            }
            resolve(data);
          },
          (_, error) => reject(error)
        );
      },
      (err) => reject(err)
    );
  });
}

export async function clearOffenses() {
  if (!hasSQLite) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const db = getDb();
      db.transaction(
        (tx) => {
          tx.executeSql(
            `DELETE FROM offenses;`,
            [],
            () => {
              tx.executeSql(
                `VACUUM;`,
                [],
                () => resolve(true),
                () => resolve(true)
              );
            },
            (_, error) => {
              console.error("clearOffenses delete error:", error);
              reject(error);
            }
          );
        },
        (err) => reject(err)
      );
    } catch (err) {
      reject(err);
    }
  });
}

export async function deleteLocalOffense(id) {
  if (!hasSQLite) {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const newArr = arr.filter((r) => String(r.id) !== String(id));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newArr));
    return;
  }

  return new Promise((resolve, reject) => {
    const db = getDb();
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM offenses WHERE id = ?;`,
          [id],
          () => resolve(true),
          (_, error) => reject(error)
        );
      },
      (err) => reject(err)
    );
  });
}

export async function getPendingOffenses() {
  return await getAllOffenses();
}

export async function syncPendingOffenses() {
  try {
    const pending = await getPendingOffenses();
    if (!Array.isArray(pending) || pending.length === 0) return;
    for (const p of pending) {
      try {
        const payload = {
          description: p.description,
          category: p.category ?? "",
          photoUrl: p.photo_uri ?? p.photoUrl ?? null,
          dateTime: p.created_at ?? new Date().toISOString(),
          location: {
            lat: p.latitude ?? null,
            lng: p.longitude ?? null,
          },
        };
        await offenseApi.createOffense(payload);
        await deleteLocalOffense(p.id);
        DeviceEventEmitter.emit("offense_added", {
          latitude: payload.location.lat,
          longitude: payload.location.lng,
        });
      } catch (itemErr) {
        console.warn("syncPendingOffenses: failed to sync item", p.id, itemErr);
      }
    }
  } catch (e) {
    console.warn("syncPendingOffenses failed", e);
  }
}