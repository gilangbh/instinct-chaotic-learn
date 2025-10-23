# Railway Quick Start - Instinct.fi

## ⚡ 5-Minute Deployment

### 1. Install Dependencies
```bash
cd instinct-chaotic-learn
npm install
```

### 2. Test Locally
```bash
npm run build
npm run start
# Visit http://localhost:8080
```

### 3. Deploy to Railway

1. **Go to Railway:** https://railway.app/dashboard
2. **New Project** → **Deploy from GitHub**
3. **Select Repository:** `instinctfi` → **Root Directory:** `instinct-chaotic-learn`
4. **Add Environment Variables** (in Railway dashboard):
   ```
   VITE_API_BASE_URL=your_backend_url
   VITE_SOLANA_NETWORK=mainnet-beta
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```
5. **Deploy** → Railway auto-detects config and deploys

### 4. Get Your URL
Railway provides: `https://your-app.up.railway.app`

## 📋 What Was Added for Railway?

1. ✅ **`serve` package** - Static file server for production
2. ✅ **`railway.json`** - Railway configuration
3. ✅ **`nixpacks.toml`** - Build configuration
4. ✅ **`env.template`** - Environment variables template
5. ✅ **Production scripts** in `package.json`:
   - `npm run start` - Serves built files
   - `npm run railway:build` - Production build
   - `npm run railway:start` - Start server

## 🔧 Environment Variables

Copy from `env.template` and set in Railway dashboard:

**Essential:**
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOLANA_NETWORK` - Solana network (mainnet-beta/devnet)
- `VITE_SOLANA_RPC_URL` - Solana RPC endpoint

**Optional:**
- `VITE_ENABLE_CHAT` - Enable/disable chat feature
- `VITE_ENABLE_TUTORIAL` - Enable/disable tutorial
- `VITE_ANALYTICS_ID` - Analytics tracking ID

## 🚨 Common Issues

**Build fails?**
→ Check Railway logs, verify Node.js 20 is used

**404 on routes?**
→ Already fixed with `serve -s` flag

**API not connecting?**
→ Verify `VITE_API_BASE_URL` in Railway variables

**Changes not deploying?**
→ Push to GitHub, Railway auto-deploys

## 📚 Full Documentation

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for complete guide.

## 🔄 Update Deployment

```bash
git add .
git commit -m "Your changes"
git push origin main
# Railway automatically redeploys
```

---

**Need help?** Check [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) or Railway docs at https://docs.railway.app

