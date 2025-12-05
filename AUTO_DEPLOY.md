# Automated Deployment Guide

## 🚀 Quick Deploy (All Steps)

### Step 1: Push to GitHub

```bash
# If you haven't created a GitHub repo yet:
# 1. Go to https://github.com/new
# 2. Create a new repository named "offline-tasks-pwa"
# 3. Don't initialize with README (we already have one)

# Then run:
git remote add origin https://github.com/YOUR_USERNAME/offline-tasks-pwa.git
git branch -M main
git push -u origin main
```

Or use the helper script:
```bash
./deploy.sh
```

### Step 2: Deploy Backend to Render

1. **Go to**: https://dashboard.render.com
2. **Sign in** (or create account)
3. **Click**: "New +" → "Web Service"
4. **Connect GitHub**: Authorize Render to access your repos
5. **Select**: `offline-tasks-pwa` repository
6. **Configure**:
   - **Name**: `offline-tasks-backend`
   - **Environment**: `Ruby`
   - **Region**: `Oregon` (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `bundle install && bin/rails db:migrate`
   - **Start Command**: `bundle exec puma -C config/puma.rb`
   - **Plan**: `Free`
7. **Click**: "Advanced" → Add Environment Variables:
   - `RAILS_ENV` = `production`
   - `FRONTEND_ORIGIN` = (leave empty for now, set after Vercel)
8. **Click**: "Create Web Service"
9. **Add Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `offline-tasks-db`
   - Plan: `Free`
   - Click "Create Database"
   - Go back to your web service → "Environment" tab
   - Link the database (Render will auto-add `DATABASE_URL`)
10. **Copy your backend URL**: `https://offline-tasks-backend.onrender.com` (or similar)

### Step 3: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com
2. **Sign in** (or create account with GitHub)
3. **Click**: "Add New..." → "Project"
4. **Import**: Select `offline-tasks-pwa` repository
5. **Configure Project**:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. **Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com/api/v1`
   - (Replace with your actual Render backend URL)
7. **Click**: "Deploy"
8. **Wait** for deployment (1-2 minutes)
9. **Copy your Vercel URL**: `https://offline-tasks-pwa.vercel.app` (or similar)

### Step 4: Connect Backend and Frontend

1. **Go back to Render**:
   - Open your web service
   - Go to "Environment" tab
   - Update `FRONTEND_ORIGIN` = `https://your-vercel-app.vercel.app`
   - Click "Save Changes"
   - Render will automatically redeploy

2. **Test your app**:
   - Open your Vercel URL
   - Create a task
   - Test offline mode (DevTools → Network → Offline)

## ✅ Verification Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] `VITE_API_URL` set in Vercel
- [ ] `FRONTEND_ORIGIN` set in Render
- [ ] Database connected in Render
- [ ] Can create tasks in production
- [ ] Offline mode works
- [ ] PWA installable

## 🔧 Troubleshooting

### Backend Issues

**Build fails:**
- Check Render logs for errors
- Verify `bundle install` completes
- Check database connection

**Database errors:**
- Ensure PostgreSQL is linked
- Check `DATABASE_URL` is set automatically
- Verify migrations ran

### Frontend Issues

**API calls fail:**
- Check `VITE_API_URL` is correct
- Verify backend is running
- Check CORS settings in Render

**Build fails:**
- Check Vercel build logs
- Verify `npm install` works
- Check Node version (should be 18+)

## 📊 Monitoring

- **Render**: Check "Logs" tab for backend errors
- **Vercel**: Check "Deployments" → "Functions" for frontend logs
- **Browser**: DevTools → Console for client-side errors

## 🔄 Updates

After pushing to GitHub:
- **Vercel**: Auto-deploys on push to `main`
- **Render**: Auto-deploys on push to `main` (if enabled)

To disable auto-deploy:
- Vercel: Settings → Git → Disable "Automatic deployments"
- Render: Settings → Auto-Deploy → Disable

