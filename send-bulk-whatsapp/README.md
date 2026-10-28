# Bulk WhatsApp Sender 🚀

A privacy-focused, client-side application to send bulk WhatsApp messages with support for **Spintax**, **Variables**, **Image Attachments**, and **Anti-Ban Protection**. Use it to manage contacts and orchestrate campaigns directly from your browser.

## Features ✨

- **🛡️ 100% Client-Side**: No data leaves your browser. Privacy first.
- **📂 Contact Import**: Support for CSV and Excel (`.xlsx`) files.
- **🔄 Spintax Support**: Rotate message variations (e.g., `{Hi|Hello|Hey}`) to avoid spam detection.
- **🎨 Dynamic Variables**: Inject data like names directly into messages (`Hello {name}`).
- **📸 Media Support**: Auto-copy images to clipboard for easy pasting (`Ctrl+V`) into chats.
- **⏱️ Smart Delays**: Random delays between messages to mimic human behavior.
- **🆔 Anti-Spam IDs**: Optional random ID appending to ensure message uniqueness.
- 🔥 Account Warmer (Beta): Build reputation by simulating natural conversations with safe contacts.

## Installation 🛠️

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahajananddigital/send-bulk-whatsapp.git
   cd send-bulk-whatsapp
   ```

2. **Install Dependencies & Build**
   ```bash
   npm install
   npm run build
   ```

3. **Load into Chrome**
   - Open Chrome and go to `chrome://extensions`.
   - Enable **Developer Mode** (toggle in top right).
   - Click **Load Unpacked**.
   - Select the `dist` folder created in step 2.

## Usage Guide 📖

### 1. Open the Extension
- Pin the "WA Bulk Sender" icon to your toolbar.
- Click the icon to open the Dashboard.

### 2. Import Contacts
- Go to the **Contacts** tab.
- Upload a `.csv` or `.xlsx` file.
- **Required Columns**: `Name`, `Phone`.

### 3. Create Campaign
- Go to the **Campaign** tab.
- **Write Message**: Use `{name}` and Spintax `{Hi|Hello}`.
- **Attach Media**: Click to upload an image.
- **Start**: Click "Start Campaign".
  - The extension will open WhatsApp Web.
  - It will automatically navigate to each contact, attach the image (drag & drop simulation), and send the message.
  - **Do not close the WhatsApp tab** while it runs.

### 4. Account Warmer (Beta)
- Go to the **Warmer** tab.
- This tool simulates safe conversations to build account reputation.
- (Coming Soon features will be enabled here).

## Important Notes ⚠️

- **WhatsApp Web Login**: You must be logged into WhatsApp Web in your browser.
- **Browser Permissions**: Allow Pop-ups for this site if prompted.
- **Rate Limits**: Do not send too many messages too quickly to avoid account bans. Use the **Warmer** tool to build reputation.

## Disclaimer ⚖️

This tool is for educational and legitimate bulk messaging purposes (e.g., client updates). **Do not use for spamming.** The developers are not responsible for any account bans or misuse.

## Known Issues 🐛
- **Image Attachment**: On some versions of WhatsApp Web, the "Attach Image" function may fail to open the file picker or preview modal. If this happens, text messages will still be sent. We are actively investigating this.

## Contributing 🤝

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started with setting up the project and submitting pull requests.

## License 📄

MIT License
