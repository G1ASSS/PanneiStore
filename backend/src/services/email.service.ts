import { Resend } from 'resend';

const FROM     = process.env.EMAIL_FROM || 'PanneiStore <no-reply@panneistore.com>';
const SITE     = 'PanneiStore';
const BASE_URL = process.env.FRONTEND_URL || 'https://panneistore.com';
const YEAR     = new Date().getFullYear();

const ICONS = {
  key:      'https://img.icons8.com/fluency/128/key.png',
  welcome:  'https://img.icons8.com/fluency/128/controller.png',
  order:    'https://img.icons8.com/fluency/128/shopping-cart.png',
  approved: 'https://img.icons8.com/fluency/128/ok.png',
  check:    'https://img.icons8.com/fluency/32/checkmark.png',
};

// ─── Master layout ────────────────────────────────────────────────────────────
// heroGradient : CSS gradient string for the hero banner
// icon         : URL of the large hero icon
// titleEN      : English heading
// titleMY      : Burmese heading
// body         : inner body HTML (goes inside the white/dark card below the hero)
const layout = (
  heroGradient: string,
  icon: string,
  titleEN: string,
  titleMY: string,
  body: string,
) => /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${SITE}</title>
</head>
<body style="margin:0;padding:0;background:#08080f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

<!-- outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#08080f" style="padding:40px 16px 56px;">
<tr><td align="center">

<!-- container -->
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

  <!-- ── Logo row ── -->
  <tr>
    <td align="center" style="padding-bottom:24px;">
      <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
        Pannei<span style="color:#a78bfa;">Store</span>
      </span>
    </td>
  </tr>

  <!-- ── Hero banner ── -->
  <tr>
    <td style="background:${heroGradient};border-radius:20px 20px 0 0;padding:48px 40px 36px;text-align:center;">

    <!-- Title -->
      <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;">${titleEN}</h1>
      <p  style="margin:0;color:rgba(196,181,253,0.85);font-size:15px;font-weight:400;">${titleMY}</p>

    </td>
  </tr>

  <!-- ── Body card ── -->
  <tr>
    <td style="background:#111127;border-radius:0 0 20px 20px;border:1px solid rgba(139,92,246,0.2);border-top:none;padding:32px 40px 36px;">
      ${body}
    </td>
  </tr>

  <!-- ── Footer ── -->
  <tr>
    <td align="center" style="padding-top:28px;">
      <p style="margin:0;color:#2a2a45;font-size:12px;line-height:1.8;">
        © ${YEAR} ${SITE} &nbsp;·&nbsp; Mobile Legends Account Marketplace<br/>
        <span style="font-size:11px;">ဤအီးမေးလ် မတောင်းဆိုပါက လျစ်လျူရှုနိုင်သည်။&nbsp;|&nbsp;If you didn't request this, no action is needed.</span>
      </p>
    </td>
  </tr>

</table><!-- /container -->
</td></tr>
</table><!-- /outer -->

</body>
</html>`;

// ─── Body helpers ─────────────────────────────────────────────────────────────
const p = (en: string, my?: string) =>
  `<p style="margin:0 0 10px;color:#9898c0;font-size:14px;line-height:1.75;">${en}</p>
  ${my ? `<p style="margin:0 0 18px;color:#555578;font-size:13px;line-height:1.75;">${my}</p>` : ''}`;

const rule = () =>
  `<div style="height:1px;background:linear-gradient(90deg,transparent,#2a2a55,transparent);margin:24px 0;"></div>`;

const cta = (en: string, my: string, url: string, from: string, to: string) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
    <tr>
      <td align="center">
        <a href="${url}"
           style="display:inline-block;padding:15px 44px;
                  background:linear-gradient(135deg,${from} 0%,${to} 100%);
                  color:#fff;text-decoration:none;border-radius:50px;
                  font-size:15px;font-weight:700;letter-spacing:0.3px;
                  box-shadow:0 8px 32px ${from}55;">
          ${en}&nbsp;&nbsp;·&nbsp;&nbsp;${my}
        </a>
      </td>
    </tr>
  </table>`;

