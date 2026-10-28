# System Architecture

## Overview
This application is a Single Page Application (SPA) that acts as a wrapper around a local SQLite database. It leverages `sql.js` to run SQLite entirely in the browser memory, using the File System Access API (where supported) to read/write directly to a local file.

## Directory Structure

```
src/
├── components/       # UI Components
│   ├── EmployeeTable.jsx  # Main data grid & PDF generation logic
│   ├── EmployeeForm.jsx   # Add/Edit Modal
│   └── Settings.jsx       # Company config form
├── db/
│   └── database.js   # Core Database Layer (init, migrations, I/O)
├── utils/
│   ├── dbService.js  # Business Logic Layer (CRUD operations)
│   ├── csvParser.js  # CSV Import Utility
│   └── EmailService.js # Email logic (Stub/Mailto)
└── App.jsx           # Main Router & Layout
```

## Key Modules

### 1. Database Layer (`src/db/database.js`)
- **Wrapper**: Wraps `sql.js` methods.
- **Persistence**: Handles file I/O using the File System Access API.
- **Migrations**: Contains the `runMigrations()` system. It checks the `schema_migrations` table and applies versioned SQL scripts (e.g., `CREATE TABLE`, `ALTER TABLE`) sequentially. This ensures seamless upgrades.

### 2. Business Logic (`src/utils/dbService.js`)
- Acts as an ORM-lite.
- Maps UI objects (JSON) to SQL Queries.
- **Validation**: Ensures data integrity before insertion.
- **Bulk Import**: `importEmployees` handles parsing and batch insertion.

### 3. PDF Generator (`src/components/EmployeeTable.jsx`)
- Uses `jspdf`.
- **Dynamic Layout**: Calculates positions based on content length (e.g., text wrapping for addresses).
- **Compliance**: Formats currency (`Intl.NumberFormat('en-IN')`) and structure properly for Indian contexts.

## Testing Strategy
- **Unit Tests**: `vitest` is used for testing logic in `dbService.test.js` and components in `EmployeeTable.test.js`.
- **Mocking**: `sql.js` and `jspdf` are mocked to avoid binary/canvas dependencies during test runs.

## 🧠 AI & Developer Context (The "Brain")

This section helps AI agents and developers understand the core logic flow:

### Data Flow
1.  **User Action**: User clicks "Save Employee".
2.  **UI Component**: `EmployeeForm.jsx` validates and calls `onSave`.
3.  **App State**: `App.jsx` receives data and calls `DBService.addEmployee()`.
4.  **Business Logic**: `src/utils/dbService.js` prepares the SQL query (INSERT/UPDATE).
5.  **Database Layer**: `src/db/database.js` executes the SQL against the in-memory SQLite WASM instance.
6.  **Persistence**: `database.js` immediately triggers `saveDatabase()` to write the binary buffer back to the user's local disk via File System Access API.

### Key Schema Validation
*   Refer to `DATA_FIELDS.md` for the exact schema contract.
*   `dbService.js` enforces this schema mapping between UI objects and SQL columns.

## Future Roadmap
- **Email Integration**: Connect `EmailService.js` to a real Gmail API or backend service.
- **Role-Based Access**: Add user login if moving to a server-based model.
- **PWA Support**: Make it installable for offline use without `npm run dev`.
