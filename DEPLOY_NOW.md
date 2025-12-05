# 🚀 Deploy Now - Step by Step

## ✅ What's Ready

- ✅ Backend tested and working
- ✅ Frontend builds successfully  
- ✅ Database migrations ready
- ✅ All code committed to git
- ✅ Deployment configs created
- ✅ CI/CD workflow ready

## 📤 Step 1: Push to GitHub

**Option A: Use the helper script**
```bash
./deploy.sh
```

**Option B: Manual push**
```bash
# First, create a repo on GitHub: https://github.com/new
# Name it: offline-tasks-pwa
# Don't initialize with README

git remote add origin https://github.com/YOUR_USERNAME/offline-tasks-pwa.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## 🌐 Step 2: Deploy Backend (Render)

1. **Go to**: https://dashboard.render.com
2. **Sign in** (GitHub OAuth works best)
3. **Click**: "New +" → "Web Service"
4. **Connect**: Your GitHub account → Select `offline-tasks-pwa`
5. **Fill in**:
   ```
   Name: offline-tasks-backend
   Environment: Ruby
   Region: Oregon (or closest)
   Branch: main
   Root Directory: backend
   Build Command: bundle install && bin/rails db:migrate
   Start Command: bundle exec puma -C config/puma.rb
   Plan: Free
   ```
6. **Environment Variables**:
   - `RAILS_ENV` = `production`
   - `FRONTEND_ORIGIN` = (leave empty, set after Vercel)
7. **Click**: "Create Web Service"
8. **Add Database**:
   - "New +" → "PostgreSQL"
   - Name: `offline-tasks-db`
   - Plan: Free
   - "Create Database"
   - Go back to web service → "Environment" tab
   - Link database (auto-adds `DATABASE_URL`)
9. **Wait** for first deployment (2-3 minutes)
10. **Copy URL**: `https://offline-tasks-backend.onrender.com` (or similar)

## 🎨 Step 3: Deploy Frontend (Vercel)

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Click**: "Add New..." → "Project"
4. **Import**: `offline-tasks-pwa` repository
5. **Configure**:
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
6. **Environment Variables**:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api/v1`
   - (Use your actual Render backend URL from Step 2)
7. **Click**: "Deploy"
8. **Wait** for deployment (1-2 minutes)
9. **Copy URL**: `https://offline-tasks-pwa.vercel.app` (or similar)

## 🔗 Step 4: Connect Them

1. **Back to Render**:
   - Open your web service
   - "Environment" tab
   - Update `FRONTEND_ORIGIN` = `https://your-vercel-app.vercel.app`
   - "Save Changes" (auto-redeploys)

2. **Test**:
   - Open your Vercel URL
   - Create a task
   - Check it works! 🎉

## 🧪 Test Locally First (Optional)

If you want to test before deploying:

**Terminal 1:**
```bash
cd backend
bin/rails server
```

**Terminal 2:**
```bash
npm run dev
```

Then open: http://localhost:5173

## 📋 Quick Checklist

- [ ] Pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Database added on Render
- [ ] Frontend deployed on Vercel
- [ ] `VITE_API_URL` set in Vercel
- [ ] `FRONTEND_ORIGIN` set in Render
- [ ] Tested creating a task
- [ ] Tested offline mode

## 🆘 Need Help?

- **Render issues**: Check "Logs" tab in dashboard
- **Vercel issues**: Check "Deployments" → "Functions" logs
- **CORS errors**: Verify `FRONTEND_ORIGIN` matches Vercel URL exactly
- **API errors**: Check `VITE_API_URL` is correct

## 🎯 Your Live URLs

After deployment, you'll have:
- **Frontend**: `https://offline-tasks-pwa.vercel.app`
- **Backend**: `https://offline-tasks-backend.onrender.com`

Bookmark these for easy access!

