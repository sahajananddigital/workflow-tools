function doGet(e) {
    return ContentService.createTextOutput("HR System Backend Running");
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        if (data.action === 'sendEmail') {
            return sendEmail(data);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function sendEmail(data) {
    const { to, subject, body, htmlBody } = data;

    if (!to || !subject || !body) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing fields' }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    try {
        MailApp.sendEmail({
            to: to,
            subject: subject,
            body: body,
            htmlBody: htmlBody || body
        });

        return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Email sent' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