const linkBox = (url: string) =>
  `<div style="margin-top:16px;padding:12px 16px;background:#0a0a1a;border-radius:10px;border:1px solid #1e1e38;">
    <p style="margin:0 0 4px;color:#35355a;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Copy link &nbsp;·&nbsp; လင့်ကူးယူပါ</p>
    <p style="margin:0;color:#5555a0;font-size:12px;word-break:break-all;">${url}</p>
  </div>`;

const infoCard = (rows: [string, string, string, string, string?][]) =>
  `<div style="background:#0c0c20;border-radius:14px;border:1px solid #1e1e38;padding:20px 24px;margin:20px 0;">
    ${rows.map(([en, my, val, valColor]) =>
      `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td>
            <span style="color:#4a4a78;font-size:12px;display:block;">${en}</span>
            <span style="color:#30304e;font-size:10px;">${my}</span>
          </td>
          <td align="right" style="color:${valColor || '#e0e0ff'};font-size:14px;font-weight:700;vertical-align:middle;">${val}</td>
        </tr>
      </table>`
    ).join('<div style="height:1px;background:#17173a;margin-bottom:12px;"></div>')}
  </div>`;

const checkItem = (en: string, my: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
    <tr>
      <td width="28" style="vertical-align:top;padding-top:1px;">
        <img src="${ICONS.check}" width="18" height="18" alt="✓"/>
      </td>
      <td>
        <span style="color:#9898c0;font-size:14px;display:block;line-height:1.5;">${en}</span>
        <span style="color:#50507a;font-size:12px;line-height:1.5;">${my}</span>
      </td>
    </tr>
  </table>`;

const send = async (to: string, subject: string, html: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set — email not sent.');
    return;
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
};

// ─── 1. Password Reset ────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const body = `
    ${p(
      'We received a request to reset the password for your PanneiStore account.',
      'သင့် PanneiStore အကောင့်၏ စကားဝှက် ပြောင်းလဲရန် တောင်းဆိုချက် ရရှိပါသည်။'
    )}
    ${p(
      'This link is valid for <strong style="color:#c4b5fd;">1 hour</strong> and can only be used once. If you did not make this request, you can safely ignore this email.',
      'ဤလင့်ခ်သည် <strong style="color:#a78bfa;">၁ နာရီ</strong> သာ သက်တမ်းရှိပြီး တစ်ကြိမ်သာ သုံးနိုင်သည်။ မတောင်းဆိုပါက လျစ်လျူရှုနိုင်သည်။'
    )}
    ${cta('Reset My Password', 'စကားဝှက် ပြောင်းလဲပါ', resetLink, '#6d28d9', '#ec4899')}
    ${rule()}
    ${linkBox(resetLink)}
  `;
  return send(
    email,
    `Reset your ${SITE} password | စကားဝှက် ပြန်လည်သတ်မှတ်ပါ`,
    layout('linear-gradient(160deg,#3730a3 0%,#6d28d9 60%,#7c3aed 100%)', ICONS.key,
      'Reset Your Password', 'စကားဝှက် ပြန်လည်သတ်မှတ်ပါ', body)
  );
};

// ─── 2. Welcome ───────────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (email: string, name: string) => {
  const body = `
    ${p(
      `Your account is ready, <strong style="color:#e0e0ff;">${name}</strong>. Here's what you can do right now:`,
      `သင့်အကောင့် အသင့်ဖြစ်ပြီ <strong style="color:#c4b5fd;">${name}</strong>။ ယခု စတင်နိုင်သည်များ —`
    )}
    ${rule()}
    ${checkItem('Browse hundreds of MLBB accounts in the marketplace', 'ဈေးကွက်တွင် MLBB အကောင့်များ ကြည့်ရှုနိုင်သည်')}
    ${checkItem('Pay securely with KBZ Pay, Wave Money & more', 'KBZ Pay, Wave Money ဖြင့် လုံခြုံစွာ ပေးချေနိုင်သည်')}
    ${checkItem('Track all orders from your personal dashboard', 'Dashboard မှ Order များ ခြေရာခံနိုင်သည်')}
    ${rule()}
    ${cta('Browse the Marketplace', 'ဈေးကွက်သို့ သွားပါ', `${BASE_URL}/market`, '#6d28d9', '#8b5cf6')}
  `;
  return send(
    email,
    `Welcome to ${SITE}! | ကြိုဆိုပါသည်`,
    layout('linear-gradient(160deg,#1e1b4b 0%,#4c1d95 55%,#6d28d9 100%)', ICONS.welcome,
      `Welcome, ${name}`, `ကြိုဆိုပါသည်, ${name}`, body)
  );
};

// ─── 3. Order Confirmation ────────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (
  email: string, name: string, orderId: string, orderType: string, amount: number
) => {
  const body = `
    ${p(
      `Hi <strong style="color:#e0e0ff;">${name}</strong>, your order has been received and our team is reviewing your payment.`,
      `မင်္ဂလာပါ <strong style="color:#c4b5fd;">${name}</strong>၊ Order ရရှိပြီး ငွေပေးချေမှု စစ်ဆေးနေပါသည်။`
    )}
    ${infoCard([
      ['Order ID',  'Order နံပါတ်', `#${orderId.slice(-8).toUpperCase()}`, '#c4b5fd'],
      ['Type',      'အမျိုးအစား',   orderType,                            '#e0e0ff'],
      ['Amount',    'ပမာဏ',          `MMK ${amount.toLocaleString()}`,     '#a78bfa'],
    ])}
    ${cta('View Order Status', 'Order အခြေအနေ စစ်ဆေးပါ', `${BASE_URL}/buyer/orders/${orderId}`, '#6d28d9', '#8b5cf6')}
    ${rule()}
    ${p(
      'We will notify you as soon as your order is approved.',
      'Order အတည်ပြုသည်နှင့် အီးမေးလ် ပြန်ပို့ပေးပါမည်။'
    )}
  `;
  return send(
    email,
    `Order confirmed — ${SITE} | Order လက်ခံပြီ`,
    layout('linear-gradient(160deg,#1e1b4b 0%,#5b21b6 55%,#7c3aed 100%)', ICONS.order,
      'Order Received', 'Order လက်ခံပြီ', body)
  );
};

// ─── 4. Order Approved ────────────────────────────────────────────────────────
export const sendOrderApprovedEmail = async (
  email: string, name: string, orderId: string
) => {
  const body = `
    ${p(
      `Great news, <strong style="color:#e0e0ff;">${name}</strong>! Your payment for order <strong style="color:#6ee7b7;">#${orderId.slice(-8).toUpperCase()}</strong> has been verified and approved.`,
      `သတင်းကောင်းပါ <strong style="color:#c4b5fd;">${name}</strong>! Order <strong style="color:#6ee7b7;">#${orderId.slice(-8).toUpperCase()}</strong> အတည်ပြုပြီ ဖြစ်သည်။`
    )}
    ${rule()}
    ${p(
      'Check your order details page for the account credentials or diamond delivery information.',
      'အကောင့်အချက်အလက် သို့မဟုတ် Diamond ပေးပို့မှတ်တမ်းကို Order အသေးစိတ်တွင် ကြည့်ရှုပါ။'
    )}
    ${cta('View Order Details', 'Order အသေးစိတ် ကြည့်ပါ', `${BASE_URL}/buyer/orders/${orderId}`, '#065f46', '#059669')}
    ${rule()}
    ${p(
      'Thank you for shopping with PanneiStore. Reach us on Telegram for any questions.',
      'PanneiStore တွင် ဝယ်ယူသောအတွက် ကျေးဇူးတင်ပါသည်။ မေးစရာများ ရှိပါက Telegram မှ ဆက်သွယ်ပါ။'
    )}
  `;
  return send(
    email,
    `Order approved — ${SITE} | Order အတည်ပြုပြီ`,
    layout('linear-gradient(160deg,#064e3b 0%,#065f46 55%,#059669 100%)', ICONS.approved,
      'Order Approved', 'Order အတည်ပြုပြီ', body)
  );
};
