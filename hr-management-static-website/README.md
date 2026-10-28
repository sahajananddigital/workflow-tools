# HR Management System

A robust, offline-first HR Management System built with React and SQLite (WASM). Designed for Indian small businesses to manage employees, payroll (Payslips), and Offer Letters securely in the browser.

## Features

- **Offline-First Security**: Data is stored in a local `.sqlite` file on your machine. No cloud servers, no data privacy concerns.
- **Employee Management**: Add, view, and manage employee details.
- **Bulk Import**: Import employees easily via CSV.
- **Indian Payroll Compliance**:
  - Generate professional PDF Payslips.
  - Automatic calculation of Basic, HRA, and breakdown of Earnings/Deductions.
  - Month selection for historical record generation.
- **Offer Letters**: Generate standardized Offer Letters with company branding.
- **Custom Branding**: Upload your Company Logo and Details in Settings to reflect on all documents.
- **Database Backup**: One-click backup and restore.
- **Robustness**: Integrated Database Migrations to ensure future updates don't break your data.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd hr-management-system
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Open your browser to `http://localhost:5173`.

## 🚀 Quick Start Guide (Interactive Learning)

Follow these steps to master the tool in 5 minutes:

### 1. Setup Your Company 🏢
*   **Action**: Open the app and click **"Create New Database"**.
*   **Action**: Navigate to the **Settings** tab.
*   **Task**: Upload your **Company Logo** and fill in your **Address**.
    *   *Why?* This branding appears on all Payslips and Offer Letters.

### 2. Add Your First Employee 👤
*   **Action**: Go to **Employees** tab > **"Add Employee"**.
*   **Task**: Enter details for "John Doe".
    *   *Note*: The **Employee ID** is auto-generated but editable.
    *   *Tip*: Ensure you add an **Email** to test the mailing feature.

### 3. Run Payroll 💰
*   **Action**: Switch to the **Payroll** tab.
*   **Action**: Select "John Doe" using the checkbox.
*   **Task**: Click **"Download Payslips"**.
    *   *Result*: A professional PDF is generated and downloaded.
    *   *Result*: The system automatically saves this record to valid **Payroll History**.

### 4. Interactive Features ✨
*   **Email**: Click the **Email Icon** in the payroll row to open a pre-filled email draft.
*   **History**: Click the **History Icon** to see past salaries for that employee.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS.
- **Database**: `sql.js` (SQLite compiled to WebAssembly) for in-browser SQL database.
- **PDF Generation**: `jspdf` for client-side document creation.
- **Icons**: `lucide-react`.

## Contributing

This project uses a **Migration System** for database changes. If you modify the schema:
1.  Open `src/db/database.js`.
2.  Add a new migration object to the `migrations` array in `runMigrations()`.
3.  Increment the `version` number.
