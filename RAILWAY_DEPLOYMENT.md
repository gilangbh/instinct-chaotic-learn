# Railway Deployment Guide - Instinct.fi

This guide provides step-by-step instructions for deploying the Instinct.fi frontend application to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account with this repository
- Node.js 20+ installed locally for testing

## 🚀 Quick Deployment Steps

### 1. Install Dependencies

First, install the `serve` package that was added for production:

```bash
cd instinct-chaotic-learn
npm install
```

### 2. Test Production Build Locally

Before deploying, test the production build locally:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

Visit `http://localhost:8080` to verify everything works correctly.

### 3. Push to GitHub

Ensure all changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 4. Create New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authenticate with GitHub if needed
5. Select your `instinctfi` repository
6. Select the `instinct-chaotic-learn` folder as the root directory

### 5. Configure Build Settings

Railway should auto-detect the configuration from `railway.json` and `nixpacks.toml`. Verify these settings:

- **Build Command:** `npm run railway:build`
- **Start Command:** `npm run railway:start`
- **Root Directory:** `instinct-chaotic-learn`

### 6. Set Environment Variables

In the Railway dashboard, go to **Variables** tab and add your environment variables:

#### Required Variables (if using backend API):
```
VITE_API_BASE_URL=https://your-backend-api.railway.app
VITE_WS_URL=wss://your-backend-api.railway.app
```

#### Solana Configuration:
```
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_DRIFT_PROGRAM_ID=your_drift_program_id_here
VITE_WALLET_ADAPTER_NETWORK=mainnet-beta
```

#### Feature Flags (Optional):
```
VITE_ENABLE_CHAT=true
VITE_ENABLE_TUTORIAL=true
VITE_ENABLE_ANALYTICS=true
```

#### Analytics (Optional):
```
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

See `env.template` for a complete list of available environment variables.

### 7. Deploy

1. Click **"Deploy"** button
2. Railway will automatically:
   - Install dependencies (`npm ci`)
   - Build the application (`npm run build`)
   - Start the server (`npm run start`)
3. Monitor the deployment logs in real-time

### 8. Get Your Deployment URL

Once deployed, Railway will provide a public URL like:
```
https://your-app-name.up.railway.app
```

You can also add a custom domain in the **Settings** tab.

## 📁 Project Structure

```
instinct-chaotic-learn/
├── railway.json          # Railway configuration
├── nixpacks.toml         # Nixpacks build configuration
├── env.template          # Environment variables template
├── package.json          # Updated with production scripts
├── vite.config.ts        # Vite configuration
└── src/                  # Application source code
```

## 🔧 Configuration Files Explained

### `railway.json`
Defines Railway-specific build and deployment settings:
- Build command: `npm run railway:build`
- Start command: `npm run railway:start`
- Restart policy for automatic recovery

### `nixpacks.toml`
Configures the build environment:
- Node.js 20 runtime
- Build and install phases
- Start command

### `package.json` (Updated Scripts)
```json
{
  "scripts": {
    "start": "serve dist -s -l 8080",
    "railway:build": "npm run build",
    "railway:start": "npm run start"
  }
}
```

## 🔍 Troubleshooting

### Build Fails

**Issue:** `npm install` fails during build
**Solution:** 
- Check that `package.json` has all dependencies listed
- Verify Node.js version compatibility (use Node 20)
- Check Railway logs for specific error messages

### App Won't Start

**Issue:** Deployment succeeds but app doesn't respond
**Solution:**
- Verify the start command is correct: `npm run start`
- Check that port 8080 is being used (Railway auto-assigns ports)
- Review application logs in Railway dashboard

### 404 Errors on Routes

**Issue:** React Router routes return 404 on refresh
**Solution:** The `serve` package with `-s` flag already handles this (Single Page App mode). If issues persist:
- Verify the build completed successfully
- Check that `dist` folder contains `index.html`
- Ensure `serve` is running with `-s` flag

### Environment Variables Not Working

**Issue:** App can't access environment variables
**Solution:**
- Ensure all `VITE_` prefixed variables are set in Railway dashboard
- Redeploy after adding new variables
- Verify variables are being used in code correctly: `import.meta.env.VITE_VAR_NAME`

### API Connection Issues

**Issue:** Frontend can't connect to backend API
**Solution:**
- Verify `VITE_API_BASE_URL` is correctly set
- Check CORS configuration on backend
- Ensure backend API is deployed and accessible
- Use Railway internal networking if backend is also on Railway

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to your connected GitHub branch:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Railway automatically detects changes and redeploys

## 📊 Monitoring & Logs

### View Logs
1. Go to Railway dashboard
2. Select your project
3. Click on **"Deployments"** tab
4. Click on a deployment to view logs

### Metrics
Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Request counts

Access metrics in the **"Metrics"** tab of your project.

## 💰 Cost Optimization

Railway offers a free tier with limitations. To optimize costs:

1. **Use efficient build caching:** Railway caches `node_modules`
2. **Minimize build time:** Remove unused dependencies
3. **Monitor usage:** Check Railway dashboard for resource usage
4. **Scale appropriately:** Adjust resources based on traffic

### Estimated Costs
- **Free Tier:** $5 credit/month (usually sufficient for small apps)
- **Pro Plan:** Pay-as-you-go after free tier
- Typical small React app: ~$3-5/month

## 🔐 Security Best Practices

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Use Railway's environment variables** for secrets
3. **Enable HTTPS:** Railway provides automatic SSL certificates
4. **Restrict CORS:** Configure backend API to only accept requests from your domain
5. **Monitor logs:** Regularly check for suspicious activity

## 🌐 Custom Domain Setup

1. In Railway dashboard, go to **Settings** tab
2. Click **"Generate Domain"** or **"Custom Domain"**
3. For custom domain:
   - Add your domain in Railway
   - Update DNS records at your domain registrar:
     ```
     Type: CNAME
     Name: @ (or subdomain)
     Value: your-app.up.railway.app
     ```
4. Wait for DNS propagation (5-60 minutes)

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Serve Package Documentation](https://github.com/vercel/serve)
- [React Router and SPAs](https://reactrouter.com/en/main/guides/deployment)

## 🆘 Support

If you encounter issues:

1. Check Railway status: https://status.railway.app/
2. Review Railway logs in dashboard
3. Check Railway Discord: https://discord.gg/railway
4. Review this project's GitHub issues

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Test build locally: `npm run build && npm run start`
- [ ] Set all required environment variables in Railway
- [ ] Configure custom domain (if applicable)
- [ ] Set up backend API and update `VITE_API_BASE_URL`
- [ ] Test wallet connection on deployment
- [ ] Verify Solana network configuration
- [ ] Enable error tracking (Sentry/similar)
- [ ] Configure analytics (if using)
- [ ] Test all major user flows
- [ ] Set up monitoring and alerts
- [ ] Document deployment process for team

---

**Last Updated:** October 2025
**Version:** 1.0.0
**Project:** Instinct.fi

