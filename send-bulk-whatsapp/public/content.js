// WA Bulk Sender - Content Script
// v0.2.18 - Clipboard Image & Separate Messages

const SELECTORS = {
    chatList: '#pane-side',
    searchBox: 'div[contenteditable="true"][data-tab="3"]',
    messageBox: '#main footer div[contenteditable="true"][role="textbox"]',
    sendButton: '#main footer span[data-icon="send"]',
    // Expanded Media Send Selectors
    mediaSendButton: [
        'span[data-icon="send"]',
        'span[data-icon="send-light"]',
        'span[data-icon="wds-ic-send-filled"]',
        'div[role="button"][aria-label="Send"]',
        'div[role="button"][aria-label="send"]',
        'span[data-icon="send-inverted"]'
    ].join(',')
};

const WABulk = {
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),

    base64ToBlob(base64) {
        const parts = base64.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    },

    async waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) return resolve(document.querySelector(selector));
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found`));
            }, timeout);
        });
    },

    async waitForElementToDisappear(element, timeout = 10000) {
        return new Promise((resolve) => {
            if (!document.body.contains(element)) return resolve();
            const observer = new MutationObserver(() => {
                if (!document.body.contains(element)) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                resolve(); // Resume anyway after timeout
            }, timeout);
        });
    },

    async findContact(phone) {
        const searchBox = document.querySelector(SELECTORS.searchBox);
        if (!searchBox) throw new Error("Search box not found");
        searchBox.focus();
        document.execCommand('insertText', false, phone);
        await this.sleep(2000);
    },

    async sendMessage(text, imageBase64) {
        console.log("Starting sendMessage...");
        let messageBox = await this.waitForElement(SELECTORS.messageBox);
        messageBox.focus();

        // 0. CLEAR BOX
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        await this.sleep(300);

        // 1. Send Image (if exists)
        if (imageBase64) {
            console.log("Processing Image via Clipboard...");
            await this.pasteAndSendImage(imageBase64, messageBox);
            await this.sleep(1000); // Buffer between messages
        }

        // 2. Send Text (if exists) via separate message
        if (text) {
            console.log("Processing Text Message...");
            // Re-focus message box as it might have been lost
            messageBox = await this.waitForElement(SELECTORS.messageBox);
            messageBox.focus();

            // Ensure clear again
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);

            await this.sendTextMessage(text, messageBox);
        }
    },

    async pasteAndSendImage(base64, messageBox) {
        try {
            // A. Create File
            const blob = this.base64ToBlob(base64);
            const ext = blob.type.split('/')[1] || 'png';
            const fileName = `image.${ext}`;
            const file = new File([blob], fileName, { type: blob.type });

            // B. Paste
            console.log("Dispatching paste event...");
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            messageBox.dispatchEvent(new ClipboardEvent('paste', {
                bubbles: true, cancelable: true, clipboardData: dataTransfer
            }));

            // C. Wait for Modal
            console.log("Waiting for Preview Modal...");
            let modal = null;
            for (let i = 0; i < 30; i++) { // 12 seconds max
                modal = document.querySelector('div[data-animate-modal-popup="true"]');

                // Backup check via Send button visibility
                if (!modal) {
                    const sends = document.querySelectorAll(SELECTORS.mediaSendButton);
                    for (const btn of sends) {
                        if (!btn.closest('#pane-side') && !btn.closest('footer') && btn.offsetParent) {
                            modal = btn.closest('div[role="dialog"]') || btn.closest('.app-wrapper-web > div');
                            if (modal) break;
                        }
                    }
                }

                if (modal) break;
                await this.sleep(400);
            }

            if (!modal) throw new Error("Media Preview Modal did not appear after paste.");
            console.log("Modal found.");
            await this.sleep(500); // Stability wait

            // D. Click Send in Modal
            console.log("Finding Send button in modal...");
            const sendIcons = document.querySelectorAll(SELECTORS.mediaSendButton);
            let sendBtn = null;

            // Iterate backwards to find the one ON TOP (likely the modal one)
            for (let i = sendIcons.length - 1; i >= 0; i--) {
                const btn = sendIcons[i];
                if (btn.offsetParent !== null && !btn.closest('#pane-side') && !btn.closest('#main footer')) {
                    sendBtn = btn;
                    break;
                }
            }

            if (!sendBtn) throw new Error("Send button not found in modal.");

            sendBtn.click();
            console.log("Clicked Modal Send.");

            // E. Wait for Modal to Close (Confirm Sent)
            await this.waitForElementToDisappear(modal, 15000);
            console.log("Modal closed, image sent.");

        } catch (err) {
            console.error("Paste Image Failed:", err);
            throw err;
        }
    },

    async sendTextMessage(text, messageBox) {
        console.log("Pasting text...");
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', text);
        messageBox.dispatchEvent(new ClipboardEvent('paste', {
            bubbles: true, cancelable: true, clipboardData: dataTransfer
        }));

        // Also trigger input just in case
        messageBox.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
        await this.sleep(800);

        console.log("Clicking Main Send...");
        let sendBtn = document.querySelector(SELECTORS.sendButton);
        if (!sendBtn) {
            console.warn("Send button not found, trying Enter key...");
            const event = new KeyboardEvent('keydown', {
                bubbles: true, cancelable: true, keyCode: 13, which: 13, key: 'Enter'
            });
            messageBox.dispatchEvent(event);
        } else {
            sendBtn.click();
        }
        console.log("Text sent.");
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SEND_MESSAGE") {
        WABulk.sendMessage(request.text, request.image)
            .then(() => sendResponse({ status: 'success' }))
            .catch(err => sendResponse({ status: 'error', message: err.message }));
        return true;
    }
    if (request.action === "PING") sendResponse({ status: 'pong' });
});
