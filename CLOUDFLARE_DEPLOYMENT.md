# Aura Cloudflare Workers & Pages Deployment Guide

This guide describes how to deploy Aura to Cloudflare Workers / Cloudflare Pages using `wrangler.jsonc`.

---

## 1. Project Configuration Summary

- **Frontend Runtime**: React 18 + Vite (SPA)
- **Backend Runtime**: Node.js / Express API Server (`server.ts`)
- **Static Assets Directory**: `./dist`
- **Configuration File**: `wrangler.jsonc`

---

## 2. SPA Route Fallbacks

Cloudflare Workers routing is configured for SPA single-page fallback across all standard Aura routes:
- `/` (Home Feed)
- `/login` & `/signup` (Authentication)
- `/profile` (Creator Profile & Video Hub)
- `/messages` (Encrypted Aura Messaging & Circles)
- `/settings` (Preferences, Message Retention, Storage Tiers)
- `/creators` (Creators Discovery & WebRTC Communications)
- `/studio` (Heritage & Screenplay Studio)
- `/video` (Video Theater & Generation Pipeline)
- `/creator` (Creator Economy & Tipping)

---

## 3. Deployment Steps via Cloudflare CLI (`wrangler`)

### Step 1: Build the Application
```bash
npm run build
```

### Step 2: Set Production Secrets (Cloudflare Dashboard or Wrangler CLI)
```bash
# Set Gemini API Key for server-side AI endpoints
npx wrangler secret put GEMINI_API_KEY

# Set Paystack Secret Key for banking upgrades
npx wrangler secret put PAYSTACK_SECRET_KEY
```

> **Security Note**: Never commit API keys or Firebase admin credentials into repository source files. All secrets are stored securely in Cloudflare's encrypted environment.

### Step 3: Deploy Worker & Static Assets
```bash
npx wrangler deploy
```

---

## 4. Cloudflare Pages Alternative

If deploying exclusively as static frontend assets on Cloudflare Pages:
- **Build Output Directory**: `dist`
- **Build Command**: `npm run build`
- **Root Directory**: `/`
- Add a `_redirects` file in `public/` containing: `/* /index.html 200`
