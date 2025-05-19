import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

export async function initDatabase(existingData?: Uint8Array) {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `./sql-wasm.wasm`
    });
  }
  db = existingData ? new SQL.Database(existingData) : new SQL.Database();
  return db;
}

export function runQuery(sql: string, params: any[] = []): any[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function exec(sql: string): void {
  if (!db) throw new Error('Database not initialized');
  db.run(sql);
}

export function exportDatabase(): Uint8Array {
  if (!db) throw new Error('Database not initialized');
  return db.export();
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export async function initAndSeedDatabase(existingData?: Uint8Array) {
  await initDatabase(existingData);
  // Create tables if they don't exist
  exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`);
  exec(`CREATE TABLE IF NOT EXISTS fitnessData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    steps INTEGER,
    calories INTEGER,
    distance REAL,
    water REAL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );`);

  // Seed default user if not exists
  const users = runQuery('SELECT * FROM users WHERE email = ?', ['user@app.local']);
  if (users.length === 0) {
    exec(`INSERT INTO users (email, password_hash, created_at, updated_at) VALUES ('user@app.local', 'password123', datetime('now'), datetime('now'));`);
  }
}

export function clearDatabase(): void {
  if (!db) throw new Error('Database not initialized');
  exec('DELETE FROM fitnessData');
  exec("DELETE FROM users WHERE email != 'user@app.local'");
} 