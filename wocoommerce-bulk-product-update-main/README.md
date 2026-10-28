# WooCommerce Bulk Product Editor

[![Live App](https://img.shields.io/badge/Live-App-blue?style=for-the-badge&logo=react)](https://sahajananddigital.github.io/wocoommerce-bulk-product-update/)
[![Documentation](https://img.shields.io/badge/Documentation-Read_Docs-green?style=for-the-badge&logo=googledocs)](https://sahajananddigital.github.io/wocoommerce-bulk-product-update/docs/)

A modern, high-performance React application for bulk editing WooCommerce products. Built with **Vite**, **TypeScript**, and **TanStack Table**, designed to mimic the native WordPress Admin interface while providing a spreadsheet-like experience.

## 🔗 Live Links

-   **Application**: [Launch App](https://sahajananddigital.github.io/wocoommerce-bulk-product-update/)
-   **Documentation**: [View Docs](https://sahajananddigital.github.io/wocoommerce-bulk-product-update/docs/)

## 🚀 Features

-   **Native UI**: Designed to look and feel like WordPress Admin (Gutenberg styling).
-   **Bulk Editing**: Efficiently manage hundreds of products.
-   **Inline Editing**: Edit Name, SKU, Price, Sale Price, and Stock directly in the table.
-   **Rich Text Editor**: Integrated **Visual/HTML** editor for Product Descriptions and Short Descriptions.
-   **Meta Fields**: Manage custom meta keys for products.
-   **Bulk Actions**: Update status (Publish/Draft) and stock status for multiple items at once.
-   **Secure**: Client-side authentication using WooCommerce REST API keys (stored locally).
-   **Safe**: All inputs are sanitized to prevent XSS.

## 🛠️ Tech Stack

-   **Framework**: React 19, TypeScript, Vite
-   **State & Data**: TanStack Query (React Query)
-   **Table Architecture**: TanStack Table
-   **Styling**: Vanilla CSS with WordPress Admin variables, Tailwind Merge
-   **Editor**: React Quill New
-   **HTTP**: Axios
-   **Testing**: Vitest

## 🏃‍♂️ Getting Started

### Prerequisites

-   Node.js (v18+)
-   A WooCommerce Store (with REST API enabled)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sahajananddigital/wocoommerce-bulk-product-update.git
    cd wocoommerce-bulk-product-update
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 📖 Documentation

Full documentation is available in the [docs](./docs) directory or online at the `/docs` path of the deployed application.

To run the documentation site locally:
```bash
npm run docs:dev
```

## 🚢 Deployment

The project is configured for **GitHub Pages**.

To deploy the application and documentation:

```bash
npm run deploy
```

This command builds the application and the documentation, combines them, and pushes to the `gh-pages` branch.
