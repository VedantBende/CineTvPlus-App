const APP_URL = process.env.FRONTEND_URL || 'https://cinetvplus.vercel.app';

/**
 * Returns the email subject and HTML body for a given status change.
 * @param {'approved'|'rejected'|'revoked'} status
 * @param {string} userName
 * @returns {{ subject: string, html: string }}
 */
export function getStatusEmailContent(status, userName) {
  const name = userName || 'User';

  const templates = {
    approved: {
      subject: 'Your CineTv+ Access Has Been Approved 🎉',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#141414;border-radius:12px;overflow:hidden;color:#fff;">
          <div style="background:linear-gradient(135deg,#e50914,#b20710);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:28px;letter-spacing:1px;">CineTv+</h1>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="margin:0 0 16px;color:#e50914;">Welcome, ${name}!</h2>
            <p style="font-size:16px;line-height:1.6;color:#ccc;">
              Great news! Your CineTv+ access request has been <strong style="color:#4ade80;">approved</strong>. 
              You now have full access to our premium streaming content.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${APP_URL}" style="background:#e50914;color:#fff;text-decoration:none;padding:14px 36px;border-radius:6px;font-weight:bold;font-size:16px;display:inline-block;">
                Start Watching Now
              </a>
            </div>
            <p style="font-size:13px;color:#888;text-align:center;">Enjoy your streaming experience!</p>
          </div>
        </div>
      `,
    },

    rejected: {
      subject: 'Your CineTv+ Access Request Update',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#141414;border-radius:12px;overflow:hidden;color:#fff;">
          <div style="background:linear-gradient(135deg,#e50914,#b20710);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:28px;letter-spacing:1px;">CineTv+</h1>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="margin:0 0 16px;color:#f59e0b;">Hello, ${name}</h2>
            <p style="font-size:16px;line-height:1.6;color:#ccc;">
              Thank you for your interest in CineTv+. Unfortunately, your access request has <strong style="color:#f87171;">not been approved</strong> at this time.
            </p>
            <p style="font-size:16px;line-height:1.6;color:#ccc;">
              If you believe this is a mistake, please contact our support team for assistance.
            </p>
            <p style="font-size:13px;color:#888;text-align:center;margin-top:28px;">We appreciate your understanding.</p>
          </div>
        </div>
      `,
    },

    revoked: {
      subject: 'Your CineTv+ Access Has Been Revoked',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#141414;border-radius:12px;overflow:hidden;color:#fff;">
          <div style="background:linear-gradient(135deg,#e50914,#b20710);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:28px;letter-spacing:1px;">CineTv+</h1>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="margin:0 0 16px;color:#f87171;">Hello, ${name}</h2>
            <p style="font-size:16px;line-height:1.6;color:#ccc;">
              We're writing to inform you that your access to CineTv+ has been <strong style="color:#f87171;">revoked</strong>.
            </p>
            <p style="font-size:16px;line-height:1.6;color:#ccc;">
              If you have any questions, please reach out to our support team.
            </p>
            <p style="font-size:13px;color:#888;text-align:center;margin-top:28px;">Thank you for being part of CineTv+.</p>
          </div>
        </div>
      `,
    },
  };

  return templates[status] || null;
}
