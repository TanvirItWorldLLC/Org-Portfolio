# 🚀 Deploy Org Portfolio to Render

This guide walks you through deploying the Org Portfolio (React + Node.js) to Render.com with zero-config.

---

## 📋 Prerequisites

1. **GitHub account** - Your code should be pushed to GitHub
2. **Render account** - Sign up at [render.com](https://render.com)
3. **Repository ready** - The `render.yaml` blueprint is already in your repo

---

## 🎯 Quick Deploy (Using Blueprint)

### Option 1: One-Click Deploy via Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo: `TanvirItWorldLLC/Org-Portfolio`
4. Render will detect `render.yaml` and create:
   - **org-portfolio-api** (Node.js web service)
   - **org-portfolio-frontend** (Static site)
5. Click **"Apply"** - Render will build and deploy both services

### Option 2: Manual Service Creation

If you prefer manual setup:

---

## 🔧 Manual Setup Steps

### 1. Deploy Backend API (Node.js Web Service)

1. In Render Dashboard → **New +** → **Web Service**
2. Connect repository: `TanvirItWorldLLC/Org-Portfolio`
3. Configure:
   ```
   Name: org-portfolio-api
   Runtime: Node
   Build Command: npm install --workspace=server
   Start Command: npm run start --workspace=server
   Health Check Path: /api/health
   ```
4. **Environment Variables** (add these):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `CLIENT_URL` | `https://org-portfolio-frontend.onrender.com` |
   | `JWT_SECRET` | *(click "Generate" for secure random value)* |
   | `DATABASE_PATH` | `./data/portfolio.json` |
5. **Advanced** → Add **Disk** (optional but recommended for JSON persistence):
   ```
   Name: data
   Mount Path: /opt/render/project/src/server/data
   Size: 1 GB
   ```
6. Click **"Create Web Service"**

### 2. Deploy Frontend (Static Site)

1. In Render Dashboard → **New +** → **Static Site**
2. Connect same repository: `TanvirItWorldLLC/Org-Portfolio`
3. Configure:
   ```
   Name: org-portfolio-frontend
   Build Command: npm install --workspace=client && npm run build --workspace=client
   Publish Directory: client/dist
   ```
4. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://org-portfolio-api.onrender.com/api` |
5. **Routing** (for SPA):
   - Add rewrite rule: `/*` → `/index.html`
6. Click **"Create Static Site"**

---

## ⚙️ Post-Deploy Configuration

### 1. Update CORS Origin

After both services deploy, note the actual URLs:
- Backend: `https://org-portfolio-api.onrender.com`
- Frontend: `https://org-portfolio-frontend.onrender.com`

Update the backend's `CLIENT_URL` env var to match your actual frontend URL.

### 2. Test the Deployment

```bash
# Test API health
curl https://org-portfolio-api.onrender.com/api/health

# Test API endpoints
curl https://org-portfolio-api.onrender.com/api/portfolio

# Test login
curl -X POST https://org-portfolio-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@orgportfolio.com","password":"admin123"}'
```

### 3. Verify Frontend

Visit `https://org-portfolio-frontend.onrender.com` and test:
- ✅ Home page loads with 3D scene
- ✅ Portfolio page shows projects
- ✅ Login/Register works
- ✅ Admin dashboard accessible
- ✅ Order form submits

---

## 🔐 Default Credentials

After first deploy, the database initializes with:
- **Admin Email**: `admin@orgportfolio.com`
- **Admin Password**: `admin123`

**⚠️ Change these immediately after first login!**

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: `npm install` fails in monorepo
```bash
# Solution: Use workspace-specific install
# Build Command: npm install --workspace=server
```

**Issue**: Vite build fails
```bash
# Check Node version compatibility
# Ensure all dependencies are in package.json
```

### Runtime Errors

**Issue**: CORS errors in browser console
- Verify `CLIENT_URL` matches your frontend URL exactly (including https://)
- Check backend logs for CORS middleware errors

**Issue**: API returns 404 for routes
- Ensure `VITE_API_URL` points to `/api` endpoint
- Check browser network tab for actual request URLs

**Issue**: Database not persisting
- Add a **Disk** to the backend service (see step 1.4)
- Verify `DATABASE_PATH` points to disk mount path

### 3D Scene Issues

**Issue**: Three.js canvas not rendering
- Check browser console for WebGL errors
- Ensure `three` and `@react-three/fiber` are in dependencies
- Test in incognito mode (extensions can block WebGL)

---

## 📊 Monitoring

### Render Built-in Monitoring
- **Logs**: Real-time in Render dashboard
- **Metrics**: CPU, Memory, Response time
- **Health Checks**: Automatic via `/api/health`

### Custom Health Check
The API includes:
```
GET /api/health → { "status": "ok", "timestamp": "..." }
```

---

## 💰 Cost Estimation (Free Tier)

| Service | Free Tier Limits |
|---------|-----------------|
| Web Service | 750 hrs/month, 512 MB RAM |
| Static Site | Unlimited bandwidth, 100 GB/month |
| Disk (optional) | 1 GB free |

**Total: $0/month** for typical portfolio usage

---

## 🔄 CI/CD Auto-Deploy

Render auto-deploys on every push to `master`:
1. Push to GitHub → Render detects changes
2. Runs build commands for each service
3. Deploys if build succeeds
4. Rolls back on failure

### Manual Deploy Trigger
```bash
# In Render dashboard → Service → Manual Deploy → Deploy latest commit
```

---

## 🔒 Security Checklist

- [ ] `JWT_SECRET` is generated (not default)
- [ ] `CLIENT_URL` matches exact frontend domain
- [ ] Admin password changed from default
- [ ] HTTPS enforced (automatic on Render)
- [ ] No secrets in code (use env vars)
- [ ] CORS configured correctly
- [ ] Rate limiting considered for production

---

## 📈 Scaling Later

When you need more:
1. **Upgrade plan** → More RAM/CPU
2. **Add PostgreSQL** → Replace JSON with persistent DB
3. **Add Redis** → Session caching, rate limiting
4. **Custom domain** → Settings → Custom Domains
5. **CDN** → Cloudflare in front for global performance

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Project Issues**: GitHub Issues on your repo

---

## 🎉 You're Live!

Once deployed, your 3D portfolio will be accessible at:
- **Frontend**: `https://org-portfolio-frontend.onrender.com`
- **API**: `https://org-portfolio-api.onrender.com`

The admin CMS, order system, and all 3D experiences will work in production!