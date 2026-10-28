# Getting Started

## Introduction

The **WooCommerce Bulk Product Editor** is a React-based application designed to streamline the management of your WooCommerce store inventory. It provides a fast, responsive table interface that mimics the familiar WordPress Admin styling but offers superior performance and usability.

## Prerequisites

Before you begin, ensure you have:

*   A **WooCommerce** store (version 3.5+).
*   **WordPress Application Passwords** enabled (for authentication).
*   **Node.js** (v18 or higher) installed on your computer.

## Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/sahajananddigital/wocoommerce-bulk-product-update.git
    cd wocoommerce-bulk-product-update
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Local Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Connecting to Your Store

1.  Open the application in your browser.
2.  You will see a **Login** screen.
3.  **Store URL**: Enter your full website URL (e.g., `https://example.com`).
4.  **Consumer Key / Secret**:
    *   Go to your WordPress Admin -> WooCommerce -> Settings -> Advanced -> REST API.
    *   Click **Add key**.
    *   Permissions: **Read/Write**.
    *   Generate the key and copy the Consumer Key and Consumer Secret.
5.  Paste the credentials into the app and click **Connect**.

> **Security Note**: Your credentials are stored locally in your browser's `localStorage` and are never sent to any third-party server. They are only used to communicate directly with your WooCommerce API.
