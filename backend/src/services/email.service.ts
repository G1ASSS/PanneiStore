import nodemailer from 'nodemailer';

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || 'PanneiStore <official.glass.acc@gmail.com>';
const SITE_NAME = 'PanneiStore';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://panneistore.vercel.app';
const YEAR = new Date().getFullYear();

// ─── Real icon URLs (icons8 CDN) ─────────────────────────────────────────────
const ICONS = {
  key:      'https://img.icons8.com/fluency/96/key.png',
  welcome:  'https://img.icons8.com/fluency/96/controller.png',
  order:    'https://img.icons8.com/fluency/96/shopping-cart.png',
  approved: 'https://img.icons8.com/fluency/96/ok.png',
  logo:     'https://img.icons8.com/fluency/64/sword.png',
};

// ─── Shared premium layout ────────────────────────────────────────────────────
const layout = (icon: string, accentColor: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0f;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- ── Top logo bar ── -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="${ICONS.logo}" width="30" height="30" alt="" style="display:block;"/>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px;">${SITE_NAME}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Card ── -->
          <tr>
            <td style="background:#13131f;border-radius:20px;border:1px solid #1e1e35;overflow:hidden;">

              <!-- Gradient accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td height="4" style="background:linear-gradient(90deg,${accentColor} 0%,#c084fc 100%);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Icon hero -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:40px 40px 0;">
                    <div style="width:80px;height:80px;background:linear-gradient(135deg,${accentColor}22,${accentColor}44);border-radius:50%;display:inline-block;text-align:center;line-height:80px;border:1px solid ${accentColor}55;">
                      <img src="${icon}" width="44" height="44" alt="" style="display:inline-block;vertical-align:middle;margin-top:18px;"/>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 40px 40px;">
                    ${content}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;color:#3d3d5c;font-size:12px;line-height:1.6;">
                © ${YEAR} ${SITE_NAME} &nbsp;·&nbsp; Mobile Legends Account Marketplace
              </p>
              <p style="margin:8px 0 0;color:#2d2d45;font-size:11px;">
                If you did not request this email, no action is required.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

// ─── Content helpers ──────────────────────────────────────────────────────────
const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px;color:#f1f1ff;font-size:24px;font-weight:700;letter-spacing:-0.5px;text-align:center;">${text}</h1>`;

const sub = (text: string) =>
  `<p style="margin:0 0 24px;color:#7070a0;font-size:14px;line-height:1.6;text-align:center;">${text}</p>`;

const para = (text: string) =>
  `<p style="margin:0 0 16px;color:#9090b8;font-size:14px;line-height:1.7;">${text}</p>`;

const divider = () =>
  `<div style="height:1px;background:#1e1e35;margin:24px 0;"></div>`;

const btn = (text: string, url: string, color: string) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,${color},#c084fc);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.2px;">${text}</a>
      </td>
    </tr>
  </table>`;

const infoRow = (label: string, value: string, valueColor = '#f1f1ff') =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
    <tr>
      <td style="color:#5050780;font-size:13px;color:#50507a;">${label}</td>
      <td align="right" style="color:${valueColor};font-size:13px;font-weight:600;">${value}</td>
    </tr>
  </table>`;

const linkBox = (url: string) =>
  `<div style="margin-top:20px;padding:14px 16px;background:#0d0d1a;border-radius:8px;border:1px solid #1e1e35;">
    <p style="margin:0 0 4px;color:#40407a;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Or copy this link</p>
    <p style="margin:0;color:#6c6cf0;font-size:12px;word-break:break-all;">${url}</p>
  </div>`;

// ─── Send helper ──────────────────────────────────────────────────────────────
const send = (to: string, subject: string, html: string) =>
  transporter.sendMail({ from: FROM, to, subject, html });

// ─── 1. Password Reset ────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const content = `
    ${h1('Reset Your Password')}
    ${sub('We received a request to reset the password for your PanneiStore account.')}
    ${divider()}
    ${para('Click the button below to choose a new password. This link is valid for <strong style="color:#f1f1ff;">1 hour</strong> and can only be used once.')}
    ${btn('Reset My Password', resetLink, '#6c3fe8')}
    ${linkBox(resetLink)}
    ${divider()}
    ${para('If you did not request a password reset, you can safely ignore this email. Your password will not change.')}
  `;
  return send(email, `Reset your ${SITE_NAME} password`, layout(ICONS.key, '#6c3fe8', content));
};

// ─── 2. Welcome Email ─────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (email: string, name: string) => {
  const content = `
    ${h1(`Welcome, ${name}`)}
    ${sub('Your PanneiStore account is ready.')}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:4px 0;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="28" style="vertical-align:top;padding-top:2px;">
                <img src="https://img.icons8.com/fluency/24/checkmark.png" width="16" height="16" alt=""/>
              </td>
              <td style="color:#9090b8;font-size:14px;line-height:1.6;">Browse hundreds of Mobile Legends accounts</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:4px 0;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="28" style="vertical-align:top;padding-top:2px;">
                <img src="https://img.icons8.com/fluency/24/checkmark.png" width="16" height="16" alt=""/>
              </td>
              <td style="color:#9090b8;font-size:14px;line-height:1.6;">Pay securely with KBZ Pay, Wave Money &amp; more</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:4px 0;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="28" style="vertical-align:top;padding-top:2px;">
                <img src="https://img.icons8.com/fluency/24/checkmark.png" width="16" height="16" alt=""/>
              </td>
              <td style="color:#9090b8;font-size:14px;line-height:1.6;">Track every order from your personal dashboard</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${btn('Browse the Marketplace', `${FRONTEND_URL}/market`, '#6c3fe8')}
  `;
  return send(email, `Welcome to ${SITE_NAME}!`, layout(ICONS.welcome, '#6c3fe8', content));
};

// ─── 3. Order Confirmation ────────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  orderType: string,
  amount: number,
) => {
  const content = `
    ${h1('Order Received')}
    ${sub(`Hi ${name}, we have received your order and are reviewing your payment.`)}
    ${divider()}
    <div style="background:#0d0d1a;border-radius:12px;padding:20px;border:1px solid #1e1e35;">
      ${infoRow('Order ID', `#${orderId.slice(-8).toUpperCase()}`)}
      ${infoRow('Type', orderType)}
      ${infoRow('Amount', `MMK ${amount.toLocaleString()}`, '#a78bfa')}
    </div>
    ${btn('View Order Status', `${FRONTEND_URL}/buyer/orders/${orderId}`, '#6c3fe8')}
    ${divider()}
    ${para('Our team will verify your payment and update your order status shortly. You will receive another email once your order is approved.')}
  `;
  return send(email, `Order confirmed — ${SITE_NAME}`, layout(ICONS.order, '#7c3aed', content));
};

// ─── 4. Order Approved ────────────────────────────────────────────────────────
export const sendOrderApprovedEmail = async (
  email: string,
  name: string,
  orderId: string,
) => {
  const content = `
    ${h1('Order Approved')}
    ${sub(`Great news, ${name}. Your payment has been verified.`)}
    ${divider()}
    ${para(`Your order <strong style="color:#f1f1ff;">#${orderId.slice(-8).toUpperCase()}</strong> has been approved. Check your order details page for the account credentials or diamond delivery information.`)}
    ${btn('View Order Details', `${FRONTEND_URL}/buyer/orders/${orderId}`, '#059669')}
    ${divider()}
    ${para('Thank you for shopping with PanneiStore. If you have any questions, please reach out to us on Telegram.')}
  `;
  return send(email, `Order approved — ${SITE_NAME}`, layout(ICONS.approved, '#059669', content));
};
