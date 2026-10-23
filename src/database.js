const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

function createDatabase(filename = path.join(__dirname, "..", "data", "urls.sqlite")) {
  if (filename !== ":memory:") {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  const db = new Database(filename);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      short_code TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const insert = db.prepare(
    "INSERT INTO urls (short_code, original_url) VALUES (?, ?)"
  );
  const findByCode = db.prepare(
    "SELECT short_code AS shortCode, original_url AS originalUrl, created_at AS createdAt FROM urls WHERE short_code = ?"
  );

  return {
    create(originalUrl, shortCode) {
      insert.run(shortCode, originalUrl);
      return findByCode.get(shortCode);
    },
    findByCode(shortCode) {
      return findByCode.get(shortCode);
    },
    close() {
      db.close();
    }
  };
}

module.exports = { createDatabase };
