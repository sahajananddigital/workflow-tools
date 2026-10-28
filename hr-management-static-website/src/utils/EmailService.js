
import { DatabaseService } from '../db/database';

export const EmailService = {
    // Send email using the configured service
    async sendEmail(to, subject, body, attachments = [], htmlBody = null) {
        const service = DatabaseService.getSetting('emailService') || 'mailto';

        if (service === 'gmail_api') {
            return this.sendViaGmailAPI(to, subject, body, attachments);
        } else if (service === 'google_apps_script') {
            return this.sendViaGAS(to, subject, body, htmlBody);
        } else {
            return this.sendViaMailto(to, subject, body);
        }
    },

    // 1. Mailto Fallback (Basic)
    sendViaMailto(to, subject, body) {
        // Mailto cannot handle attachments or HTML body well, works for simple text
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        window.location.href = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
        return { success: true, message: 'Opened default email client' };
    },

    // 2. Gmail API (Advanced) - Stub for now
    async sendViaGmailAPI(to, subject, body, attachments) {
        const token = DatabaseService.getSetting('gmailToken');
        if (!token) {
            return { success: false, message: 'Gmail Access Token is missing in Settings.' };
        }

        // Note: Real implementation would require converting message to Base64URL RFC 2822 format
        // and making a POST request to https://gmail.googleapis.com/gmail/v1/users/me/messages/send

        console.log("Mock Gmail Send:", { to, subject, body, attachments });
        return { success: false, message: 'Direct Gmail API sending is not fully implemented in this demo. Please use "mailto" or check console for mock data.' };
    },

    // 3. Google Apps Script Web App
    async sendViaGAS(to, subject, body, htmlBody) {
        const scriptUrl = DatabaseService.getSetting('gasScriptUrl');
        if (!scriptUrl) {
            alert('Please configure Google Apps Script URL in Settings');
            return { success: false, message: 'script_url_missing' };
        }

        try {
            await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors', // standard for GAS web apps usually
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'sendEmail',
                    to,
                    subject,
                    body,
                    htmlBody
                })
            });
            return { success: true, message: 'Email request sent to GAS' };
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Failed to send via GAS' };
        }
    }
};
