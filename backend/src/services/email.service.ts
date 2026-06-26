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

const ICONS = {
  key:      'https://img.icons8.com/fluency/96/key.png',
  welcome:  'https://img.icons8.com/fluency/96/controller.png',
  order:    'https://img.icons8.com/fluency/96/shopping-cart.png',
  approved: 'https://img.icons8.com/fluency/96/ok.png',
  logo:     'https://img.icons8.com/fluency/64/sword.png',
  check:    'https://img.icons8.com/fluency/24/checkmark.png',
};

// ─── Language divider ─────────────────────────────────────────────────────────
const langDivider = () => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td width="40%" height="1" style="background:#1e1e35;font-size:0;">&nbsp;</td>
      <td align="center" style="padding:0 12px;">
        <span style="color:#30305a;font-size:11px;white-space:nowrap;">မြန်မာဘာသာ</span>
      </td>
      <td width="40%" height="1" style="background:#1e1e35;font-size:0;">&nbsp;</td>
    </tr>
  </table>`;

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

          <!-- Logo bar -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="${ICONS.logo}" width="30" height="30" alt=""/>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px;">${SITE_NAME}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#13131f;border-radius:20px;border:1px solid #1e1e35;overflow:hidden;">

              <!-- Accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td height="4" style="background:linear-gradient(90deg,${accentColor} 0%,#c084fc 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Icon hero -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:40px 40px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="80" height="80" align="center" style="background:linear-gradient(135deg,${accentColor}22,${accentColor}44);border-radius:50%;border:1px solid ${accentColor}55;">
                          <img src="${icon}" width="42" height="42" alt="" style="display:block;margin:19px auto 0;"/>
                        </td>
                      </tr>
                    </table>
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

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;color:#3d3d5c;font-size:12px;line-height:1.6;">© ${YEAR} ${SITE_NAME} &nbsp;·&nbsp; Mobile Legends Account Marketplace</p>
              <p style="margin:8px 0 0;color:#2d2d45;font-size:11px;">If you did not request this email, no action is required. &nbsp;|&nbsp; ဤအီးမေးလ် မတောင်းဆိုပါက လျစ်လျူရှုနိုင်သည်။</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const h1 = (en: string, my: string) => `
  <h1 style="margin:0 0 4px;color:#f1f1ff;font-size:24px;font-weight:700;letter-spacing:-0.5px;text-align:center;">${en}</h1>
  <h2 style="margin:0 0 12px;color:#8080aa;font-size:16px;font-weight:500;text-align:center;">${my}</h2>`;

const sub = (en: string, my: string) => `
  <p style="margin:0 0 24px;color:#7070a0;font-size:13px;line-height:1.6;text-align:center;">
    ${en}<br/><span style="color:#50507a;">${my}</span>
  </p>`;

const para = (en: string, my: string) => `
  <p style="margin:0 0 6px;color:#9090b8;font-size:14px;line-height:1.7;">${en}</p>
  <p style="margin:0 0 16px;color:#606085;font-size:13px;line-height:1.7;">${my}</p>`;

const divider = () => `<div style="height:1px;background:#1e1e35;margin:24px 0;"></div>`;

const btn = (en: string, my: string, url: string, color: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,${color},#c084fc);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.2px;">
          ${en} &nbsp;·&nbsp; ${my}
        </a>
      </td>
    </tr>
  </table>`;

const checkRow = (en: string, my: string) => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
    <tr>
      <td width="26" style="vertical-align:top;padding-top:2px;">
        <img src="${ICONS.check}" width="16" height="16" alt="✓"/>
      </td>
      <td>
        <span style="color:#9090b8;font-size:14px;">${en}</span>
        <br/><span style="color:#50507a;font-size:12px;">${my}</span>
      </td>
    </tr>
  </table>`;

const infoRow = (label: string, labelMy: string, value: string, valueColor = '#f1f1ff') => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
    <tr>
      <td>
        <span style="color:#50507a;font-size:13px;">${label}</span>
        <br/><span style="color:#38385a;font-size:11px;">${labelMy}</span>
      </td>
      <td align="right" style="color:${valueColor};font-size:14px;font-weight:700;">${value}</td>
    </tr>
  </table>`;

const linkBox = (url: string) => `
  <div style="margin-top:20px;padding:14px 16px;background:#0d0d1a;border-radius:8px;border:1px solid #1e1e35;">
    <p style="margin:0 0 4px;color:#40407a;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Copy link &nbsp;·&nbsp; လင့်ကူးယူပါ</p>
    <p style="margin:0;color:#6c6cf0;font-size:12px;word-break:break-all;">${url}</p>
  </div>`;

const send = (to: string, subject: string, html: string) =>
  transporter.sendMail({ from: FROM, to, subject, html });

