import nodemailer from 'nodemailer';
import net from 'net';

let transporter;

/**
 * Diagnostic: Check if we can reach Gmail's SMTP server on Port 587
 */
async function testSMTPConnection() {
  return new Promise((resolve) => {
    console.log('🔍 Diagnostic: Testing connection to smtp.gmail.com:587...');
    const socket = net.createConnection(587, 'smtp.gmail.com');
    
    socket.setTimeout(5000); // 5s timeout for the raw socket

    socket.on('connect', () => {
      console.log('✅ Diagnostic SUCCESS: Port 587 is REACHABLE from this network.');
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.warn('❌ Diagnostic TIMEOUT: Port 587 is blocked or unresponsive.');
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      console.error(`❌ Diagnostic ERROR: ${err.message}`);
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Send an email using Nodemailer and Gmail SMTP.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML body
 * @returns {Promise<object>} - Send result
 */
export async function sendEmail(to, subject, html) {
  try {
    // Run pre-flight diagnostic on first call or if it failed before
    if (!transporter) {
      await testSMTPConnection();
    }

    // Lazy initialization to ensure process.env variables are available
    if (!transporter && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('⚙️ Initializing Nodemailer transporter (Port 587, IPv4, Debug ON)...');
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        family: 4, // Force IPv4 to avoid ENETUNREACH errors on Render
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        tls: {
          // Do not fail on invalid certificates
          rejectUnauthorized: false,
        },
        // Debugging & Timeouts
        logger: true,
        debug: true,
        connectionTimeout: 10000, // 10s
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
    }

    if (!transporter) {
      console.warn(`⚠️ Email NOT sent to ${to}: GMAIL_USER or GMAIL_APP_PASSWORD is missing.`);
      return { success: false, error: 'Email client not initialized' };
    }

    const mailOptions = {
      from: `"CineTv+" <${process.env.GMAIL_USER}>`, 
      to,
      subject,
      html,
    };

    console.log(`📨 Attempting to send email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to} (id: ${info.messageId})`);
    return { success: true, data: info };
  } catch (err) {
    console.error(`❌ Email send exception to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}
