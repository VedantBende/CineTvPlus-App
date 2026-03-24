import nodemailer from 'nodemailer';

let transporter;

/**
 * Send an email using Nodemailer and Gmail SMTP.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML body
 * @returns {Promise<object>} - Send result
 */
export async function sendEmail(to, subject, html) {
  try {
    // Lazy initialization to ensure process.env variables are available
    if (!transporter && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('⚙️ Initializing Nodemailer transporter...');
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    }

    if (!transporter) {
      console.warn(`⚠️ Email NOT sent to ${to}: GMAIL_USER or GMAIL_APP_PASSWORD is missing.`);
      return { success: false, error: 'Email client not initialized' };
    }

    const mailOptions = {
      from: `"CineTv+" <${process.env.GMAIL_USER}>`, // Branded sender name with your Gmail address
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to} (id: ${info.messageId})`);
    return { success: true, data: info };
  } catch (err) {
    console.error(`❌ Email send exception to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}
