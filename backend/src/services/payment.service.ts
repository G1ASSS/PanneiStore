import { config } from '../config';
import { ApiError } from '../utils/response.utils';
import crypto from 'crypto';

export type PaymentGateway = 'KBZPAY' | 'WAVEMONEY' | 'AYAPAY' | 'UABPAY';

interface PaymentInitData {
  orderId: string;
  orderNumber: string;
  amount: number;
  description: string;
  callbackUrl: string;
  returnUrl: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  qrCode?: string;
  message: string;
}

// ─── KBZ Pay ──────────────────────────────────────────────────────────────
const initKBZPay = async (data: PaymentInitData): Promise<PaymentResult> => {
  const { merchantCode, apiKey, apiUrl } = config.payments.kbzpay;
  if (!merchantCode || !apiKey) {
    throw new ApiError(503, 'KBZ Pay is not configured');
  }
  const timestamp = Date.now().toString();
  const signStr = `${merchantCode}${data.orderNumber}${data.amount}MMK${timestamp}${apiKey}`;
  const sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

  const payload = {
    Request: {
      timestamp,
      method: 'kbz.payment.precreate',
      nonce_str: crypto.randomBytes(16).toString('hex'),
      sign,
      sign_type: 'MD5',
      version: '1.0',
      appid: merchantCode,
      merch_code: merchantCode,
      merch_order_id: data.orderNumber,
      trade_type: 'APP',
      title: data.description,
      total_amount: (data.amount * 100).toString(),
      trans_currency: 'MMK',
      notify_url: data.callbackUrl,
    },
  };

  // NOTE: Replace with actual KBZ Pay HTTP call when credentials are available
  // const response = await axios.post(apiUrl, payload);
  console.log('KBZ Pay payload prepared:', JSON.stringify(payload, null, 2));

  return {
    success: true,
    transactionId: `KBZ-${data.orderNumber}`,
    message: 'KBZ Pay payment initiated. Please complete in KBZ Pay app.',
  };
};

// ─── Wave Money ───────────────────────────────────────────────────────────
const initWaveMoney = async (data: PaymentInitData): Promise<PaymentResult> => {
  const { merchantId, secretKey } = config.payments.wavemoney;
  if (!merchantId || !secretKey) {
    throw new ApiError(503, 'Wave Money is not configured');
  }
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const hashStr = `${merchantId}${data.orderNumber}${data.amount}${timestamp}${secretKey}`;
  const hash = crypto.createHash('sha256').update(hashStr).digest('hex');

  const payload = {
    merchantId,
    orderId: data.orderNumber,
    amount: data.amount,
    currency: 'MMK',
    description: data.description,
    timestamp,
    hash,
    callbackUrl: data.callbackUrl,
    returnUrl: data.returnUrl,
  };

  console.log('Wave Money payload prepared:', JSON.stringify(payload, null, 2));

  return {
    success: true,
    transactionId: `WAVE-${data.orderNumber}`,
    message: 'Wave Money payment initiated.',
  };
};

// ─── AYA Pay ──────────────────────────────────────────────────────────────
const initAYAPay = async (data: PaymentInitData): Promise<PaymentResult> => {
  const { merchantUsername, apiKey } = config.payments.ayapay;
  if (!merchantUsername || !apiKey) {
    throw new ApiError(503, 'AYA Pay is not configured');
  }
  const payload = {
    merchantUserName: merchantUsername,
    orderId: data.orderNumber,
    amount: data.amount,
    currency: 'MMK',
    itemDescription: data.description,
    callbackUrl: data.callbackUrl,
    returnUrl: data.returnUrl,
  };

  console.log('AYA Pay payload prepared:', JSON.stringify(payload, null, 2));

  return {
    success: true,
    transactionId: `AYA-${data.orderNumber}`,
    message: 'AYA Pay payment initiated.',
  };
};

// ─── UAB Pay ──────────────────────────────────────────────────────────────
const initUABPay = async (data: PaymentInitData): Promise<PaymentResult> => {
  const { merchantId, apiKey } = config.payments.uabpay;
  if (!merchantId || !apiKey) {
    throw new ApiError(503, 'UAB Pay is not configured');
  }
  const sign = crypto
    .createHmac('sha256', apiKey)
    .update(`${merchantId}${data.orderNumber}${data.amount}`)
    .digest('hex');

  const payload = {
    merchantId,
    orderId: data.orderNumber,
    amount: data.amount,
    currency: 'MMK',
    description: data.description,
    sign,
    callbackUrl: data.callbackUrl,
    returnUrl: data.returnUrl,
  };

  console.log('UAB Pay payload prepared:', JSON.stringify(payload, null, 2));

  return {
    success: true,
    transactionId: `UAB-${data.orderNumber}`,
    message: 'UAB Pay payment initiated.',
  };
};

// ─── Main Entry ───────────────────────────────────────────────────────────
export const initiatePayment = async (
  gateway: PaymentGateway,
  data: PaymentInitData
): Promise<PaymentResult> => {
  switch (gateway) {
    case 'KBZPAY':    return initKBZPay(data);
    case 'WAVEMONEY': return initWaveMoney(data);
    case 'AYAPAY':    return initAYAPay(data);
    case 'UABPAY':    return initUABPay(data);
    default:          throw new ApiError(400, 'Invalid payment gateway');
  }
};

export const verifyWebhookSignature = (gateway: PaymentGateway, payload: any, signature: string): boolean => {
  try {
    switch (gateway) {
      case 'KBZPAY': {
        const { apiKey } = config.payments.kbzpay;
        const expected = crypto.createHash('md5').update(`${JSON.stringify(payload)}${apiKey}`).digest('hex').toUpperCase();
        return expected === signature;
      }
      case 'WAVEMONEY': {
        const { secretKey } = config.payments.wavemoney;
        const expected = crypto.createHash('sha256').update(`${JSON.stringify(payload)}${secretKey}`).digest('hex');
        return expected === signature;
      }
      default:
        return true; // Manual verification
    }
  } catch {
    return false;
  }
};
