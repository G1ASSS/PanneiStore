# PanneiStore.com Deployment Guide

This guide will help you deploy PanneiStore.com to production.

## Architecture Overview

- **Frontend**: Next.js 16 deployed on Vercel
- **Backend**: Express + Socket.io deployed on Railway (supports real-time connections)
- **Database**: MySQL (PlanetScale, Railway MySQL, or your preferred cloud database)
- **File Storage**: Cloudinary for image uploads

## Prerequisites

- GitHub account with the code pushed to a repository
- Vercel account (free tier available)
- Railway account (free tier available)
- Cloudinary account (free tier available)
- PlanetScale or Railway MySQL account (for production database)

## Step 1: Set Up Production Database

### Option A: PlanetScale (Recommended for MySQL)

1. Go to [PlanetScale](https://planetscale.com) and sign up
2. Create a new database named `panneistore`
3. Get your connection string from the dashboard
4. Run the database schema:
   ```bash
   # Import the schema to PlanetScale
   pscale shell panneistore < database/schema.sql
   ```

### Option B: Railway MySQL

1. Go to [Railway](https://railway.app) and sign up
2. Create a new project
3. Add a MySQL database service
4. Get your database connection string

## Step 2: Deploy Backend to Railway

1. Push your code to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Add environment variables (see Environment Variables section below)
7. Deploy the service
8. Note your backend URL (e.g., `https://your-backend.railway.app`)

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL (e.g., `https://your-backend.railway.app`)
   - `NEXT_PUBLIC_DEV_ADMIN`: `false`
6. Click "Deploy"
7. Note your frontend URL (e.g., `https://your-frontend.vercel.app`)

## Step 4: Configure Cloudinary

1. Go to [Cloudinary](https://cloudinary.com) and sign up
2. Get your API credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to your Railway backend environment variables

## Step 5: Configure Payment Gateways (Optional)

For production, you'll need to set up actual payment gateway accounts:

### KBZ Pay, Wave Money, AYA Pay, UAB Pay

Contact each payment gateway provider to get:
- Merchant ID
- API Key
- API Secret

Add these credentials to your Railway backend environment variables.

## Environment Variables

### Backend (Railway)

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app

# Database
DATABASE_URL=mysql://user:password@host:3306/panneistore

# JWT Secrets (Generate secure random strings)
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateways
KBZPAY_MERCHANT_ID=your-kbzpay-id
KBZPAY_API_KEY=your-kbzpay-key
KBZPAY_API_SECRET=your-kbzpay-secret

WAVEMONEY_MERCHANT_ID=your-wavemoney-id
WAVEMONEY_API_KEY=your-wavemoney-key
WAVEMONEY_API_SECRET=your-wavemoney-secret

AYAPAY_MERCHANT_ID=your-ayapay-id
AYAPAY_API_KEY=your-ayapay-key
AYAPAY_API_SECRET=your-ayapay-secret

UABPAY_MERCHANT_ID=your-uabpay-id
UABPAY_API_KEY=your-uabpay-key
UABPAY_API_SECRET=your-uabpay-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
UPLOAD_RATE_LIMIT_MAX_REQUESTS=10

# File Upload
MAX_FILE_SIZE=5242880
MAX_FILES_COUNT=10
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_DEV_ADMIN=false
```

## Step 6: Update Backend CORS Configuration

After deployment, update your backend `src/config/index.ts` to use the production frontend URL:

```typescript
FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
```

## Step 7: Test the Deployment

1. Visit your frontend URL
2. Test user registration and login
3. Test browsing accounts
4. Test the chat functionality (real-time)
5. Test image uploads
6. Test the admin panel

## Troubleshooting

### Frontend Issues

- **API connection errors**: Ensure `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- **Build failures**: Check the Vercel build logs for errors
- **Environment variables not working**: Redeploy after adding environment variables

### Backend Issues

- **Database connection errors**: Verify `DATABASE_URL` is correct
- **Socket.io not working**: Railway supports WebSocket connections by default
- **Image upload failures**: Check Cloudinary credentials

### Database Issues

- **Connection timeouts**: Ensure your database allows connections from Railway/Vercel IPs
- **Schema errors**: Run the schema.sql file on your production database

## Cost Estimates

- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **Railway**: Free tier ($5 free credit/month, then $5/month)
- **PlanetScale**: Free tier (5GB storage, 1 billion rows read)
- **Cloudinary**: Free tier (25GB storage, 25GB bandwidth/month)

## Security Recommendations

1. Use strong, randomly generated JWT secrets
2. Enable HTTPS for all services (automatic on Vercel/Railway)
3. Set up database backups
4. Monitor API usage and rate limits
5. Keep dependencies updated
6. Use environment-specific API keys (don't use test keys in production)

## Custom Domain (Optional)

### Vercel
1. Go to your project settings in Vercel
2. Add your custom domain
3. Update DNS records as instructed

### Railway
1. Go to your project settings in Railway
2. Add your custom domain
3. Update DNS records as instructed

## Monitoring

- **Vercel**: Built-in analytics and logs
- **Railway**: Built-in metrics and logs
- Consider setting up Sentry for error tracking

## Support

For issues with:
- **Vercel**: https://vercel.com/support
- **Railway**: https://docs.railway.app
- **PlanetScale**: https://docs.planetscale.com
- **Cloudinary**: https://cloudinary.com/documentation
