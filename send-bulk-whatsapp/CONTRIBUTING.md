# Contributing to Bulk WhatsApp Sender

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to Bulk WhatsApp Sender. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Project Overview

Bulk WhatsApp Sender is a privacy-focused, client-side Chrome extension designed to automate WhatsApp messaging.
-   **Tech Stack**: React 18, Vite, TailwindCSS.
-   **Core Philosophy**: Privacy first. No user data leaves the browser.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (v9 or higher recommended)

### Installation

1.  **Fork and clone the repository**
    ```bash
    git clone https://github.com/YOUR-USERNAME/send-bulk-whatsapp.git
    cd send-bulk-whatsapp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

### Development Workflow

1.  **Start Dev Server** (for UI development outside extension context)
    ```bash
    npm run dev
    ```
    Note: Some extension-specific features (like `chrome.storage`) may not work fully in the standalone dev server.

2.  **Build the Extension**
    ```bash
    npm run build
    ```
    This creates a `dist` folder.

3.  **Load in Chrome**
    -   Go to `chrome://extensions/`
    -   Enable "Developer mode"
    -   Click "Load unpacked"
    -   Select the `dist` folder

## Project Structure

-   `src/components`: UI components (Cards, Buttons, Inputs, etc.)
-   `src/features`: Feature-specific logic (Warmer, Contacts, etc.)
-   `src/utils`: Utility functions (message processing, storage helpers)
-   `public`: Static assets and manifest.json

## Pull Request Process

1.  Create a feature branch from `main`: `git checkout -b feature/amazing-new-feature`.
2.  Make your changes.
3.  Ensure the project builds without errors: `npm run build`.
4.  Commit your changes with meaningful commit messages.
5.  Push to your fork and submit a Pull Request.

## Coding Standards

-   Use functional components with Hooks.
-   Use TailwindCSS for styling.
-   Keep components small and focused.
-   Ensure all logic remains client-side.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
