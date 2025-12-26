import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/resumepro.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

export function initDatabase() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      firebase_uid TEXT UNIQUE,
      subscription_tier TEXT DEFAULT 'free',
      subscription_expires_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  const userColumns = db.prepare('PRAGMA table_info(users)').all();
  const hasFirebaseUid = userColumns.some(column => column.name === 'firebase_uid');
  if (!hasFirebaseUid) {
    db.exec('ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE');
  }

  // Resumes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      parsed_data TEXT,
      template_id TEXT DEFAULT 'premium_professional',
      template_config TEXT,
      is_favorite INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      company TEXT,
      url TEXT,
      description TEXT NOT NULL,
      parsed_data TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Analyses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      resume_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      overall_score INTEGER,
      skills_score INTEGER,
      experience_score INTEGER,
      keyword_score INTEGER,
      analysis_data TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `);

  // Exports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      resume_id INTEGER NOT NULL,
      format TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )
  `);

  // Daily metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_metrics (
      day TEXT PRIMARY KEY,
      visits INTEGER DEFAULT 0,
      resumes_uploaded INTEGER DEFAULT 0,
      optimized_resumes INTEGER DEFAULT 0,
      exports_pdf INTEGER DEFAULT 0,
      exports_docx INTEGER DEFAULT 0
    )
  `);

  // Daily unique visitors table (hashed)
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_unique_visitors (
      day TEXT NOT NULL,
      visitor_key TEXT NOT NULL,
      PRIMARY KEY (day, visitor_key)
    )
  `);

  console.log('✅ Database initialized successfully');
}
