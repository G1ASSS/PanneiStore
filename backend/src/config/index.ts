import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  payments: {
    kbzpay: {
      merchantCode: process.env.KBZPAY_MERCHANT_CODE || '',
      apiKey: process.env.KBZPAY_API_KEY || '',
      apiUrl: process.env.KBZPAY_API_URL || 'https://api.kbzpay.com/payment/gateway/uat/',
    },
    wavemoney: {
      merchantId: process.env.WAVEMONEY_MERCHANT_ID || '',
      secretKey: process.env.WAVEMONEY_SECRET_KEY || '',
      apiUrl: process.env.WAVEMONEY_API_URL || 'https://payments.wavemoney.io:8107/payment',
    },
    ayapay: {
      merchantUsername: process.env.AYAPAY_MERCHANT_USER_NAME || '',
      apiKey: process.env.AYAPAY_API_KEY || '',
      apiUrl: process.env.AYAPAY_API_URL || 'https://ayapay.com.mm/api',
    },
    uabpay: {
      merchantId: process.env.UABPAY_MERCHANT_ID || '',
      apiKey: process.env.UABPAY_API_KEY || '',
      apiUrl: process.env.UABPAY_API_URL || 'https://uabpay.com.mm/api',
    },
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    maxFiles: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10', 10),
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '',
    adminIds: (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(id => id.trim()).filter(Boolean),
  },
};
