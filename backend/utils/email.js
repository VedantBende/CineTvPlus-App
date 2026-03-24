import { google } from 'googleapis';

/**
 * Send an email using the Gmail REST API (Firewall Bypass).
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML body
 * @returns {Promise<object>} - Send result
 */
export async function sendEmail(to, subject, html) {
  try {
    const { GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;

    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
      console.warn('⚠️ Gmail API Credentials missing. Email NOT sent.');
      return { success: false, error: 'Gmail API not configured' };
    }

    console.log(`🌐 Gmail API: Preparing message for ${to}...`);

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create the raw email message (RFC 822 format)
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: "CineTv+" <${GMAIL_USER}>`,
      `To: ${to}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: ${utf8Subject}`,
      '',
      html,
    ];
    const message = messageParts.join('\n');

    // The Gmail API requires the message to be base64url encoded
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log(`📨 Sending via Gmail API (HTTPS/443)...`);
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`✅ Email sent successfully via API to ${to} (id: ${res.data.id})`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error(`❌ Gmail API Error for ${to}:`, err.message);
    // Log helpful context for OAuth errors
    if (err.message.includes('invalid_grant')) {
      console.error('💡 TIP: Your Gmail Refresh Token might be expired or revoked.');
    }
    return { success: false, error: err.message };
  }
}
