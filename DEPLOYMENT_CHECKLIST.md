# Railway Deployment Checklist - Instinct.fi

Use this checklist to ensure a smooth deployment to Railway.

## ✅ Pre-Deployment Setup (Completed)

- [x] Added `serve` package to dependencies
- [x] Created production scripts in `package.json`
- [x] Created `railway.json` configuration
- [x] Created `nixpacks.toml` build configuration
- [x] Created `env.template` with all environment variables
- [x] Updated `.gitignore` for environment files
- [x] Created deployment documentation
- [x] Updated README.md with deployment instructions

## 📋 Before Your First Deployment

### 1. Install Dependencies
```bash
cd instinct-chaotic-learn
npm install
```

### 2. Test Production Build Locally
```bash
npm run build
npm run start
```
Visit `http://localhost:8080` and verify the app works correctly.

### 3. Set Up Environment Variables

Review `env.template` and prepare your environment variables:

**Required for Backend Integration:**
- [ ] `VITE_API_BASE_URL` - Your backend API URL
- [ ] `VITE_WS_URL` - WebSocket URL for real-time updates

**Required for Solana:**
- [ ] `VITE_SOLANA_NETWORK` - Network (mainnet-beta/devnet)
- [ ] `VITE_SOLANA_RPC_URL` - RPC endpoint URL
- [ ] `VITE_DRIFT_PROGRAM_ID` - Drift protocol program ID
- [ ] `VITE_WALLET_ADAPTER_NETWORK` - Wallet network setting

**Optional Features:**
- [ ] `VITE_WEB3FORMS_ACCESS_KEY` - For waitlist form
- [ ] `VITE_ENABLE_CHAT` - Enable chat feature
- [ ] `VITE_ENABLE_TUTORIAL` - Enable tutorial mode
- [ ] `VITE_ENABLE_ANALYTICS` - Enable analytics
- [ ] `VITE_ANALYTICS_ID` - Analytics tracking ID
- [ ] `VITE_SENTRY_DSN` - Error tracking

### 4. Commit and Push Changes
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

## 🚀 Railway Deployment Steps

### 1. Create Railway Account
- [ ] Sign up at https://railway.app
- [ ] Connect your GitHub account
- [ ] Verify email address

### 2. Create New Project
- [ ] Go to Railway dashboard
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Set root directory to `instinct-chaotic-learn`

### 3. Configure Build Settings
Railway should auto-detect these from your configuration files. Verify:
- [ ] Build command: `npm run railway:build`
- [ ] Start command: `npm run railway:start`
- [ ] Node.js version: 20

### 4. Set Environment Variables
In Railway dashboard, go to Variables tab and add:
- [ ] Add all required environment variables (see list above)
- [ ] Double-check variable names (must start with `VITE_`)
- [ ] Save all variables

### 5. Deploy
- [ ] Click "Deploy" button
- [ ] Monitor deployment logs
- [ ] Wait for deployment to complete
- [ ] Note the deployment URL

### 6. Post-Deployment Verification
- [ ] Visit your Railway deployment URL
- [ ] Test main landing page loads
- [ ] Test navigation between pages
- [ ] Test wallet connection (if applicable)
- [ ] Test API connectivity (if backend is set up)
- [ ] Check browser console for errors
- [ ] Test on mobile device
- [ ] Verify all environment variables are working

## 🔧 Optional Configuration

### Custom Domain
- [ ] Purchase domain (if not already owned)
- [ ] Add custom domain in Railway settings
- [ ] Update DNS records at domain registrar
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Verify SSL certificate is active

### Monitoring & Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for downtime

### Performance Optimization
- [ ] Enable compression (handled by serve)
- [ ] Verify caching headers
- [ ] Test page load speed
- [ ] Optimize images if needed

## 🐛 Troubleshooting

### If Build Fails
1. [ ] Check Railway logs for error messages
2. [ ] Verify Node.js version compatibility
3. [ ] Ensure all dependencies are in `package.json`
4. [ ] Test build locally: `npm run build`
5. [ ] Check for missing environment variables

### If App Won't Start
1. [ ] Verify start command: `npm run start`
2. [ ] Check port configuration (should be 8080)
3. [ ] Review application logs in Railway
4. [ ] Ensure `dist` folder was created during build

### If Routes Return 404
1. [ ] Verify `serve` is running with `-s` flag (already set)
2. [ ] Check that React Router is configured correctly
3. [ ] Ensure `index.html` exists in `dist` folder

### If Environment Variables Don't Work
1. [ ] Verify variables start with `VITE_` prefix
2. [ ] Check variable names match exactly
3. [ ] Redeploy after adding new variables
4. [ ] Use `import.meta.env.VITE_VAR_NAME` in code

## 📊 Post-Deployment Tasks

### Immediate
- [ ] Test all major user flows
- [ ] Verify mobile responsiveness
- [ ] Check SEO meta tags
- [ ] Test social media sharing
- [ ] Update DNS if using custom domain

### Within 24 Hours
- [ ] Monitor error logs
- [ ] Check analytics data
- [ ] Test from different devices/browsers
- [ ] Verify email notifications work (if applicable)
- [ ] Document any issues found

### Ongoing
- [ ] Set up automated backups (if applicable)
- [ ] Monitor performance metrics
- [ ] Review user feedback
- [ ] Plan updates and improvements
- [ ] Keep dependencies updated

## 📚 Resources

- **Quick Start:** [RAILWAY_QUICKSTART.md](./RAILWAY_QUICKSTART.md)
- **Full Guide:** [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- **Environment Variables:** [env.template](./env.template)
- **Railway Docs:** https://docs.railway.app/
- **Railway Status:** https://status.railway.app/
- **Support:** https://discord.gg/railway

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ App loads without errors
- ✅ All pages are accessible
- ✅ Environment variables work correctly
- ✅ Mobile view works properly
- ✅ No console errors in browser
- ✅ API connections work (if applicable)
- ✅ Custom domain works (if configured)
- ✅ SSL certificate is active
- ✅ Analytics tracking works (if enabled)

---

**Last Updated:** October 2025
**Project:** Instinct.fi Frontend
**Platform:** Railway

