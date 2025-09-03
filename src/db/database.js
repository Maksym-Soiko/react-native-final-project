import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
          `INSERT INTO offenses (description, photo_path, category, created_at) VALUES (?, ?, ?, ?);`,
          [description, photo_uri || null, category ?? null, created_at],
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
      }));
  }

  return new Promise((resolve, reject) => {
    const db = getDb();
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT id, description, photo_path, category, created_at FROM offenses ORDER BY datetime(created_at) DESC;`,
          [],
          (_, { rows }) => {
            const data = [];
            for (let i = 0; i < rows.length; i++) {
              data.push({
                id: rows.item(i).id,
                description: rows.item(i).description,
                photo_uri: rows.item(i).photo_path || null,
                category: rows.item(i).category ?? null,
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