// ─── 1. Password Reset ────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const content = `
    ${h1('Reset Your Password', 'စကားဝှက် ပြန်လည်သတ်မှတ်ပါ')}
    ${sub(
      'We received a request to reset your PanneiStore password.',
      'သင့် PanneiStore စကားဝှက် ပြောင်းလဲရန် တောင်းဆိုချက် ရရှိပါသည်။'
    )}
    ${divider()}
    ${para(
      'Click the button below to set a new password. This link is valid for <strong style="color:#f1f1ff;">1 hour</strong> and can only be used once.',
      'အောက်ပါ ခလုပ်ကို နှိပ်၍ စကားဝှက်အသစ် သတ်မှတ်ပါ။ ဤလင့်ခ်သည် <strong style="color:#a78bfa;">၁ နာရီ</strong> သာ သက်တမ်းရှိပြီး တစ်ကြိမ်သာ အသုံးပြုနိုင်သည်။'
    )}
    ${btn('Reset My Password', 'စကားဝှက် ပြောင်းလဲပါ', resetLink, '#6c3fe8')}
    ${linkBox(resetLink)}
    ${divider()}
    ${para(
      'If you did not request a password reset, you can safely ignore this email.',
      'သင် မတောင်းဆိုပါက ဤအီးမေးလ်ကို လျစ်လျူရှုနိုင်သည်။ သင့်စကားဝှက် မပြောင်းလဲပါ။'
    )}
  `;
  return send(email, `Reset your ${SITE_NAME} password | စကားဝှက် ပြန်လည်သတ်မှတ်ပါ`, layout(ICONS.key, '#6c3fe8', content));
};

// ─── 2. Welcome Email ─────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (email: string, name: string) => {
  const content = `
    ${h1(`Welcome, ${name}`, `ကြိုဆိုပါသည်, ${name}`)}
    ${sub('Your PanneiStore account is ready.', 'သင့် PanneiStore အကောင့် အသင့်ဖြစ်ပြီ။')}
    ${divider()}
    ${checkRow(
      'Browse hundreds of MLBB accounts in our marketplace',
      'ကျွန်ုပ်တို့ ဈေးကွက်တွင် MLBB အကောင့်များ ကြည့်ရှုနိုင်သည်'
    )}
    ${checkRow(
      'Pay securely with KBZ Pay, Wave Money & more',
      'KBZ Pay, Wave Money နှင့် အခြားနည်းများဖြင့် လုံခြုံစွာ ငွေပေးချေနိုင်သည်'
    )}
    ${checkRow(
      'Track all your orders from your personal dashboard',
      'Dashboard မှ သင့် Order များကို ခြေရာခံနိုင်သည်'
    )}
    ${btn('Browse the Marketplace', 'ဈေးကွက်သို့ သွားပါ', `${FRONTEND_URL}/market`, '#6c3fe8')}
  `;
  return send(email, `Welcome to ${SITE_NAME}! | ကြိုဆိုပါသည်`, layout(ICONS.welcome, '#6c3fe8', content));
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
    ${h1('Order Received', 'Order လက်ခံပြီ')}
    ${sub(
      `Hi ${name}, we have received your order and are reviewing your payment.`,
      `မင်္ဂလာပါ ${name}၊ သင့် Order ကို လက်ခံပြီး ပေးချေမှု စစ်ဆေးနေပါသည်။`
    )}
    ${divider()}
    <div style="background:#0d0d1a;border-radius:12px;padding:20px;border:1px solid #1e1e35;">
      ${infoRow('Order ID', 'Order နံပါတ်', `#${orderId.slice(-8).toUpperCase()}`)}
      ${infoRow('Type', 'အမျိုးအစား', orderType)}
      ${infoRow('Amount', 'ပမာဏ', `MMK ${amount.toLocaleString()}`, '#a78bfa')}
    </div>
    ${btn('View Order Status', 'Order အခြေအနေ စစ်ဆေးပါ', `${FRONTEND_URL}/buyer/orders/${orderId}`, '#6c3fe8')}
    ${divider()}
    ${para(
      'Our team will verify your payment and update your order status shortly.',
      'ကျွန်ုပ်တို့ team မှ ပေးချေမှု အတည်ပြုပြီး မကြာမီ Order အခြေအနေ အပ်ဒိတ် လုပ်ပေးပါမည်။'
    )}
  `;
  return send(
    email,
    `Order confirmed — ${SITE_NAME} | Order လက်ခံပြီ`,
    layout(ICONS.order, '#7c3aed', content)
  );
};

// ─── 4. Order Approved ────────────────────────────────────────────────────────
export const sendOrderApprovedEmail = async (
  email: string,
  name: string,
  orderId: string,
) => {
  const content = `
    ${h1('Order Approved', 'Order အတည်ပြုပြီ')}
    ${sub(
      `Great news, ${name}. Your payment has been verified.`,
      `သတင်းကောင်း ပါ ${name}၊ သင့်ပေးချေမှု အတည်ပြုပြီ ဖြစ်သည်။`
    )}
    ${divider()}
    ${para(
      `Your order <strong style="color:#f1f1ff;">#${orderId.slice(-8).toUpperCase()}</strong> has been approved. Check your order details page for the account credentials or diamond delivery information.`,
      `သင့် Order <strong style="color:#a78bfa;">#${orderId.slice(-8).toUpperCase()}</strong> အတည်ပြုပြီ ဖြစ်သည်။ အကောင့်အချက်အလက် သို့မဟုတ် Diamond ပေးပို့ မှတ်တမ်းကို Order အသေးစိတ်တွင် ကြည့်ရှုပါ။`
    )}
    ${btn('View Order Details', 'Order အသေးစိတ် ကြည့်ပါ', `${FRONTEND_URL}/buyer/orders/${orderId}`, '#059669')}
    ${divider()}
    ${para(
      'Thank you for shopping with PanneiStore. If you have any questions, please reach out to us on Telegram.',
      'PanneiStore တွင် ဝယ်ယူသောအတွက် ကျေးဇူးတင်ပါသည်။ မေးစရာများ ရှိပါက Telegram မှတဆင့် ဆက်သွယ်ပါ။'
    )}
  `;
  return send(
    email,
    `Order approved — ${SITE_NAME} | Order အတည်ပြုပြီ`,
    layout(ICONS.approved, '#059669', content)
  );
};
