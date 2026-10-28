import initSqlJs from 'sql.js';
import sqlWasmUrl from '/sql-wasm.wasm?url';

let fileHandle = null;
let db = null;

// Initialize sql.js
const SQLPromise = initSqlJs({
  locateFile: () => sqlWasmUrl
});

export const DatabaseService = {
  // Open a file from disk
  async openDatabase() {
    try {
      [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'SQLite Database',
          accept: { 'application/x-sqlite3': ['.sqlite', '.db'] }
        }]
      });

      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const SQL = await SQLPromise;
      db = new SQL.Database(new Uint8Array(arrayBuffer));

      this.runMigrations(); // Ensure schema is up to date
      return { success: true, name: file.name };
    } catch (error) {
      console.error("Error opening DB:", error);
      if (error.name === 'AbortError') return { success: false, aborted: true };
      throw error;
    }
  },

  // Create a new empty database
  async createDatabase() {
    const SQL = await SQLPromise;
    db = new SQL.Database();
    this.runMigrations(); // Apply initial schema
    return { success: true, name: 'New Database' };
  },

  // --- Migration System ---
  runMigrations() {
    if (!db) return;

    db.run(`CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);

    let currentVersion = 0;
    try {
      const result = db.exec("SELECT MAX(version) as v FROM schema_migrations");
      if (result.length > 0 && result[0].values.length > 0 && result[0].values[0][0] !== null) {
        currentVersion = result[0].values[0][0];
      }
    } catch (e) {
      console.warn("Could not fetch schema version, assuming 0");
    }

    const migrations = [
      {
        version: 1,
        up: `
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id TEXT UNIQUE,
            name TEXT,
            type TEXT,
            which_role TEXT,
            phone TEXT,
            email TEXT,
            start_date TEXT,
            payment_amount TEXT,
            amount_in_text TEXT,
            account_number TEXT,
            ifsc TEXT,
            branch_name TEXT
        );
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
        `
      },
      {
        version: 2,
        up: `
        ALTER TABLE employees ADD COLUMN pan TEXT;
        ALTER TABLE employees ADD COLUMN uan TEXT;
        ALTER TABLE employees ADD COLUMN bank_name TEXT;
        `
      }
    ];

    // Add new migration for Payroll History
    migrations.push({
      version: 3,
      up: `
      CREATE TABLE IF NOT EXISTS payroll_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          emp_id TEXT,
          month TEXT, -- YYYY-MM
          generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          basic REAL,
          hra REAL,
          special REAL,
          pf REAL,
          pt REAL,
          tds REAL,
          net_pay REAL
      );
      `
    });

    let migrationApplied = false;
    migrations.forEach(migration => {
      if (migration.version > currentVersion) {
        console.log(`Applying migration v${migration.version}...`);
        try {
          db.exec(migration.up); // use exec for multiple statements if needed
          db.run("INSERT INTO schema_migrations (version) VALUES (?)", [migration.version]);
          migrationApplied = true;
        } catch (e) {
          // Ignore Duplicate column errors if re-running (rare with versioning)
          console.error(`Migration v${migration.version} failed:`, e);
        }
      }
    });

    if (migrationApplied) {
      console.log("Migrations applied.");
    }
  },

  getSetting(key) {
    if (!db) return null;
    try {
      const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
      stmt.bind([key]);
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject().value;
      }
      stmt.free();
      return result;
    } catch (e) {
      console.warn(`Error getting setting ${key}:`, e);
      return null;
    }
  },

  saveSetting(key, value) {
    if (!db) return;
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
  },

  // Save changes back to the file handle
  async saveDatabase() {
    if (!db) return;
    const data = db.export();

    if (fileHandle) {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(data);
        await writable.close();
        return { success: true };
      } catch (e) {
        console.error("Save failed:", e);
        // Fallback to download if permission denied or handle invalid
        this.downloadDatabase();
        return { success: false, message: "Saved via download (direct write failed)" };
      }
    } else {
      await this.saveAsNew(data);
      return { success: true };
    }
  },

  async saveAsNew(data = null) {
    if (!db && !data) return;
    if (!data) data = db.export();

    try {
      const handle = await window.showSaveFilePicker({
        types: [{
          description: 'SQLite Database',
          accept: { 'application/x-sqlite3': ['.sqlite'] }
        }],
      });
      fileHandle = handle;
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    } catch (e) {
      console.error("Save As failed", e);
      if (e.name !== 'AbortError') this.downloadDatabase(data);
    }
  },

  // Backup/Download
  downloadDatabase(data = null) {
    if (!db && !data) return;
    if (!data) data = db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr_backup_${new Date().toISOString().slice(0, 10)}.sqlite`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Execute Query
  exec(sql, params = []) {
    if (!db) throw new Error("Database not initialized");
    return db.exec(sql, params);
  },

  // Run query with binding and return rows as objects
  query(sql, params = []) {
    if (!db) throw new Error("Database not initialized");
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  },

  run(sql, params = []) {
    if (!db) throw new Error("Database not initialized");
    db.run(sql, params);
    this.saveDatabase().catch(err => console.error("Auto-save failed:", err));
    return true;
  }
};
