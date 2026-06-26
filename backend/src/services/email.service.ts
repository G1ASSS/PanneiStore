import nodemailer from 'nodemailer';

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || 'PanneiStore <official.glass.acc@gmail.com>';
const SITE_NAME = 'PanneiStore';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://panneistore.vercel.app';

// ─── Shared HTML layout ───────────────────────────────────────────────────────
const layout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c3fe8 0%,#9b5cf0 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                ⚔️ ${SITE_NAME}
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Mobile Legends Account Marketplace</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#1a1a2e;padding:40px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#111;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
              <p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} ${SITE_NAME} · All rights reserved</p>
              <p style="margin:6px 0 0;color:#444;font-size:11px;">If you did not request this email, you can safely ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const btn = (text: string, url: string) =>
  `<a href="${url}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#6c3fe8,#9b5cf0);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">${text}</a>`;

const heading = (text: string) =>
  `<h2 style="margin:0 0 16px;color:#fff;font-size:22px;font-weight:700;">${text}</h2>`;

const para = (text: string) =>
  `<p style="margin:0 0 14px;color:#aaa;font-size:15px;line-height:1.6;">${text}</p>`;

// ─── Send helper ──────────────────────────────────────────────────────────────
const send = (to: string, subject: string, html: string) =>
  transporter.sendMail({ from: FROM, to, subject, html });

// ─── 1. Password Reset ────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const html = layout(`
    ${heading('Reset Your Password 🔑')}
    ${para('We received a request to reset your PanneiStore password. Click the button below to set a new password.')}
    ${para('This link will expire in <strong style="color:#9b5cf0;">1 hour</strong>.')}
    <div style="text-align:center;">${btn('Reset My Password', resetLink)}</div>
    <div style="margin-top:28px;padding:16px;background:#111;border-radius:8px;border-left:3px solid #6c3fe8;">
      <p style="margin:0;color:#555;font-size:12px;">Or copy and paste this link into your browser:</p>
      <p style="margin:6px 0 0;color:#7c4dff;font-size:12px;word-break:break-all;">${resetLink}</p>
    </div>
  `);
  return send(email, `Reset Your Password — ${SITE_NAME}`, html);
};

// ─── 2. Welcome Email ─────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = layout(`
    ${heading(`Welcome to ${SITE_NAME}, ${name}! 🎮`)}
    ${para('Your account has been created successfully. You can now browse and purchase Mobile Legends accounts safely.')}
    <div style="margin:20px 0;padding:20px;background:#111;border-radius:12px;">
      <p style="margin:0 0 8px;color:#9b5cf0;font-weight:700;font-size:14px;">✅ What you can do now:</p>
      <p style="margin:4px 0;color:#aaa;font-size:14px;">• Browse hundreds of MLBB accounts in our marketplace</p>
      <p style="margin:4px 0;color:#aaa;font-size:14px;">• Buy accounts securely with local Myanmar payment methods</p>
      <p style="margin:4px 0;color:#aaa;font-size:14px;">• Track your orders from your dashboard</p>
    </div>
    <div style="text-align:center;">${btn('Browse Accounts', `${FRONTEND_URL}/market`)}</div>
  `);
  return send(email, `Welcome to ${SITE_NAME}! 🎮`, html);
};

// ─── 3. Order Confirmation ────────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  orderType: string,
  amount: number,
) => {
  const html = layout(`
    ${heading('Order Confirmed! 🛒')}
    ${para(`Hi <strong style="color:#fff;">${name}</strong>, your order has been placed successfully and is now being reviewed.`)}
    <div style="margin:20px 0;padding:20px;background:#111;border-radius:12px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#666;font-size:13px;padding:6px 0;">Order ID</td>
          <td style="color:#fff;font-size:13px;text-align:right;font-weight:600;">#${orderId.slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:13px;padding:6px 0;">Type</td>
          <td style="color:#fff;font-size:13px;text-align:right;">${orderType}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:13px;padding:6px 0;border-top:1px solid #222;">Amount</td>
          <td style="color:#9b5cf0;font-size:16px;text-align:right;font-weight:800;border-top:1px solid #222;">MMK ${amount.toLocaleString()}</td>
        </tr>
      </table>
    </div>
    ${para('Our team will review your payment and confirm your order shortly.')}
    <div style="text-align:center;">${btn('View My Order', `${FRONTEND_URL}/buyer/orders/${orderId}`)}</div>
  `);
  return send(email, `Order Confirmed — ${SITE_NAME}`, html);
};

// ─── 4. Order Approved ────────────────────────────────────────────────────────
export const sendOrderApprovedEmail = async (
  email: string,
  name: string,
  orderId: string,
) => {
  const html = layout(`
    ${heading('Your Order is Approved! ✅')}
    ${para(`Great news, <strong style="color:#fff;">${name}</strong>! Your payment has been verified and your order <strong style="color:#9b5cf0;">#${orderId.slice(-8).toUpperCase()}</strong> has been approved.`)}
    ${para('Check your order details for the account credentials or diamond delivery information.')}
    <div style="text-align:center;">${btn('View Order Details', `${FRONTEND_URL}/buyer/orders/${orderId}`)}</div>
  `);
  return send(email, `Order Approved — ${SITE_NAME}`, html);
};
