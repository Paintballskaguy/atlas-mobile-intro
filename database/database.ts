import * as SQLite from 'expo-sqlite';

const DB_NAME = 'activities.db';

// Initialize database and create table
export async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steps INTEGER NOT NULL,
      date INTEGER NOT NULL
    );
  `);
  
  return db;
}

// Get all activities
export async function getAllActivities() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const activities = await db.getAllAsync('SELECT * FROM activities ORDER BY date DESC;');
  return activities;
}

// Insert new activity
export async function insertActivity(steps: number, date: number) {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const result = await db.runAsync(
    'INSERT INTO activities (steps, date) VALUES (?, ?);',
    steps,
    date
  );
  return result;
}

// Delete all activities
export async function deleteAllActivities() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const result = await db.runAsync('DELETE FROM activities;');
  return result;
}
